import { forwardRef, useId } from 'react';
import type { StoryDesign } from '@/domain/types';
import { getTheme } from '@/domain/themes';
import { getDecoration } from '@/domain/decorations';
import { getBackground, PHOTO_PALETTE } from '@/domain/backgrounds';
import { Pattern } from '@/domain/patterns/Pattern';
import { computeTypography } from '@/domain/design';
import { STORY_HEIGHT, STORY_WIDTH } from '@/shared/lib/exportImage';
import { useT } from '@/shared/hooks/useT';
import { KIND_KEY } from '@/shared/i18n';

interface StoryCardProps {
  design: StoryDesign;
  /** Pre-formatted Hijri date label, shown in the footer when enabled. */
  hijriLabel?: string;
}

/**
 * The story itself, laid out at the native WhatsApp status size (1080x1920).
 * It is rendered once for the preview (scaled with CSS) and rasterised as-is
 * for export, so what you see is exactly what gets shared.
 */
export const StoryCard = forwardRef<HTMLDivElement, StoryCardProps>(function StoryCard(
  { design, hijriLabel },
  ref,
) {
  const uid = useId().replace(/:/g, '');
  const { t } = useT();
  const theme = getTheme(design.theme);
  const background = getBackground(design.background);
  const palette = background
    ? { ...PHOTO_PALETTE }
    : { text: theme.text, muted: theme.muted, accent: theme.accent, decor: theme.decor };
  const { Component: Decoration } = getDecoration(design.decoration);
  const typo = computeTypography(design);
  const dark = theme.mode === 'dark' || !!background;
  const shadow = dark ? '0 4px 24px rgba(0,0,0,0.35)' : 'none';
  const showKicker = design.kind === 'quran' || design.kind === 'hadith';
  const arabic = design.arabic.trim() || t('emptyArabic');
  const footerParts = [design.footer.trim(), design.showHijriDate ? hijriLabel : ''].filter(Boolean);

  return (
    <div
      ref={ref}
      className="story-card"
      dir="rtl"
      style={{
        width: STORY_WIDTH,
        height: STORY_HEIGHT,
        background: theme.background,
        color: palette.text,
      }}
    >
      {background ? (
        <>
          <img className="story-layer story-photo" src={background.src} alt="" decoding="async" />
          <div className="story-layer" style={{ background: background.scrim }} />
        </>
      ) : (
        <Pattern id={theme.pattern} color={theme.patternColor} opacity={theme.patternOpacity} uid={uid} />
      )}
      <Decoration color={palette.decor} uid={uid} />
      {design.showFrame && (
        <svg className="story-layer" viewBox="0 0 1080 1920" aria-hidden>
          <rect x="52" y="52" width="976" height="1816" fill="none" stroke={palette.accent} strokeWidth="3" />
          <rect
            x="70"
            y="70"
            width="940"
            height="1780"
            fill="none"
            stroke={palette.accent}
            strokeWidth="1.5"
            opacity="0.7"
          />
          {[
            [52, 52],
            [1028, 52],
            [52, 1868],
            [1028, 1868],
          ].map(([x, y]) => (
            <path
              key={`${x}-${y}`}
              d={`M${x} ${y - 26} l7 19 19 7 -19 7 -7 19 -7 -19 -19 -7 19 -7z`}
              fill={palette.accent}
            />
          ))}
        </svg>
      )}

      <div
        className="story-content"
        style={{
          alignItems: design.align === 'center' ? 'center' : 'flex-start',
          textAlign: design.align === 'center' ? 'center' : 'right',
        }}
      >
        {showKicker && (
          <div className="story-kicker" style={{ color: palette.accent, fontFamily: typo.arabicFamily }}>
            ✦ {t(KIND_KEY[design.kind])} ✦
          </div>
        )}
        {design.headline.trim() && (
          <div
            className="story-headline"
            style={{
              color: palette.accent,
              fontFamily: typo.arabicFamily,
              fontSize: typo.headlineSize,
              textShadow: shadow,
            }}
          >
            {design.headline}
          </div>
        )}
        <div
          className="story-arabic"
          style={{
            fontFamily: typo.arabicFamily,
            fontWeight: typo.arabicWeight,
            fontSize: typo.arabicSize,
            lineHeight: typo.arabicLineHeight,
            textShadow: shadow,
          }}
        >
          {arabic}
        </div>
        {design.showTranslation && design.translation.trim() && (
          <>
            <div className="story-divider" style={{ color: palette.accent }} aria-hidden>
              <span />
              <span>✦</span>
              <span />
            </div>
            <div
              className="story-translation"
              dir="ltr"
              style={{
                color: palette.muted,
                fontFamily: typo.translationFamily,
                fontStyle: typo.translationItalic ? 'italic' : 'normal',
                fontSize: typo.translationSize,
                textAlign: design.align === 'center' ? 'center' : 'left',
                alignSelf: design.align === 'center' ? 'center' : 'stretch',
                textShadow: shadow,
              }}
            >
              {design.translation}
            </div>
          </>
        )}
        {design.showSource && design.source.trim() && (
          <div
            className="story-source"
            style={{ color: palette.accent, borderColor: palette.accent, fontSize: typo.sourceSize }}
          >
            {design.source}
          </div>
        )}
      </div>

      {footerParts.length > 0 && (
        <div className="story-footer" style={{ color: palette.muted, textShadow: shadow }}>
          {footerParts.map((part, i) => (
            <span key={i} dir="auto">
              {part}
            </span>
          ))}
        </div>
      )}
    </div>
  );
});
