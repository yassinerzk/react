import { useEffect } from 'react';
import { Animated, Easing, StyleSheet, useAnimatedValue, useWindowDimensions, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { ui } from '../theme';
import {
  BRAND_VIEWBOX,
  markFull,
  MARK_CONTENT_RATIO,
  MARK_END_SCALE,
  wordmarkFull,
  WORDMARK_MARK_CENTRE,
} from './artwork';

/**
 * The animated opening: the crescent spins, shrinks, and settles into the slot
 * it occupies inside the wordmark, which fades up around it.
 *
 * It is drawn in SVG rather than played as a video. A video would need a fixed
 * resolution, a background that never quite matches, and a decoder on the
 * critical path of a cold start; vectors stay sharp at every density, weigh
 * almost nothing, and need no new dependency.
 *
 * The handoff from the native splash is what makes it feel like one thing: the
 * native splash (`assets/splash-icon.png`) is the same mark on the same ground,
 * and `START_SCALE` below is computed so the first animated frame is exactly the
 * size the native splash left it at — no jump, no fade-in.
 */

/** Native splash art is the mark at half the width of a square, `contain`-fitted. */
const NATIVE_SPLASH_FRACTION = 0.5;

const SPIN_MS = 1400;
const HOLD_MS = 350;
const FADE_MS = 280;
/** The mark reaches its resting place at this point through the spin. */
const SETTLE_AT = 0.55;

interface AnimatedSplashProps {
  /** Called once the overlay has finished fading out. */
  onDone: () => void;
}

export function AnimatedSplash({ onDone }: AnimatedSplashProps) {
  const { width, height } = useWindowDimensions();
  const travel = useAnimatedValue(0);
  const spin = useAnimatedValue(0);
  const fade = useAnimatedValue(0);

  // A square stage: both files share one viewBox, so drawing them at the same
  // size in the same place makes their coordinates line up exactly.
  const stage = Math.min(width * 0.86, 420);
  const unit = stage / BRAND_VIEWBOX;

  // Where the crescent has to end up, relative to the centre of the stage.
  const endX = (WORDMARK_MARK_CENTRE.x - BRAND_VIEWBOX / 2) * unit;
  const endY = (WORDMARK_MARK_CENTRE.y - BRAND_VIEWBOX / 2) * unit;

  // Match the size the native splash was already showing, so the swap is invisible.
  const nativeMarkWidth = Math.min(width, height) * NATIVE_SPLASH_FRACTION;
  const startScale = nativeMarkWidth / (MARK_CONTENT_RATIO * stage);
  // A hair larger than the measured crescent, so the gold fully covers the
  // wordmark's own crescent underneath rather than leaving a pale edge.
  const endScale = MARK_END_SCALE * 1.015;

  useEffect(() => {
    const run = Animated.sequence([
      Animated.parallel([
        Animated.timing(spin, {
          toValue: 1,
          duration: SPIN_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(travel, {
          toValue: 1,
          duration: SPIN_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(HOLD_MS),
      Animated.timing(fade, {
        toValue: 1,
        duration: FADE_MS,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    run.start(({ finished }) => {
      if (finished) onDone();
    });
    return () => run.stop();
  }, [spin, travel, fade, onDone]);

  const markStyle = {
    position: 'absolute' as const,
    width: stage,
    height: stage,
    transform: [
      {
        translateX: travel.interpolate({
          inputRange: [0, SETTLE_AT, 1],
          outputRange: [0, 0, endX],
        }),
      },
      {
        translateY: travel.interpolate({
          inputRange: [0, SETTLE_AT, 1],
          outputRange: [0, 0, endY],
        }),
      },
      { rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
      {
        scale: travel.interpolate({
          inputRange: [0, SETTLE_AT, 1],
          outputRange: [startScale, startScale, endScale],
        }),
      },
    ],
  };

  return (
    <Animated.View
      // Ignore touches entirely; the app underneath is already mounted.
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: ui.bg,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: fade.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
        },
      ]}
    >
      <View style={{ width: stage, height: stage, alignItems: 'center', justifyContent: 'center' }}>
        {/* Behind: the full wordmark, including its own crescent. */}
        <Animated.View
          style={{
            position: 'absolute',
            width: stage,
            height: stage,
            opacity: travel.interpolate({
              inputRange: [0, SETTLE_AT, 0.85, 1],
              outputRange: [0, 0, 1, 1],
            }),
          }}
        >
          <SvgXml xml={wordmarkFull(ui.text)} width="100%" height="100%" />
        </Animated.View>

        {/* In front: the mark that travels into the wordmark's crescent. */}
        <Animated.View style={markStyle}>
          <SvgXml xml={markFull(ui.accent)} width="100%" height="100%" />
        </Animated.View>
      </View>
    </Animated.View>
  );
}
