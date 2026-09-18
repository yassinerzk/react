import { useMemo, useState } from 'react';
import { CATEGORIES, POSTS, designFromPost, DEFAULT_DESIGN, type CategoryId, type Post } from '@barakah/core';
import { useEditorStore, useNavStore } from '@/app/store';
import { useT } from '@/shared/hooks/useT';
import { useHijriToday } from '@/shared/hooks/useHijriToday';
import { Chip } from '@/shared/ui/Chip';
import { Button } from '@/shared/ui/Button';
import { TodayStrip } from '@/features/today/TodayStrip';
import { LibraryList } from '@/features/library/LibraryList';
import { PostThumb } from './PostThumb';

type Tab = 'browse' | 'mine';

export function GalleryScreen() {
  const { t, l, locale } = useT();
  const { label: hijriLabel } = useHijriToday();
  const navigate = useNavStore((s) => s.navigate);
  const load = useEditorStore((s) => s.load);
  const [tab, setTab] = useState<Tab>('browse');
  const [category, setCategory] = useState<CategoryId | 'all'>('all');

  const categories = useMemo(() => [...CATEGORIES].sort((a, b) => a.order - b.order), []);
  const posts = useMemo(
    () => (category === 'all' ? POSTS : POSTS.filter((p) => p.category === category)),
    [category],
  );

  const openPost = (post: Post) => {
    load(designFromPost(post, locale));
    navigate({ name: 'editor' });
  };
  const openBlank = () => {
    load({ ...DEFAULT_DESIGN, headline: locale === 'ar' ? '' : '', arabic: '' });
    navigate({ name: 'editor' });
  };
  const pickCategory = (id: CategoryId) => {
    setTab('browse');
    setCategory(id);
    document.getElementById('gallery-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="gallery">
      <TodayStrip onPick={pickCategory} />

      <div className="tabs" role="tablist">
        <button
          role="tab"
          type="button"
          aria-selected={tab === 'browse'}
          className="tab"
          onClick={() => setTab('browse')}
        >
          {t('browse')}
        </button>
        <button
          role="tab"
          type="button"
          aria-selected={tab === 'mine'}
          className="tab"
          onClick={() => setTab('mine')}
        >
          {t('myPosts')}
        </button>
        <Button variant="ghost" size="sm" onClick={openBlank} className="tabs__action">
          ＋ {t('blank')}
        </Button>
      </div>

      {tab === 'browse' ? (
        <>
          <div className="chips chips--scroll" role="group">
            <Chip active={category === 'all'} onClick={() => setCategory('all')}>
              {t('all')}
            </Chip>
            {categories.map((c) => (
              <Chip
                key={c.id}
                active={category === c.id}
                onClick={() => setCategory(c.id)}
                title={l(c.description)}
              >
                <span aria-hidden>{c.icon}</span> {l(c.label)}
              </Chip>
            ))}
          </div>
          <div id="gallery-grid" className="grid">
            {posts.map((p) => (
              <PostThumb key={p.id} post={p} hijriLabel={hijriLabel} onOpen={openPost} />
            ))}
          </div>
        </>
      ) : (
        <LibraryList hijriLabel={hijriLabel} />
      )}
    </main>
  );
}
