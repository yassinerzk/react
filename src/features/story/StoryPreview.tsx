import type { Ref } from 'react';
import type { StoryDesign } from '@/domain/types';
import { STORY_HEIGHT, STORY_WIDTH } from '@/shared/lib/exportImage';
import { useElementWidth } from '@/shared/hooks/useElementWidth';
import { StoryCard } from './StoryCard';

interface StoryPreviewProps {
  design: StoryDesign;
  hijriLabel?: string;
  cardRef?: Ref<HTMLDivElement>;
  className?: string;
}

/** Scales a full-size StoryCard down to fit its container's width. */
export function StoryPreview({ design, hijriLabel, cardRef, className }: StoryPreviewProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const scale = width > 0 ? width / STORY_WIDTH : 0;
  return (
    <div
      ref={ref}
      className={className}
      style={{ aspectRatio: `${STORY_WIDTH} / ${STORY_HEIGHT}`, position: 'relative', overflow: 'hidden' }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          direction: 'ltr',
          width: STORY_WIDTH,
          height: STORY_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          visibility: scale ? 'visible' : 'hidden',
        }}
      >
        <StoryCard ref={cardRef} design={design} hijriLabel={hijriLabel} />
      </div>
    </div>
  );
}
