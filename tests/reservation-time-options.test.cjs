const { test } = require('node:test');
const assert = require('node:assert/strict');
const { options } = require('../public/reservation-time-options');
const config = { open_time: '12:00', close_time: '03:00' };
const now = new Date('2026-09-09T18:37:20+05:00');
test('today removes past and current minutes but keeps next-day hours', () => {
  const result = options(config, '2026-09-09', '18:38', now);
  assert.equal(result.starts[0], '18:38');
  assert(!result.starts.includes('18:37'));
  assert(result.starts.includes('00:00'));
  assert.equal(result.starts.at(-1), '02:00');
  assert.equal(result.ends[0], '18:39');
  assert.equal(result.ends.at(-1), '03:00');
});
test('future dates retain all operating minutes', () => {
  assert.equal(options(config, '2026-09-10', '', now).starts[0], '12:00');
});
test('after midnight is the following day of the operating date', () => {
  const result = options(config, '2026-09-09', '23:59', now);
  assert.equal(result.ends[0], '00:00');
  assert(options(config, '2026-09-09', '', new Date('2026-09-09T23:59:00+05:00')).starts.includes('00:00'));
});
test('daytime closing, partial opening hour, and expired selections', () => {
  const day = { open_time: '09:30', close_time: '19:15' };
  assert.equal(options(day, '2026-09-10', '', now).starts[0], '09:30');
  assert.equal(options(day, '2026-09-09', '18:38', now).ends.at(-1), '19:15');
  assert.deepEqual(options(day, '2026-09-09', '18:00', now).ends, []);
  assert.deepEqual(options(day, '2026-09-09', '', new Date('2026-09-09T19:15:00+05:00')).starts, []);
});
test('overnight close before last-start cutoff and month rollover', () => {
  const result = options({ open_time: '18:00', close_time: '01:30' }, '2026-09-30', '01:29', new Date('2026-10-01T01:28:00+05:00'));
  assert.deepEqual(result.starts, ['01:29']);
  assert.deepEqual(result.ends, ['01:30']);
});

