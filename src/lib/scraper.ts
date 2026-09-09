import puppeteer from 'puppeteer';
import type { Browser, Page } from 'puppeteer';
import type { ScrapeResult, TimetableSlot, TeacherData, ClassData, RoomData } from './types';

const BASE_URL = 'https://kptmipoh.edupage.org/timetable/';

function findBrowserPath(): string | undefined {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  const fs = require('fs');
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {}
  }
  return undefined;
}

async function launchBrowser(): Promise<Browser> {
  const execPath = findBrowserPath();
  if (!execPath) {
    throw new Error('Tiada pelayar web dijumpai. Sila pastikan Chrome atau Edge dipasang.');
  }
  return puppeteer.launch({
    headless: true,
    executablePath: execPath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
}

async function waitForTimetable(page: Page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  // Wait for the React timetable component to render
  await page.waitForFunction(() => {
    const tabs = document.querySelectorAll('span');
    return Array.from(tabs).some(t => t.textContent?.trim() === 'TEACHERS');
  }, { timeout: 30000 });
  await page.waitForTimeout(2000);
}

// Click the TEACHERS tab and extract all teacher names from dropdown
async function extractTeacherNames(page: Page): Promise<string[]> {
  // Click on TEACHERS tab
  await page.evaluate(() => {
    const spans = document.querySelectorAll('span');
    for (const span of spans) {
      if (span.textContent?.trim() === 'TEACHERS') {
        span.click();
        return;
      }
    }
  });
  await page.waitForTimeout(2000);

  // Extract names from the dropdown menu that appeared
  const names = await page.evaluate(() => {
    const result: string[] = [];
    // The dropdown items are in a menu/panel that appears after clicking TEACHERS
    // Look for menu items with teacher names
    const menuItems = document.querySelectorAll('[class*="menuItem"], [class*="MenuItem"], [class*="menu-item"]');
    for (const item of menuItems) {
      const text = item.textContent?.trim();
      if (text && text.length > 2) {
        result.push(text);
      }
    }

    // Also try looking for any visible dropdown/popup with names
    if (result.length === 0) {
      const allDivs = document.querySelectorAll('div, span, li, a');
      for (const el of allDivs) {
        const style = window.getComputedStyle(el);
        const text = el.textContent?.trim();
        // Look for visible elements that look like name items in a dropdown
        if (style.display !== 'none' && style.visibility !== 'hidden' &&
            text && text.length > 3 && text.length < 50 &&
            !text.includes('TEACHERS') && !text.includes('CLASSES') &&
            !text.includes('CLASSROOMS') && !text.includes('REGULAR') &&
            !text.includes('KPTM') && !text.includes('EDUPAGE') &&
            !text.includes('LOGIN') && !text.includes('Utama') &&
            !text.includes('Jadual') && !text.includes('Monday') &&
            !text.includes('Tuesday') && !text.includes('Wednesday') &&
            !text.includes('Thursday') && !text.includes('Friday') &&
            !text.includes('Mon') && !text.includes('Tue') &&
            !text.includes('Wed') && !text.includes('Thu') && !text.includes('Fri')) {
          // Check if it's inside a dropdown menu (not the main nav)
          const parent = el.closest('[class*="menu"], [class*="Menu"], [class*="dropdown"], [class*="Dropdown"], [class*="popup"], [class*="Popup"]');
          if (parent) {
            result.push(text);
          }
        }
      }
    }
    return [...new Set(result)];
  });

  return names;
}

// Click on a teacher name and extract their timetable
async function scrapeTeacherTimetable(page: Page, teacherName: string): Promise<TimetableSlot[]> {
  // First click TEACHERS tab
  await page.evaluate(() => {
    const spans = document.querySelectorAll('span');
    for (const span of spans) {
      if (span.textContent?.trim() === 'TEACHERS') {
        span.click();
        return;
      }
    }
  });
  await page.waitForTimeout(1500);

  // Click on the specific teacher name
  const clicked = await page.evaluate((name) => {
    const spans = document.querySelectorAll('span, div, a, li');
    for (const el of spans) {
      if (el.textContent?.trim() === name) {
        (el as HTMLElement).click();
        return true;
      }
    }
    return false;
  }, teacherName);

  if (!clicked) return [];
  await page.waitForTimeout(3000);

  // Extract timetable from the grid
  return page.evaluate(() => {
    const slots: Array<{day: string; time: string; timeEnd: string; subject: string; teacher: string; classroom: string; class: string}> = [];

    // The timetable is a table with days as rows and time periods as columns
    const table = document.querySelector('table');
    if (!table) return slots;

    const rows = table.querySelectorAll('tr');
    const dayMap: Record<string, string> = {
      'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday',
      'Thu': 'Thursday', 'Fri': 'Friday',
      'Monday': 'Monday', 'Tuesday': 'Tuesday', 'Wednesday': 'Wednesday',
      'Thursday': 'Thursday', 'Friday': 'Friday',
    };

    // Get header row to map column indices to time periods
    const headerRow = rows[0];
    const timeHeaders: string[] = [];
    if (headerRow) {
      headerRow.querySelectorAll('th, td').forEach(cell => {
        const text = cell.textContent?.trim() || '';
        // Extract time from headers like "4 11:00 - 12:00" or "5:00 - 6:00"
        const timeMatch = text.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
        if (timeMatch) {
          timeHeaders.push(timeMatch[1]);
        } else {
          // Try to extract period number and map to time
          const periodMatch = text.match(/^(\d+)/);
          if (periodMatch) {
            const period = parseInt(periodMatch[1]);
            // Map period numbers to times (based on screenshot: period 4 = 11:00)
            const periodTimes: Record<number, string> = {
              1: '08:00', 2: '08:30', 3: '09:00', 4: '11:00',
              5: '12:00', 6: '13:00', 7: '14:00', 8: '15:00',
              9: '16:00', 10: '17:00',
            };
            timeHeaders.push(periodTimes[period] || `${period}:00`);
          } else {
            timeHeaders.push('');
          }
        }
      });
    }

    // Process data rows (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.querySelectorAll('td');

      // First cell is usually the day name
      const firstCell = cells[0];
      if (!firstCell) continue;

      const dayText = firstCell.textContent?.trim() || '';
      const day = dayMap[dayText] || dayText;
      if (!day) continue;

      // Remaining cells are time slots
      for (let j = 1; j < cells.length; j++) {
        const cell = cells[j];
        const text = cell.textContent?.trim();
        if (!text || text.length < 2) continue;

        const time = timeHeaders[j - 1] || '';

        // Parse the cell content - usually contains subject, class, room
        // Format might be like "CAV1303\nSEC 5\nB3-201"
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const subject = lines[0] || '';
        const className = lines.find(l => l.includes('SEC') || l.includes('sec')) || '';
        const classroom = lines.find(l => l.match(/^[A-Z]\d|Bilik|Room/i)) || '';

        if (subject) {
            slots.push({
              day,
              time,
              timeEnd: '',
              subject,
            teacher: teacherName,
            classroom,
            class: className,
          });
        }
      }
    }

    return slots;
  });
}

// Scrape teacher list only
export async function scrapeTeacherList(): Promise<string[]> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    await waitForTimetable(page);
    const names = await extractTeacherNames(page);
    return names;
  } finally {
    await browser.close();
  }
}

// Full scrape - get all teachers and their timetables
export async function scrapeTimetable(): Promise<ScrapeResult> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    await waitForTimetable(page);

    // Step 1: Get list of all teacher names
    const teacherNames = await extractTeacherNames(page);
    console.log(`Found ${teacherNames.length} teachers`);

    // Step 2: For each teacher, click and scrape their timetable
    const teacherMap = new Map<string, TeacherData>();
    const classMap = new Map<string, ClassData>();
    const roomMap = new Map<string, RoomData>();

    for (const name of teacherNames) {
      console.log(`Scraping timetable for: ${name}`);
      const slots = await scrapeTeacherTimetable(page, name);

      teacherMap.set(name, { id: name, name, slots });

      // Also extract class and room info
      slots.forEach(slot => {
        if (slot.class) {
          if (!classMap.has(slot.class)) {
            classMap.set(slot.class, { id: slot.class, name: slot.class, slots: [] });
          }
          classMap.get(slot.class)!.slots.push(slot);
        }
        if (slot.classroom) {
          if (!roomMap.has(slot.classroom)) {
            roomMap.set(slot.classroom, { id: slot.classroom, name: slot.classroom, slots: [] });
          }
          roomMap.get(slot.classroom)!.slots.push(slot);
        }
      });
    }

    return {
      teachers: Array.from(teacherMap.values()),
      classes: Array.from(classMap.values()),
      rooms: Array.from(roomMap.values()),
      scrapedAt: new Date().toISOString(),
    };
  } finally {
    await browser.close();
  }
}
