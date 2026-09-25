import type { Post } from '../../types';

export const eidAlAdhaPosts: Post[] = [
  {
    id: 'adha-greeting',
    category: 'eid-al-adha',
    kind: 'greeting',
    headline: { en: 'Eid al-Adha Mubarak', ar: 'عيد أضحى مبارك' },
    arabic: 'كُلُّ عامٍ وَأَنتُم بِخَير، تَقَبَّلَ اللهُ طاعاتِكُم وَأَضاحِيَكُم',
    translation: 'May you be well every year. May Allah accept your worship and your sacrifice.',
    translations: {
      fr: "Que chaque année vous trouve en bonne santé. Qu'Allah accepte vos adorations et votre sacrifice.",
      id: 'Semoga Anda selalu dalam kebaikan setiap tahun. Semoga Allah menerima ibadah dan kurban Anda.',
      ms: 'Semoga anda sentiasa dalam kebaikan setiap tahun. Semoga Allah menerima ibadah dan korban anda.',
      th: 'ขอให้ท่านมีสุขทุกปี ขออัลลอฮฺทรงตอบรับการอิบาดะฮฺและการเชือดพลีของท่าน',
      ur: 'ہر سال آپ خیریت سے رہیں۔ اللہ آپ کی عبادات اور قربانی قبول فرمائے۔',
    },
    theme: 'burgundy-gold',
    decoration: 'lights',
    font: 'aref-ruqaa',
  },
  {
    id: 'adha-verse-taqwa',
    category: 'eid-al-adha',
    kind: 'quran',
    arabic: 'لَن يَنَالَ اللَّهَ لُحُومُهَا وَلَا دِمَاؤُهَا وَلَٰكِن يَنَالُهُ التَّقْوَىٰ مِنكُمْ',
    translation: 'Their meat will not reach Allah, nor their blood, but what reaches Him is your piety.',
    source: { en: 'Surah Al-Hajj 22:37', ar: 'سورة الحج ٢٢:٣٧' },
    theme: 'olive-sage',
    decoration: 'arch',
    font: 'amiri',
  },
  {
    id: 'adha-verse-kawthar',
    category: 'eid-al-adha',
    kind: 'quran',
    arabic: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ',
    translation: 'So pray to your Lord and sacrifice.',
    source: { en: 'Surah Al-Kawthar 108:2', ar: 'سورة الكوثر ١٠٨:٢' },
    theme: 'ivory-gold',
    decoration: 'crescent',
    font: 'aref-ruqaa',
  },
  {
    id: 'adha-takbeer',
    category: 'eid-al-adha',
    kind: 'dhikr',
    headline: { en: 'Takbeer of Eid', ar: 'تكبيرات العيد' },
    arabic:
      'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، وَلِلَّهِ الْحَمْدُ',
    translation:
      'Allah is the Greatest, Allah is the Greatest, Allah is the Greatest. There is no god but Allah. Allah is the Greatest, Allah is the Greatest, and to Allah belongs all praise.',
    theme: 'emerald-night',
    decoration: 'mosque',
    font: 'reem-kufi',
  },
];
