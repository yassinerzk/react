import { memo } from 'react';
import { Text, View } from 'react-native';
import { getSection, HADITH_BOOKS, toLocaleDigits, type HadithEntry } from '@barakah/core';
import { useT } from '../i18n';
import { ui } from '../theme';

interface HadithCardProps {
  entry: HadithEntry;
  showBook?: boolean;
  arabicSize?: number;
}

export const HadithCard = memo(function HadithCard({ entry, showBook, arabicSize = 21 }: HadithCardProps) {
  const { t, locale, font, row, textAlign } = useT();
  const section = getSection(entry.book, entry.section);
  return (
    <View
      style={{
        backgroundColor: ui.bgElev,
        borderRadius: ui.radius,
        borderWidth: 1,
        borderColor: ui.line,
        padding: 14,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: row, justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <Text
          style={{ color: ui.accent, fontFamily: font.medium, fontSize: 12, flexShrink: 1 }}
          numberOfLines={1}
        >
          {showBook ? `${HADITH_BOOKS[entry.book].name} · ` : ''}
          {section?.en ?? ''}
        </Text>
        <Text style={{ color: ui.textMuted, fontFamily: font.regular, fontSize: 12 }}>
          {t('hadithNumber')} {toLocaleDigits(entry.number, locale)}
        </Text>
      </View>
      {entry.ar !== '' && (
        <Text
          style={{
            color: ui.text,
            fontFamily: 'Amiri_400Regular',
            fontSize: arabicSize,
            lineHeight: arabicSize * 1.85,
            textAlign: 'right',
            writingDirection: 'rtl',
          }}
        >
          {entry.ar}
        </Text>
      )}
      <Text
        style={{ color: ui.textMuted, fontFamily: font.regular, fontSize: 15, lineHeight: 23, textAlign }}
      >
        {entry.en}
      </Text>
      {entry.grade && (
        <Text style={{ color: ui.textMuted, fontFamily: font.medium, fontSize: 12 }}>
          {t('grade')}: {entry.grade}
        </Text>
      )}
    </View>
  );
});
