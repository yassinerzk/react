/**
 * Today's selection — a genuinely different set of cards every day, with no
 * server, no stored state and no content to publish.
 *
 * The date is the seed. Every user opening the app on the same day sees the
 * same selection; tomorrow it changes; it works offline and survives a
 * reinstall. Because the rotation walks a permutation of the whole catalogue,
 * every card is shown once before any card repeats — which also means cards
 * beyond the first few in a category stop being invisible.
 *
 * Nothing here is random at runtime: same date in, same cards out, so it is
 * fully testable and two devices never disagree.
 */

/**
 * Days elapsed at the device's local midnight, not UTC's, so "today" means the
 * user's today in every timezone.
 */
export function dayNumber(date: Date): number {
  const local = date.getTime() - date.getTimezoneOffset() * 60_000;
  return Math.floor(local / 86_400_000);
}

/** mulberry32: a tiny deterministic PRNG. A seed always produces the same sequence. */
function rng(seed: number): () => number {
  let a = (seed + 0x6d2b79f5) | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates driven by the seeded PRNG, so the order is reproducible. */
function shuffled<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  const next = rng(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * `count` items for the given day, taken from a shuffled pass over `pool`.
 *
 * Each pass takes `count` per day until the pool is exhausted, then reshuffles
 * with a new seed — so a card cannot reappear until every other card has had a
 * turn, and the next pass comes out in a different order. The final day of a
 * pass wraps back to the start of that same pass to stay a full `count` long,
 * which is the one place a card can show twice close together.
 */
export function rotate<T>(pool: readonly T[], date: Date, count: number): T[] {
  const n = pool.length;
  const take = Math.min(count, n);
  if (n === 0 || take <= 0) return [];
  const daysPerPass = Math.ceil(n / take);
  const day = dayNumber(date);
  // floorDiv/mod, so dates before the epoch still land on a valid pass.
  const pass = Math.floor(day / daysPerPass);
  const slot = ((day % daysPerPass) + daysPerPass) % daysPerPass;
  const order = shuffled(pool, pass);
  const out: T[] = [];
  for (let i = 0; i < take; i++) out.push(order[(slot * take + i) % n]);
  return out;
}

/** Anything with a stable id can be rotated and de-duplicated. */
interface Identified {
  id: string;
}

export interface DailyPicksInput<T extends Identified> {
  /** The whole catalogue. Guarantees the section is never empty. */
  all: readonly T[];
  /** Posts from the categories today's occasions point at. May be empty. */
  seasonal?: readonly T[];
  date: Date;
  /** How many cards the section shows. */
  count?: number;
  /** At most this many of the slots go to seasonal cards. */
  seasonalCount?: number;
}

export const DAILY_PICKS_COUNT = 10;
export const DAILY_SEASONAL_COUNT = 6;

/**
 * The home screen's "Today" selection: seasonal cards first so Ramadan cards
 * show in Ramadan and Friday cards on Friday, then the rest of the slots filled
 * from the whole catalogue so the day still brings something new when nothing
 * special is happening.
 *
 * Always returns `count` cards when the catalogue can supply them — an ordinary
 * weekday afternoon has no occasion at all, and an empty section is worse than
 * an unseasonal one.
 */
export function dailyPicks<T extends Identified>({
  all,
  seasonal = [],
  date,
  count = DAILY_PICKS_COUNT,
  seasonalCount = DAILY_SEASONAL_COUNT,
}: DailyPicksInput<T>): T[] {
  const out: T[] = [];
  const seen = new Set<string>();
  const add = (item: T) => {
    if (seen.has(item.id) || out.length >= count) return;
    seen.add(item.id);
    out.push(item);
  };

  rotate(seasonal, date, Math.min(seasonalCount, count)).forEach(add);
  // Ask for extra, because the seasonal picks above are drawn from `all` too
  // and will be skipped as duplicates here.
  rotate(all, date, count + seen.size).forEach(add);
  return out;
}
