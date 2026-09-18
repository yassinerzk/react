import type { Background, BackgroundId } from '@/domain/types';

const BASE = import.meta.env.BASE_URL;

const SCRIM_SOFT =
  'linear-gradient(180deg, rgba(8,10,14,0.30) 0%, rgba(8,10,14,0.48) 50%, rgba(8,10,14,0.68) 100%)';
const SCRIM_CENTER = 'radial-gradient(90% 60% at 50% 50%, rgba(8,10,14,0.58) 0%, rgba(8,10,14,0.30) 100%)';

function photo(id: Exclude<BackgroundId, 'none'>, name: Background['name'], scrim = SCRIM_SOFT): Background {
  return {
    id,
    name,
    src: `${BASE}backgrounds/${id}.webp`,
    thumb: `${BASE}backgrounds/thumbs/${id}.webp`,
    scrim,
  };
}

/**
 * Photo background registry. Files live in `public/backgrounds/<id>.webp`
 * (1080x1920) with a thumbnail in `public/backgrounds/thumbs/<id>.webp`.
 * To add one: drop both files in, add the id to `BackgroundId`, and register it here.
 */
export const BACKGROUNDS: readonly Background[] = [
  photo('wildflowers', { en: 'Wildflowers', ar: 'زهور برية' }),
  photo('cherry-blossom', { en: 'Cherry blossom', ar: 'أزهار الكرز' }),
  photo('lavender-field', { en: 'Lavender field', ar: 'حقل الخزامى' }),
  photo('river-valley', { en: 'River valley', ar: 'وادي النهر' }),
  photo('mountain-lake', { en: 'Mountain lake', ar: 'بحيرة جبلية' }),
  photo('forest-light', { en: 'Forest light', ar: 'ضوء الغابة' }, SCRIM_CENTER),
  photo('ocean-sunrise', { en: 'Ocean sunrise', ar: 'شروق البحر' }),
  photo('desert-dusk', { en: 'Desert dusk', ar: 'غسق الصحراء' }),
  photo('starry-night', { en: 'Starry night', ar: 'ليلة نجوم' }, SCRIM_CENTER),
  photo('mosque-sunset', { en: 'Mosque at sunset', ar: 'مسجد عند الغروب' }),
  photo('mosque-courtyard', { en: 'Mosque courtyard', ar: 'صحن المسجد' }, SCRIM_CENTER),
  photo('mosque-sea', { en: 'Mosque by the sea', ar: 'مسجد على البحر' }),
];

export const BACKGROUND_MAP = Object.fromEntries(BACKGROUNDS.map((b) => [b.id, b])) as Record<
  Exclude<BackgroundId, 'none'>,
  Background
>;

export function getBackground(id: BackgroundId | undefined): Background | null {
  if (!id || id === 'none') return null;
  return BACKGROUND_MAP[id] ?? null;
}

/** Text colours used over any photo, regardless of the theme's own mode. */
export const PHOTO_PALETTE = {
  text: '#fffaf0',
  muted: '#f1e8d8',
  accent: '#f2d27a',
  decor: '#f2d27a',
} as const;
