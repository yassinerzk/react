import type { Post } from '../../types';

export const muharramPosts: Post[] = [
  {
    id: 'hijri-new-year',
    category: 'muharram',
    kind: 'greeting',
    headline: { en: 'Happy New Hijri Year', ar: 'كل عام وأنتم بخير' },
    arabic: 'عامٌ هِجرِيٌّ جَديد، نَسأَلُ اللهَ أَن يَجعَلَهُ عامَ خَيرٍ وَبَرَكَةٍ وَأَمن',
    translation: 'A new Hijri year. We ask Allah to make it a year of goodness, blessing and safety.',
    theme: 'midnight-blue',
    decoration: 'crescent',
    font: 'aref-ruqaa',
  },
  {
    id: 'muharram-fast',
    category: 'muharram',
    kind: 'hadith',
    arabic: 'أَفْضَلُ الصِّيَامِ بَعْدَ رَمَضَانَ شَهْرُ اللَّهِ الْمُحَرَّمُ',
    translation: 'The best fasting after Ramadan is in the month of Allah, Muharram.',
    source: { en: 'Sahih Muslim 1163', ar: 'صحيح مسلم ١١٦٣' },
    theme: 'charcoal-minimal',
    decoration: 'stars',
    font: 'scheherazade',
  },
  {
    id: 'ashura-fast',
    category: 'muharram',
    kind: 'hadith',
    headline: { en: 'Ashura', ar: 'يوم عاشوراء' },
    arabic: 'صِيَامُ يَوْمِ عَاشُورَاءَ أَحْتَسِبُ عَلَى اللَّهِ أَنْ يُكَفِّرَ السَّنَةَ الَّتِي قَبْلَهُ',
    translation:
      'Fasting the Day of Ashura, I hope from Allah that it expiates the sins of the year before it.',
    source: { en: 'Sahih Muslim 1162', ar: 'صحيح مسلم ١١٦٢' },
    theme: 'emerald-night',
    decoration: 'crescent',
    font: 'naskh',
  },
  {
    id: 'muharram-verse',
    category: 'muharram',
    kind: 'quran',
    arabic:
      'إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا فِي كِتَابِ اللَّهِ يَوْمَ خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ مِنْهَا أَرْبَعَةٌ حُرُمٌ',
    translation:
      'Indeed, the number of months with Allah is twelve months in the register of Allah from the day He created the heavens and the earth; of them, four are sacred.',
    source: { en: 'Surah At-Tawbah 9:36', ar: 'سورة التوبة ٩:٣٦' },
    theme: 'ivory-gold',
    decoration: 'arch',
    font: 'amiri',
  },
];
