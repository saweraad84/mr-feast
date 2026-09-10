const { test } = require('node:test');
const assert = require('node:assert/strict');
const query = require('../reservation-calendar-query');
test('retains existing recent-list limit without calendar parameters', () => {
  assert(query().text.endsWith('LIMIT 500'));
});
test('calendar range includes every reservation and uses bound parameters', () => {
  const result = query({ from: '2026-08-30', to: '2026-10-10' });
  assert(!result.text.includes('LIMIT'));
  assert.deepEqual(result.values, ['2026-08-30', '2026-10-10']);
});
test('rejects malformed, incomplete, reversed and excessive ranges', () => {
  for (const input of [
    { from: '2026-09-01' }, { from: '2026-02-30', to: '2026-03-05' },
    { from: '2026-09-10', to: '2026-09-01' }, { from: '2026-01-01', to: '2026-12-31' },
    { from: "2026-09-01' OR 1=1", to: '2026-09-30' }
  ]) assert(query(input).error);
});

