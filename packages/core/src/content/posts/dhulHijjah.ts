import type { Post } from '../../types';

export const dhulHijjahPosts: Post[] = [
  {
    id: 'hijjah-ten-days',
    category: 'dhul-hijjah',
    kind: 'hadith',
    headline: { en: 'The ten best days', ar: 'العشر الأوائل' },
    arabic:
      'مَا مِنْ أَيَّامٍ الْعَمَلُ الصَّالِحُ فِيهِنَّ أَحَبُّ إِلَى اللَّهِ مِنْ هَذِهِ الْأَيَّامِ الْعَشْرِ',
    translation: 'There are no days in which righteous deeds are more beloved to Allah than these ten days.',
    source: { en: 'Sahih al-Bukhari 969', ar: 'صحيح البخاري ٩٦٩' },
    theme: 'emerald-night',
    decoration: 'kaaba',
    font: 'naskh',
  },
  {
    id: 'arafah-free',
    category: 'dhul-hijjah',
    kind: 'hadith',
    headline: { en: 'Day of Arafah', ar: 'يوم عرفة' },
    arabic:
      'مَا مِنْ يَوْمٍ أَكْثَرَ مِنْ أَنْ يُعْتِقَ اللَّهُ فِيهِ عَبْدًا مِنَ النَّارِ مِنْ يَوْمِ عَرَفَةَ',
    translation:
      'There is no day on which Allah frees more of His servants from the Fire than the Day of Arafah.',
    source: { en: 'Sahih Muslim 1348', ar: 'صحيح مسلم ١٣٤٨' },
    theme: 'desert-dawn',
    decoration: 'kaaba',
    background: 'desert-dusk',
    font: 'scheherazade',
  },
  {
    id: 'arafah-fast',
    category: 'dhul-hijjah',
    kind: 'hadith',
    headline: { en: 'Fasting Arafah', ar: 'صيام يوم عرفة' },
    arabic:
      'صِيَامُ يَوْمِ عَرَفَةَ أَحْتَسِبُ عَلَى اللَّهِ أَنْ يُكَفِّرَ السَّنَةَ الَّتِي قَبْلَهُ وَالسَّنَةَ الَّتِي بَعْدَهُ',
    translation:
      'Fasting the Day of Arafah, I hope from Allah that it expiates the sins of the year before it and the year after it.',
    source: { en: 'Sahih Muslim 1162', ar: 'صحيح مسلم ١١٦٢' },
    theme: 'olive-sage',
    decoration: 'sunrise',
    font: 'amiri',
  },
  {
    id: 'arafah-dua',
    category: 'dhul-hijjah',
    kind: 'dhikr',
    headline: { en: 'The best duaa', ar: 'خير الدعاء دعاء يوم عرفة' },
    arabic:
      'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    translation:
      'There is no god but Allah alone, without partner. To Him belongs the kingdom and the praise, and He is able to do all things.',
    source: { en: 'At-Tirmidhi 3585', ar: 'الترمذي ٣٥٨٥' },
    theme: 'ivory-gold',
    decoration: 'kaaba',
    font: 'amiri',
  },
  {
    id: 'hajj-greeting',
    category: 'dhul-hijjah',
    kind: 'greeting',
    headline: { en: 'Hajj Mabrur', ar: 'حج مبرور' },
    arabic: 'حَجٌّ مَبرور، وَسَعيٌ مَشكور، وَذَنبٌ مَغفور',
    translation: 'An accepted Hajj, a rewarded effort, and forgiven sins.',
    translations: {
      fr: 'Un Hajj agréé, un effort récompensé et des péchés pardonnés.',
      id: 'Haji yang mabrur, usaha yang diterima, dan dosa yang diampuni.',
      ms: 'Haji yang mabrur, usaha yang diterima, dan dosa yang diampuni.',
      th: 'ฮัจญ์ที่ถูกตอบรับ ความเพียรที่ได้รับผลบุญ และบาปที่ถูกอภัย',
      ur: 'حج مبرور، سعی مشکور اور گناہ معاف۔',
    },
    theme: 'charcoal-minimal',
    decoration: 'kaaba',
    font: 'aref-ruqaa',
  },
];
