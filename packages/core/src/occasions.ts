import type { CategoryId, Localized } from './types';
import type { HijriDate } from './hijri';

export interface Occasion {
  category: CategoryId;
  reason: Localized;
  /** Lower comes first. */
  priority: number;
}

interface OccasionContext {
  date: Date;
  hijri: HijriDate | null;
}

type Rule = (ctx: OccasionContext) => Occasion | null;

const inRange = (h: HijriDate | null, month: number, from: number, to: number) =>
  !!h && h.month === month && h.day >= from && h.day <= to;

/**
 * Rules that decide which categories are relevant "today". Order does not
 * matter; results are sorted by priority. Add a rule to surface a new season.
 */
const RULES: Rule[] = [
  ({ date }) =>
    date.getDay() === 5
      ? { category: 'friday', reason: { en: "It's Jumu'ah", ar: 'اليوم الجمعة' }, priority: 1 }
      : null,
  ({ hijri }) =>
    inRange(hijri, 9, 20, 30)
      ? {
          category: 'laylat-al-qadr',
          reason: { en: 'The last ten nights', ar: 'العشر الأواخر' },
          priority: 0,
        }
      : null,
  ({ hijri }) =>
    inRange(hijri, 9, 1, 30)
      ? { category: 'ramadan', reason: { en: 'Ramadan is here', ar: 'رمضان كريم' }, priority: 1 }
      : null,
  ({ hijri }) =>
    inRange(hijri, 8, 25, 30)
      ? { category: 'ramadan', reason: { en: 'Ramadan is near', ar: 'رمضان على الأبواب' }, priority: 3 }
      : null,
  ({ hijri }) =>
    inRange(hijri, 10, 1, 3)
      ? { category: 'eid-al-fitr', reason: { en: 'Eid al-Fitr', ar: 'عيد الفطر' }, priority: 0 }
      : null,
  ({ hijri }) =>
    inRange(hijri, 12, 1, 9)
      ? {
          category: 'dhul-hijjah',
          reason:
            hijri?.day === 9
              ? { en: 'Day of Arafah', ar: 'يوم عرفة' }
              : { en: 'The ten best days', ar: 'العشر من ذي الحجة' },
          priority: 0,
        }
      : null,
  ({ hijri }) =>
    inRange(hijri, 12, 10, 13)
      ? { category: 'eid-al-adha', reason: { en: 'Eid al-Adha', ar: 'عيد الأضحى' }, priority: 0 }
      : null,
  ({ hijri }) =>
    inRange(hijri, 1, 1, 2) || inRange(hijri, 12, 29, 30)
      ? { category: 'muharram', reason: { en: 'New Hijri year', ar: 'عام هجري جديد' }, priority: 0 }
      : null,
  ({ hijri }) =>
    inRange(hijri, 1, 8, 10)
      ? { category: 'muharram', reason: { en: 'Ashura', ar: 'عاشوراء' }, priority: 0 }
      : null,
  ({ hijri }) =>
    inRange(hijri, 7, 26, 27)
      ? { category: 'isra-miraj', reason: { en: "Isra & Mi'raj", ar: 'الإسراء والمعراج' }, priority: 1 }
      : null,
  ({ date }) => {
    const h = date.getHours();
    if (h >= 4 && h < 12)
      return { category: 'morning', reason: { en: 'Good morning', ar: 'صباح الخير' }, priority: 2 };
    if (h >= 16 && h < 24)
      return { category: 'evening', reason: { en: 'Good evening', ar: 'مساء الخير' }, priority: 2 };
    return null;
  },
];

export function getOccasions(date: Date, hijri: HijriDate | null): Occasion[] {
  const ctx = { date, hijri };
  const seen = new Set<CategoryId>();
  return RULES.map((r) => r(ctx))
    .filter((o): o is Occasion => o !== null)
    .sort((a, b) => a.priority - b.priority)
    .filter((o) => (seen.has(o.category) ? false : (seen.add(o.category), true)));
}
