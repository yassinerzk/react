import type { Post } from '../../types';

export const laylatAlQadrPosts: Post[] = [
  {
    id: 'qadr-verse',
    category: 'laylat-al-qadr',
    kind: 'quran',
    arabic:
      'إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ ۝ وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ ۝ لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ',
    translation:
      'Indeed, We sent it down on the Night of Decree. And what will make you know what the Night of Decree is? The Night of Decree is better than a thousand months.',
    source: { en: 'Surah Al-Qadr 97:1-3', ar: 'سورة القدر ٩٧:١-٣' },
    theme: 'midnight-blue',
    decoration: 'stars',
    font: 'amiri',
  },
  {
    id: 'qadr-dua',
    category: 'laylat-al-qadr',
    kind: 'dua',
    headline: { en: 'The duaa of the night', ar: 'دعاء ليلة القدر' },
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    translation: 'O Allah, You are Most Forgiving and You love forgiveness, so forgive me.',
    source: { en: 'At-Tirmidhi 3513, Ibn Majah 3850', ar: 'الترمذي ٣٥١٣، ابن ماجه ٣٨٥٠' },
    theme: 'royal-purple',
    decoration: 'crescent',
    font: 'aref-ruqaa',
  },
  {
    id: 'qadr-seek',
    category: 'laylat-al-qadr',
    kind: 'hadith',
    arabic: 'تَحَرَّوْا لَيْلَةَ الْقَدْرِ فِي الْوِتْرِ مِنَ الْعَشْرِ الْأَوَاخِرِ مِنْ رَمَضَانَ',
    translation: 'Seek the Night of Decree in the odd nights of the last ten nights of Ramadan.',
    source: { en: 'Sahih al-Bukhari 2017', ar: 'صحيح البخاري ٢٠١٧' },
    theme: 'charcoal-minimal',
    decoration: 'stars',
    font: 'scheherazade',
  },
];
