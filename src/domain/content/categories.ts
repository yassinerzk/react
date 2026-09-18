import type { Category, CategoryId } from '@/domain/types';

/**
 * Category registry. To add a category:
 *  1. Add its id to `CategoryId` in domain/types.ts
 *  2. Add an entry here
 *  3. Create `posts/<id>.ts` and register it in `posts/index.ts`
 *  4. (Optional) add an occasion rule in domain/occasions.ts
 */
export const CATEGORIES: readonly Category[] = [
  {
    id: 'friday',
    label: { en: 'Friday', ar: 'الجمعة' },
    description: {
      en: "Jumu'ah greetings, salawat and Surah Al-Kahf reminders",
      ar: 'تهاني الجمعة والصلاة على النبي وتذكير بسورة الكهف',
    },
    icon: '🕌',
    order: 10,
  },
  {
    id: 'morning',
    label: { en: 'Morning', ar: 'الصباح' },
    description: { en: 'Morning adhkar and duaa to start the day', ar: 'أذكار وأدعية الصباح لبداية اليوم' },
    icon: '🌅',
    order: 20,
  },
  {
    id: 'evening',
    label: { en: 'Evening', ar: 'المساء' },
    description: { en: 'Evening adhkar and protection duaa', ar: 'أذكار المساء وأدعية الحفظ' },
    icon: '🌙',
    order: 30,
  },
  {
    id: 'ramadan',
    label: { en: 'Ramadan', ar: 'رمضان' },
    description: {
      en: 'Ramadan greetings, fasting and iftar duaa',
      ar: 'تهاني رمضان وأحاديث الصيام ودعاء الإفطار',
    },
    icon: '🏮',
    order: 40,
  },
  {
    id: 'laylat-al-qadr',
    label: { en: 'Laylat al-Qadr', ar: 'ليلة القدر' },
    description: { en: 'The Night of Decree', ar: 'ليلة خير من ألف شهر' },
    icon: '✨',
    order: 50,
  },
  {
    id: 'eid-al-fitr',
    label: { en: 'Eid al-Fitr', ar: 'عيد الفطر' },
    description: { en: 'Eid greetings and takbeer', ar: 'تهاني العيد والتكبير' },
    icon: '🎉',
    order: 60,
  },
  {
    id: 'dhul-hijjah',
    label: { en: 'Dhul Hijjah & Arafah', ar: 'ذو الحجة وعرفة' },
    description: { en: 'The ten best days, Arafah and Hajj', ar: 'العشر الأوائل ويوم عرفة والحج' },
    icon: '🕋',
    order: 70,
  },
  {
    id: 'eid-al-adha',
    label: { en: 'Eid al-Adha', ar: 'عيد الأضحى' },
    description: { en: 'Eid al-Adha greetings and verses', ar: 'تهاني عيد الأضحى وآيات' },
    icon: '🐑',
    order: 80,
  },
  {
    id: 'muharram',
    label: { en: 'Hijri New Year & Ashura', ar: 'السنة الهجرية وعاشوراء' },
    description: {
      en: 'New Hijri year wishes and the fast of Ashura',
      ar: 'تهاني العام الهجري وصيام عاشوراء',
    },
    icon: '🌙',
    order: 90,
  },
  {
    id: 'isra-miraj',
    label: { en: "Isra & Mi'raj", ar: 'الإسراء والمعراج' },
    description: { en: 'The night journey', ar: 'ذكرى الإسراء والمعراج' },
    icon: '🌌',
    order: 100,
  },
  {
    id: 'quran',
    label: { en: 'Quran', ar: 'آيات' },
    description: { en: 'Short verses for daily reflection', ar: 'آيات قصيرة للتدبر اليومي' },
    icon: '📖',
    order: 110,
  },
  {
    id: 'hadith',
    label: { en: 'Hadith', ar: 'أحاديث' },
    description: { en: 'Authentic sayings of the Prophet ﷺ', ar: 'أحاديث صحيحة عن النبي ﷺ' },
    icon: '📜',
    order: 120,
  },
  {
    id: 'dua',
    label: { en: 'Duaa', ar: 'أدعية' },
    description: { en: 'Supplications for every need', ar: 'أدعية لكل حاجة' },
    icon: '🤲',
    order: 130,
  },
  {
    id: 'occasions',
    label: { en: 'Occasions', ar: 'مناسبات' },
    description: { en: 'Weddings, newborns, travel, condolences', ar: 'زواج ومولود وسفر وتعزية' },
    icon: '💐',
    order: 140,
  },
];

export const CATEGORY_MAP: Readonly<Record<CategoryId, Category>> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

export function getCategory(id: CategoryId): Category {
  return CATEGORY_MAP[id];
}
