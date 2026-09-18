import { useRef, useState } from 'react';
import { useEditorStore, useLibraryStore, useNavStore, useToastStore } from '@/app/store';
import { useT } from '@/shared/hooks/useT';
import { useHijriToday } from '@/shared/hooks/useHijriToday';
import { Button } from '@/shared/ui/Button';
import { canShareFiles } from '@/shared/lib/share';
import { StoryPreview } from '@/features/story/StoryPreview';
import { TextPanel } from './TextPanel';
import { StylePanel } from './StylePanel';
import { useShareStory } from './useShareStory';

type Panel = 'text' | 'style';

interface EditorScreenProps {
  savedId?: string;
}

export function EditorScreen({ savedId }: EditorScreenProps) {
  const { t } = useT();
  const { label: hijriLabel } = useHijriToday();
  const design = useEditorStore((s) => s.design);
  const upsert = useLibraryStore((s) => s.upsert);
  const navigate = useNavStore((s) => s.navigate);
  const toast = useToastStore((s) => s.show);
  const cardRef = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState<Panel>('text');
  const [currentSavedId, setCurrentSavedId] = useState(savedId);
  const { share, copy, busy } = useShareStory(cardRef, design);
  const nativeShare = canShareFiles();

  const save = () => {
    const saved = upsert(design, currentSavedId);
    setCurrentSavedId(saved.id);
    toast(t('saved'), 'success');
  };

  return (
    <main className="editor">
      <header className="editor__bar">
        <Button variant="ghost" size="sm" onClick={() => navigate({ name: 'gallery' })}>
          ← {t('back')}
        </Button>
        <div className="editor__bar-actions">
          <Button size="sm" onClick={copy}>
            {t('copyText')}
          </Button>
          <Button size="sm" onClick={save}>
            {t('save')}
          </Button>
        </div>
      </header>

      <div className="editor__layout">
        <section className="editor__preview">
          <StoryPreview design={design} hijriLabel={hijriLabel} cardRef={cardRef} className="editor__card" />
          <div className="editor__share">
            <Button variant="primary" size="lg" block onClick={share} disabled={busy}>
              {busy ? t('preparing') : nativeShare ? t('shareWhatsApp') : t('download')}
            </Button>
            <p className="editor__tip">{t('tipShare')}</p>
          </div>
        </section>

        <section className="editor__controls">
          <div className="tabs" role="tablist">
            <button
              role="tab"
              type="button"
              className="tab"
              aria-selected={panel === 'text'}
              onClick={() => setPanel('text')}
            >
              {t('text')}
            </button>
            <button
              role="tab"
              type="button"
              className="tab"
              aria-selected={panel === 'style'}
              onClick={() => setPanel('style')}
            >
              {t('style')}
            </button>
          </div>
          {panel === 'text' ? <TextPanel /> : <StylePanel />}
        </section>
      </div>
    </main>
  );
}
