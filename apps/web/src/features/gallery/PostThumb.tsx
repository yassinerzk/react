import { memo } from 'react';
import { designFromPost, KIND_KEY, type Post } from '@barakah/core';
import { useT } from '@/shared/hooks/useT';
import { StoryPreview } from '@/features/story/StoryPreview';

interface PostThumbProps {
  post: Post;
  hijriLabel: string;
  onOpen: (post: Post) => void;
}

export const PostThumb = memo(function PostThumb({ post, hijriLabel, onOpen }: PostThumbProps) {
  const { t, l, locale } = useT();
  const design = designFromPost(post, locale);
  const title = post.headline ? l(post.headline) : post.source ? l(post.source) : t(KIND_KEY[post.kind]);
  return (
    <button type="button" className="thumb" onClick={() => onOpen(post)} aria-label={title}>
      <StoryPreview design={design} hijriLabel={hijriLabel} className="thumb__card" />
      <span className="thumb__meta">
        <span className="thumb__kind">{t(KIND_KEY[post.kind])}</span>
        <span className="thumb__title">{title}</span>
      </span>
    </button>
  );
});
