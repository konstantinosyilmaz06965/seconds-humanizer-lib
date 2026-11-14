const UNIT_SECONDS = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
};

const UNIT_ORDER = ['d', 'h', 'm', 's'];

/**
 * Convert an integer number of seconds into a compact human-readable duration
 * string.
 *
 * Why integer seconds: the input is described as an integer, and accepting
 * fractional seconds would force callers to think about rounding policy. We
 * reject non-integers instead of silently truncating so that a caller who
 * passes 1.5 knows they made a mistake.
 *
 * Why a fixed unit order: the output is meant to be read left-to-right from
 * largest unit to smallest, e.g. "1d 2h 3m". Allowing arbitrary unit order
 * would make the string ambiguous to parse back.
 *
 * @param {number} seconds Integer seconds. May be negative.
 * @param {object} [options]
 * @param {number} [options.precision=2] Maximum number of units to include.
 *   Must be a positive integer. If more units are available than precision,
 *   the rightmost units are dropped (not rounded).
 * @param {string[]} [options.units=['d','h','m','s']] Units to consider, in
 *   any order. Each must be one of 'd', 'h', 'm', 's'. Unknown units throw.
 *   The output always emits units in descending size order regardless of the
 *   order given here.
 * @returns {string} Compact duration string, e.g. "1h 30m". Zero returns "0s".
 */
export function humanizeSeconds(seconds, options = {}) {
  if (!Number.isInteger(seconds)) {
    throw new TypeError('seconds must be an integer');
  }

  const precision = options.precision === undefined ? 2 : options.precision;
  if (!Number.isInteger(precision) || precision < 1) {
    throw new RangeError('precision must be a positive integer');
  }

  const requestedUnits = options.units === undefined ? UNIT_ORDER : options.units;
  if (!Array.isArray(requestedUnits) || requestedUnits.length === 0) {
    throw new TypeError('units must be a non-empty array');
  }

  // Normalise to descending size order and validate. Deduplicate so that
  // passing ['s','s'] does not produce a repeated unit in the output.
  const seen = new Set();
  for (const unit of requestedUnits) {
    if (!Object.prototype.hasOwnProperty.call(UNIT_SECONDS, unit)) {
      throw new RangeError(`unknown unit: ${unit}`);
    }
    seen.add(unit);
  }
  const orderedUnits = UNIT_ORDER.filter((unit) => seen.has(unit));

  if (seconds === 0) {
    // Zero is special: with no units selected we still want a readable value.
    // We report it in the smallest requested unit, defaulting to seconds.
    const smallest = orderedUnits[orderedUnits.length - 1];
    return `0${smallest}`;
  }

  const negative = seconds < 0;
  let remaining = Math.abs(seconds);

  const parts = [];
  for (const unit of orderedUnits) {
    const size = UNIT_SECONDS[unit];
    if (size > remaining) {
      continue;
    }
    const count = Math.floor(remaining / size);
    remaining -= count * size;
    parts.push(`${count}${unit}`);
    if (parts.length === precision) {
      break;
    }
  }

  if (parts.length === 0) {
    // The value is smaller than the smallest requested unit. We do not round
    // up because that would misrepresent the input; instead we emit the
    // smallest unit with a zero count only when the value is exactly zero,
    // which is handled above. For non-zero values below the smallest unit we
    // emit a single unit with count 0 to keep the output non-empty.
    const smallest = orderedUnits[orderedUnits.length - 1];
    parts.push(`0${smallest}`);
  }

  return (negative ? '-' : '') + parts.join(' ');
}
