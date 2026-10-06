const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const owner = fs.readFileSync(path.resolve(__dirname, '..', 'public', 'owner.html'), 'utf8');

test('owner dashboard includes full 30-day website analytics', () => {
  for (const token of [
    '/api/admin/analytics-summary',
    'id="av"',
    'id="aoc"',
    'id="aca"',
    'id="ao"',
    'id="ar"',
    'id="acr"',
    'id="topItems"',
    'conversion_rate',
    'top_menu_items'
  ]) assert.ok(owner.includes(token), 'missing '+token);
});
