import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FlatList, Text, View, type ViewToken } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSection, HADITH_BOOKS, toLocaleDigits, type HadithBookId, type HadithEntry } from '@barakah/core';
import { useT } from '../../../src/i18n';
import { ui } from '../../../src/theme';
import { useHadithStore } from '../../../src/store';
import { useHadithLibrary } from '../../../src/hadith/library';
import { Button } from '../../../src/components/ui';
import { HadithCard } from '../../../src/components/HadithCard';

export default function HadithSectionScreen() {
  const { book, section, number } = useLocalSearchParams<{
    book: HadithBookId;
    section: string;
    number?: string;
  }>();
  const sectionId = Number(section);
  const { t, locale, font, row, textAlign } = useT();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const entries = useHadithLibrary((s) => s.entries[book]);
  const status = useHadithLibrary((s) => s.status[book]);
  const ensure = useHadithLibrary((s) => s.ensure);
  const setLastRead = useHadithStore((s) => s.setLastRead);
  const listRef = useRef<FlatList<HadithEntry>>(null);
  const meta = HADITH_BOOKS[book];
  const sec = getSection(book, sectionId);
  const items = useMemo(() => (entries ?? []).filter((e) => e.section === sectionId), [entries, sectionId]);

  useEffect(() => {
    if (!entries && status !== 'loading') void ensure(book);
  }, [book, entries, status, ensure]);

  useEffect(() => {
    const target = Number(number);
    if (!target || items.length === 0) return;
    const idx = items.findIndex((e) => e.number === target);
    if (idx > 0) {
      const h = setTimeout(
        () => listRef.current?.scrollToIndex({ index: idx, animated: false, viewPosition: 0.05 }),
        300,
      );
      return () => clearTimeout(h);
    }
  }, [number, items]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<HadithEntry>[] }) => {
      const first = viewableItems[0]?.item;
      if (first) setLastRead(book, sectionId, first.number);
    },
    [book, sectionId, setLastRead],
  );

  if (!meta || !sec) return null;
  return (
    <View style={{ flex: 1, backgroundColor: ui.bg }}>
      <View
        style={{
          paddingTop: insets.top + 6,
          paddingHorizontal: 16,
          paddingBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: ui.line,
          gap: 4,
        }}
      >
        <View style={{ flexDirection: row, justifyContent: 'space-between', alignItems: 'center' }}>
          <Button label={`← ${t('back')}`} size="sm" variant="ghost" onPress={() => router.back()} />
          <Text style={{ color: ui.accent, fontFamily: 'Amiri_700Bold', fontSize: 20 }}>{meta.nameAr}</Text>
        </View>
        <Text style={{ color: ui.text, fontFamily: font.semibold, fontSize: 18, textAlign }}>{sec.en}</Text>
        <Text style={{ color: ui.textMuted, fontFamily: font.regular, fontSize: 12, textAlign }}>
          {meta.name} · {toLocaleDigits(items.length, locale)} {t('hadithNumber')}
        </Text>
      </View>
      {!entries ? (
        <Text style={{ color: ui.textMuted, fontFamily: font.regular, textAlign: 'center', padding: 30 }}>
          {status === 'error' ? t('shareFailed') : t('downloading')}
        </Text>
      ) : (
        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(e) => String(e.number)}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 40 }}
          initialNumToRender={8}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 30 }}
          onScrollToIndexFailed={(info) =>
            setTimeout(() => listRef.current?.scrollToIndex({ index: info.index, animated: false }), 400)
          }
          renderItem={({ item }) => <HadithCard entry={item} />}
        />
      )}
    </View>
  );
}
