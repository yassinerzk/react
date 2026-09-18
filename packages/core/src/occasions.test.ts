import { getOccasions } from './occasions';

const at = (weekday: number, hour: number) => {
  // 2024-09-01 is a Sunday; shift to the requested weekday.
  const d = new Date(2024, 8, 1 + weekday, hour);
  return d;
};

describe('getOccasions', () => {
  it('surfaces Friday first when it is Friday', () => {
    const list = getOccasions(at(5, 14), { day: 3, month: 3, year: 1446 });
    expect(list[0]?.category).toBe('friday');
  });

  it('prefers Laylat al-Qadr over Ramadan in the last ten nights', () => {
    const list = getOccasions(at(2, 14), { day: 25, month: 9, year: 1446 });
    expect(list.map((o) => o.category)).toEqual(['laylat-al-qadr', 'ramadan']);
  });

  it('detects Arafah and Eid al-Adha', () => {
    expect(getOccasions(at(2, 14), { day: 9, month: 12, year: 1446 })[0]).toMatchObject({
      category: 'dhul-hijjah',
      reason: { en: 'Day of Arafah' },
    });
    expect(getOccasions(at(2, 14), { day: 10, month: 12, year: 1446 })[0]?.category).toBe('eid-al-adha');
  });

  it('adds morning or evening by time of day', () => {
    expect(getOccasions(at(2, 8), null).map((o) => o.category)).toContain('morning');
    expect(getOccasions(at(2, 19), null).map((o) => o.category)).toContain('evening');
    expect(getOccasions(at(2, 13), null).map((o) => o.category)).not.toContain('morning');
  });

  it('never repeats a category', () => {
    const list = getOccasions(at(5, 8), { day: 1, month: 10, year: 1446 });
    const ids = list.map((o) => o.category);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
