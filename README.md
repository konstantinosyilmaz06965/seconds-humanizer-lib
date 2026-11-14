# seconds-humanizer-lib

Converts an integer seconds value into a compact human-readable duration string with configurable precision and unit selection.

```js
import { humanizeSeconds } from './src/index.js';

humanizeSeconds(3661);                       // '1h 1m'
humanizeSeconds(3661, { precision: 3 });     // '1h 1m 1s'
humanizeSeconds(3661, { units: ['m', 's'] }); // '61m 1s'
humanizeSeconds(-3661);                      // '-1h 1m'
```

## Why this exists

Turning a raw seconds count into something a person can read is a small problem
with a surprising number of decisions hiding in it: how many units to show, what
to do with a value smaller than the smallest unit, and whether to round. This
library makes those decisions explicit and testable.

The main trade-off is that it does not round. If you ask for one unit and the
value is 61 seconds, you get `1m`, not `1m 1s` and not `2m`. Dropping the
remainder keeps the function total and predictable; callers who need rounding can
round their input before calling.

## API

### `humanizeSeconds(seconds, options?)`

- `seconds` — an integer. Non-integers throw a `TypeError`.
- `options.precision` — maximum number of units to include. Defaults to `2`.
  Must be a positive integer or a `RangeError` is thrown.
- `options.units` — an array of `'d'`, `'h'`, `'m'`, `'s'`. Defaults to all four.
  Unknown units throw a `RangeError`; an empty array throws a `TypeError`.

Units are always emitted from largest to smallest, regardless of the order you
pass them in. Zero is reported in the smallest requested unit, so
`humanizeSeconds(0, { units: ['h', 'm'] })` is `'0m'`.

## The awkward edge

A value smaller than the smallest requested unit is not rounded up. With
`units: ['h']`, `humanizeSeconds(30)` returns `'0h'`. This is deliberate: the
function never claims a unit that the input does not contain. If you want `30`
seconds to read as `1h`, round the input yourself.
