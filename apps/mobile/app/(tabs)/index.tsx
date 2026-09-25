import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CATEGORIES,
  dailyPicks,
  DEFAULT_DESIGN,
  designFromPost,
  formatClock,
  getPost,
  getPostsByCategory,
  POSTS,
  PRAYER_NAMES,
  type CategoryId,
  type Post,
} from '@barakah/core';
import { useT } from '../../src/i18n';
import { ui } from '../../src/theme';
import { useEditorStore, useRecentStore, useSettingsStore } from '../../src/store';
import { useHijriToday } from '../../src/hooks/useHijriToday';
import { weekdayName } from '../../src/hooks/useWeekday';
import { useLayoutWidth } from '../../src/hooks/useLayoutWidth';
import { usePrayerTimes } from '../../src/features/prayer/usePrayerTimes';
import { PostThumb } from '../../src/components/PostThumb';
import { PostStrip } from '../../src/components/PostStrip';
import { ScrollTopButton } from '../../src/components/ScrollTopButton';
import { BrandMark } from '../../src/brand/BrandMark';
import { useScrollTop } from '../../src/hooks/useScrollTop';
import { REMINDER_OFFER_DELAY_MS, useReminderStore } from '../../src/notifications/store';
import { Button, Chip, SectionTitle } from '../../src/components/ui';

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export default function HomeScreen() {
  const { t, l, locale, font, row, textAlign } = useT();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const width = useLayoutWidth();
  const setLocale = useSettingsStore((s) => s.setLocale);
  const { now, label: hijriLabel, occasions } = useHijriToday();
  const recentIds = useRecentStore((s) => s.ids);
  const touch = useRecentStore((s) => s.touch);
  const load = useEditorStore((s) => s.load);
  const { next, location } = usePrayerTimes();
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  // The grid runs to ~150 rows, so getting back to the top by hand is a chore.
  const { ref: listRef, visible: canScrollTop, onScroll, scrollToTop } = useScrollTop<Post[]>();

  const colWidth = Math.floor((width - 32 - 12) / 2);
  // Seasonal cards first, then a date-seeded rotation over the whole catalogue,
  // so the section is different each day and never empty. See packages/core/src/daily.ts.
  const todays = useMemo(
    () =>
      dailyPicks({
        all: POSTS,
        seasonal: occasions.flatMap((o) => getPostsByCategory(o.category)),
        date: now,
      }),
    [occasions, now],
  );
  const recent = useMemo(() => recentIds.map((id) => getPost(id)).filter((p): p is Post => !!p), [recentIds]);
  const posts = useMemo(() => (category === 'all' ? [...POSTS] : getPostsByCategory(category)), [category]);
  const rows = useMemo(() => chunk(posts, 2), [posts]);
  const categories = useMemo(() => [...CATEGORIES].sort((a, b) => a.order - b.order), []);

  // Offered a few seconds after the home screen has settled, and read through
  // getState() so the launch counter bumped by the root layout is already in.
  useEffect(() => {
    const id = setTimeout(() => {
      const store = useReminderStore.getState();
      if (store.dueToOffer()) store.openOffer('offer');
    }, REMINDER_OFFER_DELAY_MS);
    return () => clearTimeout(id);
  }, []);

  const openPost = (post: Post) => {
    touch(post.id);
    load(designFromPost(post, locale));
    router.push('/editor');
  };
  const openBlank = () => {
    load({ ...DEFAULT_DESIGN, arabic: '' });
    router.push('/editor');
  };

  const header = (
    <View style={{ paddingTop: insets.top + 8 }}>
      {/* brand row */}
      <View style={{ flexDirection: row, alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: row, alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: ui.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BrandMark size={24} color={ui.accentInk} />
          </View>
          <View>
            <Text style={{ color: ui.text, fontFamily: font.semibold, fontSize: 17, textAlign }}>
              {t('appName')}
            </Text>
            <Text style={{ color: ui.textMuted, fontFamily: font.regular, fontSize: 12, textAlign }}>
              {t('tagline')}
            </Text>
          </View>
        </View>
        <Chip label={t('language')} onPress={() => setLocale(locale === 'ar' ? 'en' : 'ar')} />
      </View>

      {/* today strip */}
      <Pressable
        onPress={() => router.push('/prayer')}
        style={{
          backgroundColor: ui.bgElev2,
          borderRadius: ui.radius,
          borderWidth: 1,
          borderColor: ui.line,
          padding: 14,
          marginTop: 14,
          gap: 6,
        }}
      >
        <View style={{ flexDirection: row, alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <Text style={{ color: ui.text, fontFamily: font.semibold, fontSize: 19 }}>
            {weekdayName(now, locale)}
          </Text>
          {hijriLabel !== '' && (
            <Text style={{ color: ui.accent, fontFamily: font.medium }}>{hijriLabel}</Text>
          )}
        </View>
        <View style={{ flexDirection: row, alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 16 }}>🕌</Text>
          {next && location ? (
            <Text style={{ color: ui.textMuted, fontFamily: font.regular }}>
              {t('nextPrayer')}: {l(PRAYER_NAMES.find((p) => p.id === next.id)!.label)}{' '}
              <Text style={{ color: ui.text, fontFamily: font.semibold }}>
                {formatClock(next.time, locale, location.timeZone)}
              </Text>
            </Text>
          ) : (
            <Text style={{ color: ui.textMuted, fontFamily: font.regular }}>
              {t('prayerTimes')} · {t('qibla')} ›
            </Text>
          )}
        </View>
      </Pressable>

      <PostStrip title={t('todaysPosts')} posts={todays} hijriLabel={hijriLabel} onOpen={openPost} />
      <PostStrip title={t('recent')} posts={recent} hijriLabel={hijriLabel} onOpen={openPost} />

      <SectionTitle
        right={<Button label={`＋ ${t('blank')}`} onPress={openBlank} size="sm" variant="ghost" />}
      >
        {t('allPosts')}
      </SectionTitle>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -16, marginBottom: 12 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        <Chip label={t('all')} active={category === 'all'} onPress={() => setCategory('all')} />
        {categories.map((c) => (
          <Chip
            key={c.id}
            label={`${c.icon} ${l(c.label)}`}
            active={category === c.id}
            onPress={() => setCategory(c.id)}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={listRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        data={rows}
        keyExtractor={(r) => r.map((p) => p.id).join('|')}
        ListHeaderComponent={header}
        extraData={colWidth}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        initialNumToRender={4}
        windowSize={5}
        renderItem={({ item }) => (
          <View style={{ flexDirection: row, gap: 12, marginBottom: 16 }}>
            {item.map((p) => (
              <PostThumb key={p.id} post={p} width={colWidth} hijriLabel={hijriLabel} onOpen={openPost} />
            ))}
          </View>
        )}
      />
      <ScrollTopButton visible={canScrollTop} onPress={scrollToTop} />
    </View>
  );
}
