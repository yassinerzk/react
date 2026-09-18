import { forwardRef, useId } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path, Rect } from 'react-native-svg';
import { Image } from 'expo-image';
import {
  computeTypography,
  getBackground,
  getTheme,
  KIND_KEY,
  PHOTO_PALETTE,
  SCRIMS,
  themeBaseColor,
  type StoryDesign,
} from '@barakah/core';
import { useT } from '../i18n';
import { arabicFace, LATIN_FACES } from '../fonts';
import { BACKGROUND_IMAGES } from '../backgrounds';
import { GradientFill } from './Gradient';
import { PatternLayer } from './Pattern';
import { DECORATION_MAP } from './Decorations';

export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;

interface StoryCardProps {
  design: StoryDesign;
  /** Rendered width in logical pixels; everything scales from 1080. */
  width: number;
  hijriLabel?: string;
}

/**
 * The story card at any size. All dimensions are expressed in the 1080x1920
 * design space and multiplied by `u`, so the preview and the exported PNG
 * (captured at 1080x1920) are pixel-for-pixel the same layout.
 */
export const StoryCard = forwardRef<View, StoryCardProps>(function StoryCard(
  { design, width, hijriLabel },
  ref,
) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const { t } = useT();
  const u = width / STORY_WIDTH;
  const height = width * (STORY_HEIGHT / STORY_WIDTH);
  const theme = getTheme(design.theme);
  const background = getBackground(design.background);
  const palette = background
    ? { ...PHOTO_PALETTE }
    : { text: theme.text, muted: theme.muted, accent: theme.accent, decor: theme.decor };
  const { Component: Decoration } = DECORATION_MAP[design.decoration];
  const typo = computeTypography(design);
  const dark = theme.mode === 'dark' || !!background;
  const shadow = dark
    ? {
        textShadowColor: 'rgba(0,0,0,0.35)',
        textShadowOffset: { width: 0, height: 4 * u },
        textShadowRadius: 12 * u,
      }
    : {};
  const showKicker = design.kind === 'quran' || design.kind === 'hadith';
  const arabic = design.arabic.trim() || t('emptyArabic');
  const centered = design.align === 'center';
  const footerParts = [design.footer.trim(), design.showHijriDate ? (hijriLabel ?? '') : ''].filter(Boolean);
  const latin = LATIN_FACES[design.latinFont];

  return (
    <View
      ref={ref}
      collapsable={false}
      style={{ width, height, overflow: 'hidden', backgroundColor: themeBaseColor(theme) }}
    >
      {/* background */}
      {background ? (
        <>
          <Image
            source={BACKGROUND_IMAGES[background.id]}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <Svg
            style={StyleSheet.absoluteFill}
            viewBox={`0 0 ${STORY_WIDTH} ${STORY_HEIGHT}`}
            preserveAspectRatio="none"
          >
            <GradientFill
              id={`scrim-${uid}`}
              gradient={SCRIMS[background.scrim]}
              width={STORY_WIDTH}
              height={STORY_HEIGHT}
            />
          </Svg>
        </>
      ) : (
        <Svg
          style={StyleSheet.absoluteFill}
          viewBox={`0 0 ${STORY_WIDTH} ${STORY_HEIGHT}`}
          preserveAspectRatio="none"
        >
          <GradientFill
            id={`bg-${uid}`}
            gradient={theme.gradient}
            width={STORY_WIDTH}
            height={STORY_HEIGHT}
          />
          <PatternLayer
            id={theme.pattern}
            color={theme.patternColor}
            opacity={theme.patternOpacity}
            uid={uid}
          />
        </Svg>
      )}

      {/* decoration + frame */}
      <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${STORY_WIDTH} ${STORY_HEIGHT}`}>
        <Decoration color={palette.decor} uid={uid} />
        {design.showFrame && (
          <G>
            <Rect
              x={52}
              y={52}
              width={976}
              height={1816}
              fill="none"
              stroke={palette.accent}
              strokeWidth={3}
            />
            <Rect
              x={70}
              y={70}
              width={940}
              height={1780}
              fill="none"
              stroke={palette.accent}
              strokeWidth={1.5}
              opacity={0.7}
            />
            {[
              [52, 52],
              [1028, 52],
              [52, 1868],
              [1028, 1868],
            ].map(([x, y]) => (
              <Path
                key={`${x}-${y}`}
                d={`M${x} ${y - 26} l7 19 19 7 -19 7 -7 19 -7 -19 -19 -7 19 -7z`}
                fill={palette.accent}
              />
            ))}
          </G>
        )}
      </Svg>

      {/* content */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          paddingTop: 380 * u,
          paddingBottom: 480 * u,
          paddingHorizontal: 110 * u,
          justifyContent: 'center',
          alignItems: centered ? 'center' : 'flex-end',
          gap: 36 * u,
        }}
      >
        {showKicker && (
          <Text
            style={{
              color: palette.accent,
              fontFamily: arabicFace(design.arabicFont, 400),
              fontSize: 34 * u,
              letterSpacing: 2 * u,
              textAlign: centered ? 'center' : 'right',
            }}
          >
            ✦ {t(KIND_KEY[design.kind])} ✦
          </Text>
        )}
        {design.headline.trim() !== '' && (
          <Text
            style={[
              {
                color: palette.accent,
                fontFamily: arabicFace(design.arabicFont, 400),
                fontSize: typo.headlineSize * u,
                lineHeight: typo.headlineSize * 1.6 * u,
                textAlign: centered ? 'center' : 'right',
                writingDirection: 'rtl',
              },
              shadow,
            ]}
          >
            {design.headline}
          </Text>
        )}
        <Text
          style={[
            {
              color: palette.text,
              fontFamily: arabicFace(design.arabicFont, typo.arabicWeight),
              fontSize: typo.arabicSize * u,
              lineHeight: typo.arabicSize * typo.arabicLineHeight * u,
              textAlign: centered ? 'center' : 'right',
              writingDirection: 'rtl',
              width: '100%',
            },
            shadow,
          ]}
        >
          {arabic}
        </Text>
        {design.showTranslation && design.translation.trim() !== '' && (
          <>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 18 * u,
                width: 360 * u,
                alignSelf: centered ? 'center' : 'flex-end',
              }}
            >
              <View style={{ flex: 1, height: 2 * u, backgroundColor: palette.accent, opacity: 0.6 }} />
              <Text style={{ color: palette.accent, fontSize: 28 * u }}>✦</Text>
              <View style={{ flex: 1, height: 2 * u, backgroundColor: palette.accent, opacity: 0.6 }} />
            </View>
            <Text
              style={[
                {
                  color: palette.muted,
                  fontFamily: typo.translationItalic ? latin.italic : latin.regular,
                  fontSize: typo.translationSize * u,
                  lineHeight: typo.translationSize * 1.55 * u,
                  textAlign: centered ? 'center' : 'left',
                  maxWidth: 860 * u,
                  writingDirection: 'ltr',
                },
                shadow,
              ]}
            >
              {design.translation}
            </Text>
          </>
        )}
        {design.showSource && design.source.trim() !== '' && (
          <View
            style={{
              borderWidth: 1.5 * u,
              borderColor: palette.accent,
              borderRadius: 999,
              paddingVertical: 10 * u,
              paddingHorizontal: 28 * u,
            }}
          >
            <Text
              style={{ color: palette.accent, fontFamily: 'Cairo_400Regular', fontSize: typo.sourceSize * u }}
            >
              {design.source}
            </Text>
          </View>
        )}
      </View>

      {footerParts.length > 0 && (
        <View
          style={{
            position: 'absolute',
            left: 100 * u,
            right: 100 * u,
            bottom: 420 * u,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 28 * u,
          }}
        >
          {footerParts.map((part, i) => (
            <Text
              key={i}
              style={[{ color: palette.muted, fontFamily: 'Cairo_400Regular', fontSize: 30 * u }, shadow]}
            >
              {i > 0 ? '·  ' : ''}
              {part}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
});
