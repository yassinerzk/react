import type { Post } from '../../types';

export const israMirajPosts: Post[] = [
  {
    id: 'isra-verse',
    category: 'isra-miraj',
    kind: 'quran',
    arabic:
      'سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا مِّنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى الَّذِي بَارَكْنَا حَوْلَهُ لِنُرِيَهُ مِنْ آيَاتِنَا ۚ إِنَّهُ هُوَ السَّمِيعُ الْبَصِيرُ',
    translation:
      'Glory be to Him who took His servant by night from the Sacred Mosque to the Farthest Mosque, whose surroundings We have blessed, to show him of Our signs. Indeed, He is the All-Hearing, the All-Seeing.',
    source: { en: 'Surah Al-Isra 17:1', ar: 'سورة الإسراء ١٧:١' },
    theme: 'midnight-blue',
    decoration: 'mosque',
    font: 'amiri',
  },
  {
    id: 'isra-najm',
    category: 'isra-miraj',
    kind: 'quran',
    arabic: 'مَا زَاغَ الْبَصَرُ وَمَا طَغَىٰ ۝ لَقَدْ رَأَىٰ مِنْ آيَاتِ رَبِّهِ الْكُبْرَىٰ',
    translation:
      'The sight did not swerve, nor did it transgress. He certainly saw of the greatest signs of his Lord.',
    source: { en: 'Surah An-Najm 53:17-18', ar: 'سورة النجم ٥٣:١٧-١٨' },
    theme: 'royal-purple',
    decoration: 'stars',
    font: 'scheherazade',
  },
];
