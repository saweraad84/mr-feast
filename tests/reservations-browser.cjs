// Run with Playwright available on NODE_PATH (or installed locally).
const { chromium } = require('playwright');
const { createServer } = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../public');
const config = { enabled: true, open_time: '12:00', close_time: '03:00', closed_dates: [], closed_weekdays: [] };
const reservations = [
  { id: 11, reservation_date: '2026-09-09', reservation_time: '19:00:00', end_time: '20:00:00', customer_name: 'Test <Guest>', party_size: 4, phone: '+923001234567', email: 'guest@example.test', special_requests: 'Window table', status: 'confirmed', tables_used: 1, table_ids: [2], source: 'website' },
  { id: 12, reservation_date: '2026-09-09', reservation_time: '20:00:00', end_time: '21:00:00', customer_name: 'Second guest', party_size: 2 },
  { id: 13, reservation_date: '2026-09-09', reservation_time: '00:00:00', end_time: '01:00:00', customer_name: 'Overnight guest', party_size: 2 }
];
let submitted;
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    if (url.pathname === '/api/reservations' && req.method === 'POST') {
      let body = ''; for await (const chunk of req) body += chunk;
      submitted = JSON.parse(body); return res.end(JSON.stringify({ reservationId: 99 }));
    }
    const data = url.pathname === '/api/admin/reservations' ? (url.searchParams.has('from') ? reservations : reservations.slice(0, 1)) :
      /config|settings/.test(url.pathname) ? config : /availability/.test(url.pathname) ? { available: true, tables_needed: 1 } : {};
    return res.end(JSON.stringify(data));
  }
  if (url.pathname === '/picker-test') {
    res.setHeader('Content-Type', 'text/html');
    return res.end('<section id="contact"></section><script src="/reservation.js"></script><script src="/reservation-time-options.js"></script><script src="/reservation-submit-fix.js"></script>');
  }
  const target = path.resolve(root, '.' + url.pathname);
  if (!target.startsWith(root + path.sep) || !fs.existsSync(target)) { res.statusCode = 404; return res.end(); }
  res.setHeader('Content-Type', target.endsWith('.js') ? 'text/javascript' : target.endsWith('.css') ? 'text/css' : 'text/html');
  fs.createReadStream(target).pipe(res);
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.clock.install({ time: new Date('2026-09-09T18:37:20+05:00') });
    const base = `http://127.0.0.1:${server.address().port}`;
    await page.goto(base + '/reservations-calendar.html');
    await page.locator('#go').click();
    await page.locator('.booking').first().waitFor();
    assert.deepEqual(await page.locator('[data-date="2026-09-09"] .booking').allTextContents(), ['19:00–20:00', '20:00–21:00', '00:00–01:00']);
    await page.locator('[data-date="2026-09-09"] .date-toggle').click({ position: { x: 3, y: 3 } });
    assert.equal(await page.locator('.reservation-detail').count(), 3);
    assert((await page.locator('#date-details').textContent()).includes('Test <Guest>'));
    assert.equal(await page.locator('#date-details script').count(), 0);
    assert(await page.locator('#date-details').evaluate(el => el.previousElementSibling.classList.contains('calendar-week-row') && el.nextElementSibling.classList.contains('calendar-week-row') && el.nextElementSibling.getBoundingClientRect().top >= el.getBoundingClientRect().bottom));
    await page.locator('.booking[data-reservation="12"]').click();
    await page.waitForTimeout(800);
    assert.equal(await page.locator('#rows .highlighted').getAttribute('data-reservation'), '12');
    assert(await page.locator('#rows .highlighted').evaluate(el => el.getBoundingClientRect().top >= 0 && el.getBoundingClientRect().bottom <= innerHeight));
    await page.locator('#refresh').click();
    assert.equal(await page.locator('#rows .highlighted').count(), 1);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.locator('#date-details').scrollIntoViewIfNeeded();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: path.resolve(__dirname, '../calendar-mobile.png'), fullPage: true });
    await page.locator('[data-close-details]').click();
    assert.equal(await page.locator('#date-details').count(), 0);
    await page.locator('[data-date="2026-09-10"] .date-toggle').focus();
    await page.keyboard.press('Enter');
    assert((await page.locator('#date-details').textContent()).includes('No reservations'));
    await page.goto(base + '/picker-test');
    await page.locator('#resStartHour option[value="12"]').waitFor({ state: 'attached' });
    await page.locator('#resDateBtn').click();
    await page.locator('#calendarGrid [data-date="2026-09-09"]').click();
    assert.equal(await page.locator('#resStartHour option[value="12"]').count(), 0);
    await page.locator('#resStartHour').selectOption('18');
    assert.equal(await page.locator('#resStartMinute option[value="37"]').count(), 0);
    await page.locator('#resStartMinute').selectOption('38');
    await page.locator('#resEndHour').selectOption('18');
    assert.equal(await page.locator('#resEndMinute option[value="38"]').count(), 0);
    await page.locator('#resEndMinute').selectOption('39');
    await page.clock.fastForward(60000);
    assert.equal(await page.locator('#resStart').inputValue(), '');
    assert.equal(await page.locator('#resEnd').inputValue(), '');
    await page.locator('#resStartHour').selectOption('23');
    await page.locator('#resStartMinute').selectOption('59');
    await page.locator('#resEndHour').selectOption('00');
    await page.locator('#resEndMinute').selectOption('00');
    await page.locator('#resName').fill('Test Guest');
    await page.locator('#resPhone').fill('3001234567');
    await page.locator('#resEmail').fill('guest@example.test');
    await page.locator('#resNotes').fill('Window table');
    await page.locator('.reservation-submit').click();
    await page.waitForFunction(() => document.querySelector('#resStatus').textContent.includes('#99'));
    assert.equal(submitted.customer_name, 'Test Guest');
    assert.equal(submitted.full_name, 'Test Guest');
    assert.equal(submitted.start_time, '23:59');
    assert.equal(submitted.reservation_time, '23:59');
    assert.equal(submitted.end_time, '00:00');
    assert.equal(submitted.phone, '+923001234567');
    assert.equal(submitted.special_requests, 'Window table');
    assert.deepEqual(errors, []);
    console.log('PASS: calendar interaction, responsive layout, escaping, time expiry, overnight booking, field mapping; no browser errors.');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });

