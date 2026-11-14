import test from 'node:test';
import assert from 'node:assert/strict';
import { humanizeSeconds } from '../src/index.js';

test('formats zero as 0s by default', () => {
  assert.equal(humanizeSeconds(0), '0s');
});

test('formats a single unit', () => {
  assert.equal(humanizeSeconds(45), '45s');
  assert.equal(humanizeSeconds(3600), '1h');
});

test('formats multiple units in descending order', () => {
  assert.equal(humanizeSeconds(3661), '1h 1m');
  assert.equal(humanizeSeconds(90061), '1d 1h');
});

test('respects precision', () => {
  assert.equal(humanizeSeconds(3661, { precision: 1 }), '1h');
  assert.equal(humanizeSeconds(3661, { precision: 3 }), '1h 1m 1s');
});

test('drops units smaller than precision without rounding', () => {
  assert.equal(humanizeSeconds(59, { precision: 1 }), '59s');
  assert.equal(humanizeSeconds(61, { precision: 1 }), '1m');
});

test('honours a restricted unit set', () => {
  assert.equal(humanizeSeconds(3661, { units: ['m', 's'] }), '61m 1s');
  assert.equal(humanizeSeconds(3661, { units: ['h'] }), '1h');
});

test('normalises unit order to descending size', () => {
  assert.equal(humanizeSeconds(3661, { units: ['s', 'm', 'h'] }), '1h 1m');
});

test('handles negative values', () => {
  assert.equal(humanizeSeconds(-3661), '-1h 1m');
  assert.equal(humanizeSeconds(-1), '-1s');
});

test('handles values below the smallest requested unit', () => {
  assert.equal(humanizeSeconds(30, { units: ['h'] }), '0h');
});

test('reports zero in the smallest requested unit', () => {
  assert.equal(humanizeSeconds(0, { units: ['h', 'm'] }), '0m');
});

test('rejects non-integer seconds', () => {
  assert.throws(() => humanizeSeconds(1.5), TypeError);
  assert.throws(() => humanizeSeconds('10'), TypeError);
});

test('rejects invalid precision', () => {
  assert.throws(() => humanizeSeconds(10, { precision: 0 }), RangeError);
  assert.throws(() => humanizeSeconds(10, { precision: 1.5 }), RangeError);
});

test('rejects unknown units', () => {
  assert.throws(() => humanizeSeconds(10, { units: ['x'] }), RangeError);
});

test('rejects empty unit list', () => {
  assert.throws(() => humanizeSeconds(10, { units: [] }), TypeError);
});

test('deduplicates repeated units', () => {
  assert.equal(humanizeSeconds(61, { units: ['s', 's', 'm'] }), '1m 1s');
});
