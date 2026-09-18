import { ScrollView, View } from 'react-native';
import type { Post } from '@barakah/core';
import { PostThumb } from './PostThumb';
import { SectionTitle } from './ui';
import { useT } from '../i18n';

interface PostStripProps {
  title: string;
  posts: Post[];
  hijriLabel: string;
  onOpen: (post: Post) => void;
}

/** Horizontal row of story thumbnails under a section title. */
export function PostStrip({ title, posts, hijriLabel, onOpen }: PostStripProps) {
  const { rtl } = useT();
  if (posts.length === 0) return null;
  return (
    <View>
      <SectionTitle>{title}</SectionTitle>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 16, flexDirection: rtl ? 'row-reverse' : 'row' }}
        style={{ marginHorizontal: -16 }}
      >
        {posts.map((p) => (
          <PostThumb key={p.id} post={p} width={150} hijriLabel={hijriLabel} onOpen={onOpen} />
        ))}
      </ScrollView>
    </View>
  );
}
