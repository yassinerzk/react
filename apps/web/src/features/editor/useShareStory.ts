import { useCallback, useState, type RefObject } from 'react';
import { designToText, type StoryDesign } from '@barakah/core';
import { renderStoryToPng } from '@/shared/lib/exportImage';
import { copyText, sharePng } from '@/shared/lib/share';
import { useToastStore } from '@/app/store';
import { useT } from '@/shared/hooks/useT';

/** Export + share orchestration for the editor. */
export function useShareStory(cardRef: RefObject<HTMLDivElement | null>, design: StoryDesign) {
  const { t } = useT();
  const toast = useToastStore((s) => s.show);
  const [busy, setBusy] = useState(false);

  const fileName = () => `barakah-${design.postId ?? 'story'}-${Date.now().toString(36)}.png`;

  const share = useCallback(async () => {
    const node = cardRef.current;
    if (!node || busy) return;
    setBusy(true);
    try {
      const blob = await renderStoryToPng(node);
      const outcome = await sharePng(blob, { fileName: fileName(), title: design.headline || 'Story' });
      if (outcome === 'downloaded') toast(t('downloaded'), 'success');
      if (outcome === 'shared') toast(t('sharedOk'), 'success');
    } catch {
      toast(t('shareFailed'), 'error');
    } finally {
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardRef, busy, design.headline, design.postId, t, toast]);

  const copy = useCallback(async () => {
    const ok = await copyText(designToText(design));
    toast(ok ? t('copied') : t('shareFailed'), ok ? 'success' : 'error');
  }, [design, t, toast]);

  return { share, copy, busy };
}
