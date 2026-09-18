import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useT } from '../../src/i18n';
import { ui } from '../../src/theme';
import { useEditorStore, useLibraryStore } from '../../src/store';
import { useHijriToday } from '../../src/hooks/useHijriToday';
import { useLayoutWidth } from '../../src/hooks/useLayoutWidth';
import { StoryCard } from '../../src/components/StoryCard';
import { Button } from '../../src/components/ui';

export default function MineScreen() {
  const { t, font, row, textAlign } = useT();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const width = useLayoutWidth();
  const { label: hijriLabel } = useHijriToday();
  const items = useLibraryStore((s) => s.items);
  const remove = useLibraryStore((s) => s.remove);
  const upsert = useLibraryStore((s) => s.upsert);
  const load = useEditorStore((s) => s.load);
  const colWidth = Math.floor((width - 32 - 12) / 2);

  return (
    <FlatList
      data={items}
      numColumns={2}
      keyExtractor={(i) => i.id}
      extraData={colWidth}
      columnWrapperStyle={{ gap: 12, flexDirection: row }}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, gap: 16 }}
      ListHeaderComponent={
        <Text style={{ color: ui.text, fontFamily: font.semibold, fontSize: 24, textAlign }}>
          {t('myPosts')}
        </Text>
      }
      ListEmptyComponent={
        <Text
          style={{ color: ui.textMuted, fontFamily: font.regular, textAlign: 'center', paddingVertical: 40 }}
        >
          {t('myPostsEmpty')}
        </Text>
      }
      renderItem={({ item }) => (
        <View style={{ width: colWidth, gap: 8 }}>
          <Pressable
            onPress={() => {
              load(item.design, item.id);
              router.push('/editor');
            }}
            style={{ borderRadius: 14, overflow: 'hidden' }}
          >
            <StoryCard design={item.design} width={colWidth} hijriLabel={hijriLabel} />
          </Pressable>
          <View style={{ flexDirection: row, gap: 6, justifyContent: 'flex-end' }}>
            <Button label={t('duplicate')} size="sm" variant="ghost" onPress={() => upsert(item.design)} />
            <Button label={t('delete')} size="sm" variant="danger" onPress={() => remove(item.id)} />
          </View>
        </View>
      )}
    />
  );
}
