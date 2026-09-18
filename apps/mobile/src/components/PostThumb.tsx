import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { designFromPost, KIND_KEY, type Post } from '@barakah/core';
import { StoryCard } from './StoryCard';
import { useT } from '../i18n';
import { ui } from '../theme';

interface PostThumbProps {
  post: Post;
  width: number;
  hijriLabel: string;
  onOpen: (post: Post) => void;
}

export const PostThumb = memo(function PostThumb({ post, width, hijriLabel, onOpen }: PostThumbProps) {
  const { t, l, locale, font, textAlign } = useT();
  const design = designFromPost(post, locale);
  const title = post.headline ? l(post.headline) : post.source ? l(post.source) : t(KIND_KEY[post.kind]);
  return (
    <Pressable
      onPress={() => onOpen(post)}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={{ width }}
    >
      <View style={{ borderRadius: 14, overflow: 'hidden' }}>
        <StoryCard design={design} width={width} hijriLabel={hijriLabel} />
      </View>
      <Text style={{ color: ui.accent, fontFamily: font.medium, fontSize: 11, marginTop: 8, textAlign }}>
        {t(KIND_KEY[post.kind]).toUpperCase()}
      </Text>
      <Text numberOfLines={1} style={{ color: ui.text, fontFamily: font.regular, fontSize: 13, textAlign }}>
        {title}
      </Text>
    </Pressable>
  );
});
