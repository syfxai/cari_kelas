import json
import os
import time
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

app = FastAPI(title="KPTM Timetable Scraper API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

EDUPAGE_URL = "https://kptmipoh.edupage.org/timetable/"


class ReplacementRequest(BaseModel):
    teacher: str
    class_name: str
    source_day: str
    source_time: str
    source_time_end: str
    classroom: str = ""


def parse_timetable(raw_data):
    tables = {t["id"]: t.get("data_rows", []) for t in raw_data["r"]["dbiAccessorRes"]["tables"]}

    periods = {p["id"]: p for p in tables.get("periods", [])}
    days = {d["id"]: d for d in tables.get("days", [])}
    classes = {c["id"]: c for c in tables.get("classes", [])}
    teachers = {t["id"]: t for t in tables.get("teachers", [])}
    subjects = {s["id"]: s for s in tables.get("subjects", [])}
    classrooms = {r["id"]: r for r in tables.get("classrooms", [])}
    lessons = {l["id"]: l for l in tables.get("lessons", [])}
    cards = tables.get("cards", [])

    def normalize_time(value, period_number):
        if not value:
            return value
        hour, minute = map(int, value.split(":"))
        if int(period_number or 0) >= 6 and hour < 8:
            hour += 12
        return f"{hour:02d}:{minute:02d}"

    teacher_slots = {}
    class_slots = {}
    room_slots = {}

    for card in cards:
        lesson_id = card.get("lessonid", "")
        lesson = lessons.get(lesson_id, {})
        if not lesson:
            continue

        subject_id = lesson.get("subjectid", "")
        subject = subjects.get(subject_id, {})
        subject_name = subject.get("name", subject.get("short", "Unknown"))

        teacher_ids = lesson.get("teacherids", [])
        teacher_names = []
        for tid in teacher_ids:
            t = teachers.get(tid, {})
            if t:
                teacher_names.append(t.get("short", "Unknown"))

        class_ids = lesson.get("classids", [])
        class_names = []
        for cid in class_ids:
            c = classes.get(cid, {})
            if c:
                class_names.append(c.get("name", "Unknown"))

        period_id = card.get("period", "")
        period = periods.get(period_id, {})
        period_num = period.get("period", period_id)
        time_start = normalize_time(period.get("starttime", ""), period_num)
        time_end = normalize_time(period.get("endtime", ""), period_num)

        days_mask = card.get("days", "00000")
        for day_idx, bit in enumerate(days_mask):
            if bit == "1" and str(day_idx) in days:
                day_name = days[str(day_idx)]["name"]

                room_ids = card.get("classroomids", [])
                room_names = []
                for rid in room_ids:
                    if rid.startswith("*"):
                        rid = rid
                    r = classrooms.get(rid, {})
                    if r:
                        room_names.append(r.get("name", "Unknown"))

                slot = {
                    "day": day_name,
                    "period": period_num,
                    "time": time_start,
                    "timeEnd": time_end,
                    "subject": subject_name,
                    "teacher": ", ".join(teacher_names) if teacher_names else "",
                    "class": ", ".join(class_names) if class_names else "",
                    "classroom": ", ".join(room_names) if room_names else "",
                }

                for tname in teacher_names:
                    teacher_slots.setdefault(tname, []).append(slot)
                for cname in class_names:
                    class_slots.setdefault(cname, []).append(slot)
                for rname in room_names:
                    room_slots.setdefault(rname, []).append(slot)

    teacher_list = [
        {"id": t["id"], "name": t["short"], "slots": teacher_slots.get(t["short"], [])}
        for t in teachers.values() if not t.get("cb_hidden", False)
    ]
    class_list = [
        {"id": c["id"], "name": c["name"], "short": c.get("short", c["name"]), "slots": class_slots.get(c["name"], [])}
        for c in classes.values()
    ]
    room_list = [
        {"id": r["id"], "name": r["name"], "slots": room_slots.get(r["name"], [])}
        for r in classrooms.values()
    ]

    return {
        "teachers": teacher_list,
        "classes": class_list,
        "rooms": room_list,
        "totalSlots": sum(len(v) for v in class_slots.values()),
        "scrapedAt": datetime.now().isoformat(),
    }


def scrape_with_selenium():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.set_capability("goog:loggingPrefs", {"performance": "ALL"})

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)

    try:
        driver.get(EDUPAGE_URL)
        time.sleep(15)

        logs = driver.get_log("performance")
        response_ids = {}
        for entry in logs:
            try:
                log = json.loads(entry["message"])
                msg = log["message"]
                if msg["method"] == "Network.responseReceived":
                    url = msg["params"]["response"]["url"]
                    if "regulartt.js" in url and "__func=regularttGetData" in url:
                        response_ids["regulartt"] = msg["params"]["requestId"]
            except Exception:
                pass

        if "regulartt" not in response_ids:
            raise Exception("Gagal mendapat data regularttGetData dari EduPage")

        body = driver.execute_cdp_cmd(
            "Network.getResponseBody", {"requestId": response_ids["regulartt"]}
        )
        raw_data = json.loads(body["body"])
        return raw_data

    finally:
        driver.quit()


DAY_ORDER = {
    "Monday": 0,
    "Tuesday": 1,
    "Wednesday": 2,
    "Thursday": 3,
    "Friday": 4,
    "Saturday": 5,
    "Sunday": 6,
}

DAY_BASE_SLOTS = {
    "Monday": [("08:00", "09:00"), ("09:00", "10:00"), ("10:00", "11:00"), ("11:00", "12:00"), ("12:00", "13:00"), ("13:00", "14:00"), ("14:00", "15:00"), ("15:00", "16:00"), ("16:00", "17:00"), ("17:00", "18:00")],
    "Tuesday": [("08:00", "09:00"), ("09:00", "10:00"), ("10:00", "11:00"), ("11:00", "12:00"), ("12:00", "13:00"), ("13:00", "14:00"), ("14:00", "15:00"), ("15:00", "16:00"), ("16:00", "17:00"), ("17:00", "18:00")],
    "Wednesday": [("08:00", "09:00"), ("09:00", "10:00"), ("10:00", "11:00"), ("11:00", "12:00"), ("12:00", "13:00"), ("13:00", "14:00"), ("14:00", "15:00"), ("15:00", "16:00"), ("16:00", "17:00")],
    "Thursday": [("08:00", "09:00"), ("09:00", "10:00"), ("10:00", "11:00"), ("11:00", "12:00"), ("12:00", "13:00"), ("13:00", "14:00"), ("14:00", "15:00"), ("15:00", "16:00"), ("16:00", "17:00")],
    "Friday": [("08:00", "09:00"), ("09:00", "10:00"), ("10:00", "11:00")],
}


def normalize_time_str(value: str) -> str:
    if not value:
        return value
    hour, minute = map(int, value.split(":"))
    if 1 <= hour <= 7:
        hour += 12
    return f"{hour:02d}:{minute:02d}"


def time_to_minutes(value):
    hours, minutes = value.split(":")
    return int(hours) * 60 + int(minutes)


def slots_overlap(first, second):
    return (
        time_to_minutes(first["time"]) < time_to_minutes(second["timeEnd"])
        and time_to_minutes(second["time"]) < time_to_minutes(first["timeEnd"])
    )


def matching_slots(slots, day, candidate):
    return [
        slot for slot in slots
        if slot["day"] == day and slots_overlap(slot, candidate)
    ]


def room_category(name):
    normalized = name.upper()
    if "ONLINE" in normalized:
        return "online"
    if "MAKMAL" in normalized or "LAB" in normalized:
        return "lab"
    if "BILIK KULIAH" in normalized or normalized.startswith("BK"):
        return "lecture"
    return "other"


def load_cached_data():
    cache_file = DATA_DIR / "timetable.json"
    if not cache_file.exists():
        raise HTTPException(status_code=404, detail="Data belum discrap. Sila scrap dahulu.")
    with open(cache_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    for entity_type in ("teachers", "classes", "rooms"):
        for entity in data.get(entity_type, []):
            for slot in entity.get("slots", []):
                for key in ("time", "timeEnd"):
                    if slot.get(key):
                        slot[key] = normalize_time_str(slot[key])
    return data


def replacement_options(request, data):
    teacher = next(
        (item for item in data["teachers"] if item["name"].lower() == request.teacher.lower()),
        None,
    )
    selected_class = next(
        (item for item in data["classes"] if item["name"].lower() == request.class_name.lower()),
        None,
    )

    if not teacher:
        raise HTTPException(status_code=404, detail="Pensyarah tidak dijumpai.")
    if not selected_class:
        raise HTTPException(status_code=404, detail="Kelas tidak dijumpai.")

    norm_source_start = normalize_time_str(request.source_time)
    norm_source_end = normalize_time_str(request.source_time_end)

    source_slot = next(
        (
            slot for slot in selected_class["slots"]
            if slot["day"].lower() == request.source_day.lower()
            and (slot["time"] == norm_source_start or slot["time"] == request.source_time)
        ),
        None,
    )
    if not source_slot:
        # Fallback search by day and partial time
        source_slot = next(
            (
                slot for slot in selected_class["slots"]
                if slot["day"].lower() == request.source_day.lower()
                and (
                    slots_overlap(
                        slot,
                        {"time": norm_source_start, "timeEnd": norm_source_end},
                    )
                )
            ),
            None,
        )

    if not source_slot:
        raise HTTPException(status_code=400, detail="Slot asal tidak dijumpai untuk kelas ini.")

    source_duration_hours = max(
        1,
        (time_to_minutes(norm_source_end) - time_to_minutes(norm_source_start)) // 60,
    )

    source = {
        "day": request.source_day,
        "time": norm_source_start,
        "timeEnd": norm_source_end,
        "durationHours": source_duration_hours,
        "subject": source_slot.get("subject", ""),
        "classroom": source_slot.get("classroom", ""),
    }

    # Generate candidate period windows for durations 1, 2, and 3 hours
    candidates = []
    days_to_check = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    for day in days_to_check:
        slots_list = DAY_BASE_SLOTS.get(day, [])
        # Include 1-hour, 2-hour, and 3-hour windows
        durations = [1, 2, 3]
        if source_duration_hours not in durations:
            durations.append(source_duration_hours)

        for num_hours in sorted(durations):
            if num_hours > len(slots_list):
                continue
            for i in range(len(slots_list) - num_hours + 1):
                start = slots_list[i][0]
                end = slots_list[i + num_hours - 1][1]
                p_start = i + 1
                p_end = i + num_hours
                p_label = f"Waktu {p_start}" if p_start == p_end else f"Waktu {p_start}–{p_end}"
                candidates.append({
                    "day": day,
                    "time": start,
                    "timeEnd": end,
                    "periodStart": p_start,
                    "periodEnd": p_end,
                    "durationHours": num_hours,
                    "periodLabel": p_label,
                })

    # Sort candidates strictly by Day index, start time, and duration
    candidates.sort(
        key=lambda item: (
            DAY_ORDER.get(item["day"], 99),
            time_to_minutes(item["time"]),
            item["durationHours"],
        )
    )

    room_name = request.classroom or source_slot.get("classroom", "")
    category = room_category(room_name) if room_name else "other"
    all_rooms = data["rooms"]

    available = []
    conflicts = []

    for cand in candidates:
        day = cand["day"]
        class_conflicts = matching_slots(selected_class["slots"], day, cand)
        teacher_conflicts = matching_slots(teacher["slots"], day, cand)

        reasons = []
        if class_conflicts:
            reasons.append({
                "type": "class",
                "message": f"{selected_class['name']} sudah mempunyai kelas pada waktu ini.",
                "slot": class_conflicts[0],
            })
        if teacher_conflicts:
            conflict = teacher_conflicts[0]
            reasons.append({
                "type": "teacher",
                "message": f"{teacher['name']} sedang mengajar {conflict.get('class') or 'kelas lain'}.",
                "slot": conflict,
            })

        # Calculate free rooms for this slot
        available_rooms = []
        for room in all_rooms:
            r_conflicts = matching_slots(room["slots"], day, cand)
            if not r_conflicts:
                r_cat = room_category(room["name"])
                is_online = "ONLINE" in room["name"].upper()
                available_rooms.append({
                    "id": room["id"],
                    "name": room["name"],
                    "category": r_cat,
                    "isOnline": is_online,
                })

        # Sort rooms: Physical first, then by name
        available_rooms.sort(key=lambda r: (1 if r["isOnline"] else 0, r["name"]))

        result_item = {
            **cand,
            "roomCategory": category,
            "rooms": available_rooms,
        }

        if reasons:
            conflicts.append({**result_item, "reasons": reasons})
        else:
            available.append(result_item)

    return {
        "source": source,
        "available": available,
        "conflicts": conflicts,
    }


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/replacement/options")
async def get_replacement_options(request: ReplacementRequest):
    return {"success": True, "data": replacement_options(request, load_cached_data())}


@app.post("/api/scrape")
async def scrape():
    try:
        raw_data = scrape_with_selenium()
        data = parse_timetable(raw_data)

        cache_file = DATA_DIR / "timetable.json"
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        return {
            "success": True,
            "message": f"Scraping selesai! {data['totalSlots']} slot jadual dijumpai.",
            "data": {
                "teachers": len(data["teachers"]),
                "classes": len(data["classes"]),
                "rooms": len(data["rooms"]),
                "totalSlots": data["totalSlots"],
                "scrapedAt": data["scrapedAt"],
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/teachers")
async def get_teachers():
    data = load_cached_data()
    return {"success": True, "data": data["teachers"]}


@app.get("/api/teachers/{name}")
async def get_teacher(name: str):
    data = load_cached_data()
    for t in data["teachers"]:
        if t["name"].lower() == name.lower():
            return {"success": True, "data": t}
    for t in data["teachers"]:
        if name.lower() in t["name"].lower():
            return {"success": True, "data": t}
    raise HTTPException(status_code=404, detail=f"Pensyarah '{name}' tidak dijumpai.")


@app.get("/api/classes")
async def get_classes():
    data = load_cached_data()
    return {"success": True, "data": data["classes"]}


@app.get("/api/classes/{name}")
async def get_class(name: str):
    data = load_cached_data()
    for c in data["classes"]:
        if c["name"].lower() == name.lower():
            return {"success": True, "data": c}
    for c in data["classes"]:
        if name.lower() in c["name"].lower():
            return {"success": True, "data": c}
    raise HTTPException(status_code=404, detail=f"Kelas '{name}' tidak dijumpai.")


@app.get("/api/rooms")
async def get_rooms():
    data = load_cached_data()
    return {"success": True, "data": data["rooms"]}


@app.get("/api/rooms/available")
async def get_available_rooms(day: str, time: str, time_end: str = ""):
    data = load_cached_data()

    norm_time = normalize_time_str(time)
    if time_end:
        norm_time_end = normalize_time_str(time_end)
    else:
        start_min = time_to_minutes(norm_time)
        end_min = start_min + 60
        norm_time_end = f"{end_min // 60:02d}:{end_min % 60:02d}"

    if time_to_minutes(norm_time_end) <= time_to_minutes(norm_time):
        start_min = time_to_minutes(norm_time)
        end_min = start_min + 60
        norm_time_end = f"{end_min // 60:02d}:{end_min % 60:02d}"

    candidate = {
        "time": norm_time,
        "timeEnd": norm_time_end,
    }

    start_m = time_to_minutes(norm_time)
    end_m = time_to_minutes(norm_time_end)
    duration_hours = max(1, round((end_m - start_m) / 60))

    available = []
    occupied_rooms = []

    for r in data["rooms"]:
        conflicts = matching_slots(r.get("slots", []), day, candidate)
        cat = room_category(r["name"])
        is_online = cat == "online"

        room_info = {
            "id": r["id"],
            "name": r["name"],
            "category": cat,
            "isOnline": is_online,
            "totalSlots": len(r.get("slots", [])),
        }

        if not conflicts:
            available.append(room_info)
        else:
            occupied_rooms.append({
                **room_info,
                "slot": conflicts[0],
                "conflictSlots": conflicts,
            })

    cat_order = {"lab": 0, "lecture": 1, "other": 2, "online": 3}
    available.sort(key=lambda r: (cat_order.get(r["category"], 99), r["name"]))
    occupied_rooms.sort(key=lambda r: (cat_order.get(r["category"], 99), r["name"]))

    return {
        "success": True,
        "data": {
            "day": day,
            "time": norm_time,
            "timeEnd": norm_time_end,
            "durationHours": duration_hours,
            "totalRooms": len(data["rooms"]),
            "availableCount": len(available),
            "occupiedCount": len(occupied_rooms),
            "available": available,
            "occupied": occupied_rooms,
        },
    }



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
