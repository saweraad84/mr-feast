# Reservation calendar and time selection

- Time options use Asia/Karachi, matching the existing server validation. The selected date is the operating date; after-midnight slots belong to the following calendar day. Current-minute starts are excluded to match server validation, and the overnight last-start cutoff remains 02:00 unless configured otherwise.
- Start and end selectors only contain valid options. Invalidated selections are cleared when the date changes or the clock advances. The duplicate legacy time-rule script is no longer loaded. Existing submission aliases, phone/email validation and availability checks are retained.
- Calendar chips show start–end times, sorted in operating-hour order. Selecting one focuses, scrolls to and highlights its reservation list row. Selecting a date expands full details after its week; selecting it again or Close collapses the panel. Date buttons work with the keyboard; reduced-motion preferences are respected.
- The calendar requests all bookings in its visible range (at most 42 days), merged with the existing recent list. Existing callers retain the 500-row default. SQL parameters are bound and malformed or oversized ranges are rejected.
- Missing historical fields show a dash; missing end times are marked as unrecorded in details. All statuses are displayed, matching the existing calendar.

## Verification

Changed files: `public/index.html`, `public/reservation.js`, `public/reservation-submit-fix.js`, `public/reservation-time-options.js`, `public/reservations-calendar.html`, `public/reservations-calendar.js`, `public/reservations-calendar.css`, `reservation-calendar-query.js`, `reservation-v2.js`, `reservation-wrapper.js`, `package.json`, `.gitignore`, and the three test files under `tests/`.

Run `npm test` for the time and query tests. Run `npm run test:browser` with Playwright installed locally or available on NODE_PATH. Set BROWSER_CHANNEL=chrome to use installed Chrome. The browser suite serves the real public scripts against isolated API fixtures; it makes no live bookings and writes calendar-mobile.png for visual review.

The browser suite checks chip order, week-panel placement, list scrolling/highlighting, refresh, mobile overflow, keyboard expansion, escaped customer data, bookings outside the recent-list result, expiring selections, overnight submission and preserved field aliases.

There is no build command: this application serves plain JavaScript and HTML. Railway starts `node reservation-runtime-fix.js`; local `npm start` uses the repository's existing legacy entry point. Health startup was verified. Live database writes and real reservation capacity were not exercised because this workspace has no production database configuration.

