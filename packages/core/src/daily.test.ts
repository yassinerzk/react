import { dailyPicks, dayNumber, rotate } from './daily';

const pool = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `p${i}` }));
const ids = (items: { id: string }[]) => items.map((i) => i.id);
/** Local noon, so a timezone offset either way cannot push the date across midnight. */
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12, 0, 0);

/**
 * Passes are aligned to the epoch, not to any calendar date, so a test that
 * wants one whole pass has to start where the slot is 0.
 */
const passStart = (from: Date, poolSize: number, count: number) => {
  const daysPerPass = Math.ceil(poolSize / count);
  const d = new Date(from);
  while (dayNumber(d) % daysPerPass !== 0) d.setDate(d.getDate() + 1);
  return d;
};
const plusDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12);

describe('dayNumber', () => {
  it('advances by one per calendar day and ignores the time of day', () => {
    expect(dayNumber(day(2026, 9, 24)) - dayNumber(day(2026, 9, 23))).toBe(1);
    expect(dayNumber(new Date(2026, 8, 23, 0, 1))).toBe(dayNumber(new Date(2026, 8, 23, 23, 59)));
  });

  it('uses the local date rather than UTC', () => {
    // Late evening local time is already the next day in UTC; it must still be today.
    const late = new Date(2026, 8, 23, 23, 30);
    expect(dayNumber(late)).toBe(dayNumber(new Date(2026, 8, 23, 6, 0)));
  });
});

describe('rotate', () => {
  it('is deterministic for a date and changes the next day', () => {
    const p = pool(30);
    expect(ids(rotate(p, day(2026, 9, 23), 5))).toEqual(ids(rotate(p, day(2026, 9, 23), 5)));
    expect(ids(rotate(p, day(2026, 9, 24), 5))).not.toEqual(ids(rotate(p, day(2026, 9, 23), 5)));
  });

  it('shows every item once before repeating any', () => {
    const p = pool(30); // 30 items, 5 a day = a 6-day pass
    const start = passStart(day(2026, 9, 1), 30, 5);
    const seen: string[] = [];
    for (let d = 0; d < 6; d++) seen.push(...ids(rotate(p, plusDays(start, d), 5)));
    expect(seen).toHaveLength(30);
    expect(new Set(seen).size).toBe(30);
  });

  it('reorders on the next pass instead of looping identically', () => {
    const p = pool(30);
    const first = ids(rotate(p, day(2026, 9, 1), 5));
    const nextPass = ids(rotate(p, day(2026, 9, 7), 5)); // day 7 starts pass two
    expect(nextPass).not.toEqual(first);
  });

  it('returns a full day even when the pool does not divide evenly', () => {
    const p = pool(7); // 7 items, 3 a day: the third day wraps
    for (let d = 1; d <= 3; d++) expect(rotate(p, day(2026, 9, d), 3)).toHaveLength(3);
  });

  it('never asks for more than the pool holds, and copes with an empty pool', () => {
    expect(rotate(pool(2), day(2026, 9, 23), 10)).toHaveLength(2);
    expect(rotate([], day(2026, 9, 23), 10)).toEqual([]);
    expect(rotate(pool(5), day(2026, 9, 23), 0)).toEqual([]);
  });

  it('handles dates before the epoch without producing a negative slot', () => {
    expect(rotate(pool(30), new Date(1969, 5, 15, 12), 5)).toHaveLength(5);
  });
});

describe('dailyPicks', () => {
  const all = pool(305);
  const seasonal = all.slice(0, 23); // e.g. the 23 morning cards

  it('fills the section even when nothing is in season', () => {
    // An ordinary weekday afternoon: no occasion applies, so seasonal is empty.
    const picks = dailyPicks({ all, seasonal: [], date: day(2026, 9, 23) });
    expect(picks).toHaveLength(10);
  });

  it('prefers seasonal cards but still brings in the wider catalogue', () => {
    const picks = dailyPicks({ all, seasonal, date: day(2026, 9, 23) });
    const fromSeasonal = picks.filter((p) => seasonal.some((s) => s.id === p.id));
    expect(picks).toHaveLength(10);
    // At least the reserved slots. The catalogue rotation may add another,
    // since seasonal cards are part of the catalogue too.
    expect(fromSeasonal.length).toBeGreaterThanOrEqual(6);
    expect(fromSeasonal.length).toBeLessThan(10);
  });

  it('never repeats a card within a day', () => {
    const picks = dailyPicks({ all, seasonal, date: day(2026, 9, 23) });
    expect(new Set(ids(picks)).size).toBe(picks.length);
  });

  it('changes from one day to the next', () => {
    const a = ids(dailyPicks({ all, seasonal, date: day(2026, 9, 23) }));
    const b = ids(dailyPicks({ all, seasonal, date: day(2026, 9, 24) }));
    expect(a).not.toEqual(b);
  });

  it('is stable through the whole day, so the list does not shuffle under the reader', () => {
    const morning = ids(dailyPicks({ all, seasonal, date: new Date(2026, 8, 23, 7, 0) }));
    const night = ids(dailyPicks({ all, seasonal, date: new Date(2026, 8, 23, 22, 0) }));
    expect(morning).toEqual(night);
  });

  it('reaches every card in the catalogue, which the old fixed slice never did', () => {
    // 305 cards at 10 a day is a 31-day pass; one whole pass shows all of them.
    const start = passStart(day(2026, 9, 1), all.length, 10);
    const seen = new Set<string>();
    for (let d = 0; d < 31; d++) {
      ids(dailyPicks({ all, seasonal: [], date: plusDays(start, d) })).forEach((id) => seen.add(id));
    }
    expect(seen.size).toBe(all.length);
  });

  it('respects an explicit count', () => {
    expect(dailyPicks({ all, seasonal, date: day(2026, 9, 23), count: 4 })).toHaveLength(4);
  });
});
