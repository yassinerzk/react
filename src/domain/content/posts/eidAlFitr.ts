import type { Post } from '@/domain/types';

export const eidAlFitrPosts: Post[] = [
  {
    id: 'fitr-greeting',
    category: 'eid-al-fitr',
    kind: 'greeting',
    headline: { en: 'Eid Mubarak', ar: 'عيد مبارك' },
    arabic: 'تَقَبَّلَ اللهُ مِنّا وَمِنكُم، وَكُلُّ عامٍ وَأَنتُم بِخَير',
    translation: 'May Allah accept from us and from you. May you be well every year.',
    theme: 'emerald-night',
    decoration: 'lights',
    font: 'aref-ruqaa',
  },
  {
    id: 'fitr-takbeer',
    category: 'eid-al-fitr',
    kind: 'dhikr',
    headline: { en: 'Takbeer of Eid', ar: 'تكبيرات العيد' },
    arabic:
      'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، وَلِلَّهِ الْحَمْدُ',
    translation:
      'Allah is the Greatest, Allah is the Greatest, Allah is the Greatest. There is no god but Allah. Allah is the Greatest, Allah is the Greatest, and to Allah belongs all praise.',
    theme: 'ivory-gold',
    decoration: 'crescent',
    font: 'reem-kufi',
  },
  {
    id: 'fitr-verse',
    category: 'eid-al-fitr',
    kind: 'quran',
    arabic:
      'وَلِتُكْمِلُوا الْعِدَّةَ وَلِتُكَبِّرُوا اللَّهَ عَلَىٰ مَا هَدَاكُمْ وَلَعَلَّكُمْ تَشْكُرُونَ',
    translation:
      'So that you may complete the period and glorify Allah for having guided you, and so that you may be grateful.',
    source: { en: 'Surah Al-Baqarah 2:185', ar: 'سورة البقرة ٢:١٨٥' },
    theme: 'teal-lagoon',
    decoration: 'lights',
    font: 'amiri',
  },
  {
    id: 'fitr-family',
    category: 'eid-al-fitr',
    kind: 'greeting',
    headline: { en: 'Happy Eid', ar: 'عيدكم مبارك' },
    arabic: 'عيدٌ سَعيد، وَعُمرٌ مَديد، وَأَيّامٌ كُلُّها فَرَحٌ وَعيد',
    translation: 'A happy Eid, a long life, and days that are all joy and celebration.',
    theme: 'rose-gold',
    decoration: 'lights',
    font: 'cairo',
  },
];
