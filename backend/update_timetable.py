import urllib.request
import json
from datetime import datetime
from pathlib import Path
from main import parse_timetable

headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://kptmipoh.edupage.org/'
}

def update_all():
    year = datetime.now().year
    print(f'1. Fetching TTViewer data for year {year}...')
    req1 = urllib.request.Request(
        'https://kptmipoh.edupage.org/timetable/server/ttviewer.js?__func=getTTViewerData',
        data=json.dumps({'__args': [None, year], '__gsh': '00000000'}).encode('utf-8'),
        headers=headers
    )
    with urllib.request.urlopen(req1) as res1:
        tt_data = json.loads(res1.read().decode('utf-8'))
    
    default_num = tt_data.get('r', {}).get('regular', {}).get('default_num', '36')
    print(f'Active timetable number: {default_num}')

    print(f'2. Fetching regulartt data for tt #{default_num}...')
    req2 = urllib.request.Request(
        'https://kptmipoh.edupage.org/timetable/server/regulartt.js?__func=regularttGetData',
        data=json.dumps({'__args': [None, str(default_num)], '__gsh': '00000000'}).encode('utf-8'),
        headers=headers
    )
    with urllib.request.urlopen(req2) as res2:
        raw_data = json.loads(res2.read().decode('utf-8'))

    backend_dir = Path(__file__).parent
    root_dir = backend_dir.parent
    raw_file = backend_dir / 'data' / 'raw_edupage.json'

    try:
        with urllib.request.urlopen(req2, timeout=60) as res2:
            raw_data = json.loads(res2.read().decode('utf-8'))
        print(f'3. Saving raw data to {raw_file}...')
        with open(raw_file, 'w', encoding='utf-8') as f:
            json.dump(raw_data, f, ensure_ascii=False)
    except Exception as fetch_err:
        print(f'Warning fetching live regulartt: {fetch_err}')
        if raw_file.exists():
            print(f'3. Using cached raw data from {raw_file}...')
            with open(raw_file, 'r', encoding='utf-8') as f:
                raw_data = json.load(f)
        else:
            raise

    print('4. Parsing timetable...')
    parsed = parse_timetable(raw_data)
    num_teachers = len(parsed['teachers'])
    num_classes = len(parsed['classes'])
    num_rooms = len(parsed['rooms'])
    total_slots = parsed['totalSlots']
    print(f'Found: {num_teachers} teachers, {num_classes} classes, {num_rooms} rooms, {total_slots} total slots.')

    backend_json = backend_dir / 'data' / 'timetable.json'
    src_json = root_dir / 'src' / 'data' / 'timetable.json'
    prev_json = root_dir / 'src' / 'data' / 'timetable_previous.json'

    # Backup current to previous if previous is missing or identical
    if src_json.exists() and not prev_json.exists():
        print(f'Backing up old timetable to {prev_json}...')
        with open(src_json, 'r', encoding='utf-8') as f_in, open(prev_json, 'w', encoding='utf-8') as f_out:
            f_out.write(f_in.read())

    print(f'5. Writing to {backend_json}...')
    with open(backend_json, 'w', encoding='utf-8') as f:
        json.dump(parsed, f, ensure_ascii=False, indent=2)

    print(f'6. Writing to {src_json}...')
    with open(src_json, 'w', encoding='utf-8') as f:
        json.dump(parsed, f, ensure_ascii=False, indent=2)

    print('DONE! Timetable successfully updated.')

if __name__ == '__main__':
    update_all()
