const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
const client = fs.readFileSync(path.join(root, 'public', 'reservation.js'), 'utf8');

test('homepage loads one consolidated reservation client', () => {
  assert.match(index, /<script src="\/reservation\.js\?v=20261006a"><\/script>/);
  assert.doesNotMatch(index, /reservation-enhanced\.js/);
});

test('consolidated reservation client owns a single booking POST flow', () => {
  const posts = client.match(/fetch\('\/api\/reservations',\{method:'POST'/g) || [];
  assert.equal(posts.length, 1);
  assert.doesNotMatch(client, /async function check\(\)/);
  assert.match(client, /\/api\/reservations\/slots\?/);
  assert.match(client, /Confirm your reservation/);
  assert.match(client, /manageUrl/);
  assert.match(client, /Pending confirmation/);
});
