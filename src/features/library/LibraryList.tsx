import { useEditorStore, useLibraryStore, useNavStore } from '@/app/store';
import { useT } from '@/shared/hooks/useT';
import { Button } from '@/shared/ui/Button';
import { StoryPreview } from '@/features/story/StoryPreview';

interface LibraryListProps {
  hijriLabel: string;
}

export function LibraryList({ hijriLabel }: LibraryListProps) {
  const { t } = useT();
  const items = useLibraryStore((s) => s.items);
  const remove = useLibraryStore((s) => s.remove);
  const upsert = useLibraryStore((s) => s.upsert);
  const load = useEditorStore((s) => s.load);
  const navigate = useNavStore((s) => s.navigate);

  if (items.length === 0) return <p className="empty">{t('myPostsEmpty')}</p>;

  return (
    <div className="grid">
      {items.map((item) => (
        <div key={item.id} className="thumb thumb--saved">
          <button
            type="button"
            className="thumb__open"
            onClick={() => {
              load(item.design);
              navigate({ name: 'editor', savedId: item.id });
            }}
            aria-label={t('edit')}
          >
            <StoryPreview design={item.design} hijriLabel={hijriLabel} className="thumb__card" />
          </button>
          <div className="thumb__actions">
            <Button size="sm" variant="ghost" onClick={() => upsert(item.design)}>
              {t('duplicate')}
            </Button>
            <Button size="sm" variant="danger" onClick={() => remove(item.id)}>
              {t('delete')}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
