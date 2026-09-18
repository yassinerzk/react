import type { Post } from '@/domain/types';

export const eveningPosts: Post[] = [
  {
    id: 'evening-amsayna',
    category: 'evening',
    kind: 'dhikr',
    headline: { en: 'Evening adhkar', ar: 'أذكار المساء' },
    arabic:
      'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    translation:
      'We have entered the evening and the whole kingdom belongs to Allah. All praise is for Allah. There is no god but Allah alone, without partner. To Him belongs the kingdom and the praise, and He is able to do all things.',
    source: { en: 'Sahih Muslim 2723', ar: 'صحيح مسلم ٢٧٢٣' },
    theme: 'midnight-blue',
    decoration: 'crescent',
    font: 'naskh',
  },
  {
    id: 'evening-bika-amsayna',
    category: 'evening',
    kind: 'dua',
    arabic:
      'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
    translation:
      'O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is the final return.',
    source: { en: 'At-Tirmidhi 3391', ar: 'سنن الترمذي ٣٣٩١' },
    theme: 'royal-purple',
    decoration: 'stars',
    font: 'amiri',
  },
  {
    id: 'evening-protection',
    category: 'evening',
    kind: 'dua',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    source: { en: 'Sahih Muslim 2709', ar: 'صحيح مسلم ٢٧٠٩' },
    theme: 'charcoal-minimal',
    decoration: 'crescent',
    font: 'scheherazade',
  },
  {
    id: 'evening-greeting',
    category: 'evening',
    kind: 'greeting',
    headline: { en: 'Good evening', ar: 'مساء الخير' },
    arabic: 'مَساءُ النُّورِ وَالسَّكينَة، أَسعَدَ اللهُ مَساءَكُم بِكُلِّ خَير',
    translation: 'An evening of light and tranquility. May Allah make your evening happy with every good.',
    theme: 'midnight-blue',
    decoration: 'lanterns',
    background: 'lavender-field',
    font: 'aref-ruqaa',
  },
  {
    id: 'evening-hearts',
    category: 'evening',
    kind: 'quran',
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    translation: 'Truly, in the remembrance of Allah do hearts find rest.',
    source: { en: "Surah Ar-Ra'd 13:28", ar: 'سورة الرعد ١٣:٢٨' },
    theme: 'royal-purple',
    decoration: 'crescent',
    background: 'starry-night',
    font: 'aref-ruqaa',
  },
];
