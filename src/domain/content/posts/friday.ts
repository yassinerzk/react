import type { Post } from '@/domain/types';

export const fridayPosts: Post[] = [
  {
    id: 'friday-greeting',
    category: 'friday',
    kind: 'greeting',
    headline: { en: "Jumu'ah Mubarak", ar: 'جمعة مباركة' },
    arabic: 'جَعَلَ اللهُ جُمعَتَكُم مُبارَكَة، وَغَفَرَ لَكُم وَلِأَحبابِكُم',
    translation: 'May Allah bless your Friday and forgive you and your loved ones.',
    theme: 'emerald-night',
    decoration: 'mosque',
    font: 'aref-ruqaa',
  },
  {
    id: 'friday-salawat',
    category: 'friday',
    kind: 'dhikr',
    headline: { en: 'Salawat on Friday', ar: 'الصلاة على النبي' },
    arabic:
      'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ',
    translation:
      'O Allah, send Your blessings, peace and grace upon our master Muhammad, his family and all his companions.',
    theme: 'ivory-gold',
    decoration: 'arch',
    font: 'amiri',
  },
  {
    id: 'friday-best-day',
    category: 'friday',
    kind: 'hadith',
    arabic:
      'خَيْرُ يَوْمٍ طَلَعَتْ عَلَيْهِ الشَّمْسُ يَوْمُ الْجُمُعَةِ، فِيهِ خُلِقَ آدَمُ، وَفِيهِ أُدْخِلَ الْجَنَّةَ، وَفِيهِ أُخْرِجَ مِنْهَا',
    translation:
      'The best day on which the sun has risen is Friday. On it Adam was created, on it he was admitted into Paradise, and on it he was taken out of it.',
    source: { en: 'Sahih Muslim 854', ar: 'صحيح مسلم ٨٥٤' },
    theme: 'midnight-blue',
    decoration: 'mosque',
    font: 'scheherazade',
  },
  {
    id: 'friday-kahf',
    category: 'friday',
    kind: 'hadith',
    headline: { en: "Don't forget Al-Kahf", ar: 'لا تنسَ سورة الكهف' },
    arabic:
      'مَنْ قَرَأَ سُورَةَ الْكَهْفِ فِي يَوْمِ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ',
    translation:
      'Whoever recites Surah Al-Kahf on Friday, a light will shine for him between the two Fridays.',
    source: { en: 'Al-Hakim, Al-Bayhaqi (authenticated by Al-Albani)', ar: 'الحاكم والبيهقي، صححه الألباني' },
    theme: 'burgundy-gold',
    decoration: 'stars',
    font: 'naskh',
  },
  {
    id: 'friday-verse',
    category: 'friday',
    kind: 'quran',
    arabic:
      'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا نُودِيَ لِلصَّلَاةِ مِن يَوْمِ الْجُمُعَةِ فَاسْعَوْا إِلَىٰ ذِكْرِ اللَّهِ وَذَرُوا الْبَيْعَ ۚ ذَٰلِكُمْ خَيْرٌ لَّكُمْ إِن كُنتُمْ تَعْلَمُونَ',
    translation:
      'O you who believe, when the call is made for prayer on Friday, hasten to the remembrance of Allah and leave trade. That is better for you, if you only knew.',
    source: { en: "Surah Al-Jumu'ah 62:9", ar: 'سورة الجمعة ٦٢:٩' },
    theme: 'olive-sage',
    decoration: 'arch',
    font: 'amiri',
  },
  {
    id: 'friday-dua-hour',
    category: 'friday',
    kind: 'hadith',
    headline: { en: 'The hour of acceptance', ar: 'ساعة الإجابة' },
    arabic:
      'فِيهِ سَاعَةٌ لَا يُوَافِقُهَا عَبْدٌ مُسْلِمٌ وَهُوَ قَائِمٌ يُصَلِّي يَسْأَلُ اللَّهَ شَيْئًا إِلَّا أَعْطَاهُ إِيَّاهُ',
    translation:
      'On Friday there is an hour in which no Muslim servant stands in prayer asking Allah for something except that He grants it to him.',
    source: { en: 'Sahih al-Bukhari 935', ar: 'صحيح البخاري ٩٣٥' },
    theme: 'teal-lagoon',
    decoration: 'crescent',
    font: 'scheherazade',
  },
];
