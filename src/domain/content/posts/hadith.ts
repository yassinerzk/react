import type { Post } from '@/domain/types';

export const hadithPosts: Post[] = [
  {
    id: 'hadith-good-word',
    category: 'hadith',
    kind: 'hadith',
    arabic: 'الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ',
    translation: 'A good word is charity.',
    source: { en: 'Sahih al-Bukhari 2989', ar: 'صحيح البخاري ٢٩٨٩' },
    theme: 'ivory-gold',
    decoration: 'arch',
    font: 'aref-ruqaa',
  },
  {
    id: 'hadith-smile',
    category: 'hadith',
    kind: 'hadith',
    arabic: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
    translation: 'Your smile in the face of your brother is charity.',
    source: { en: 'At-Tirmidhi 1956', ar: 'الترمذي ١٩٥٦' },
    theme: 'desert-dawn',
    decoration: 'sunrise',
    font: 'cairo',
  },
  {
    id: 'hadith-best-quran',
    category: 'hadith',
    kind: 'hadith',
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    translation: 'The best of you are those who learn the Quran and teach it.',
    source: { en: 'Sahih al-Bukhari 5027', ar: 'صحيح البخاري ٥٠٢٧' },
    theme: 'emerald-night',
    decoration: 'arch',
    font: 'naskh',
  },
  {
    id: 'hadith-mercy',
    category: 'hadith',
    kind: 'hadith',
    arabic:
      'الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الْأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ',
    translation:
      'The merciful are shown mercy by the Most Merciful. Be merciful to those on earth and the One in heaven will be merciful to you.',
    source: { en: 'At-Tirmidhi 1924', ar: 'الترمذي ١٩٢٤' },
    theme: 'teal-lagoon',
    decoration: 'none',
    font: 'scheherazade',
  },
  {
    id: 'hadith-deeds-intentions',
    category: 'hadith',
    kind: 'hadith',
    arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    translation: 'Actions are judged by intentions, and every person will have what they intended.',
    source: { en: 'Sahih al-Bukhari 1, Sahih Muslim 1907', ar: 'صحيح البخاري ١، صحيح مسلم ١٩٠٧' },
    theme: 'charcoal-minimal',
    decoration: 'none',
    font: 'amiri',
  },
  {
    id: 'hadith-strong',
    category: 'hadith',
    kind: 'hadith',
    arabic:
      'الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ، وَفِي كُلٍّ خَيْرٌ',
    translation:
      'The strong believer is better and more beloved to Allah than the weak believer, and in both there is good.',
    source: { en: 'Sahih Muslim 2664', ar: 'صحيح مسلم ٢٦٦٤' },
    theme: 'burgundy-gold',
    decoration: 'stars',
    font: 'reem-kufi',
  },
];
