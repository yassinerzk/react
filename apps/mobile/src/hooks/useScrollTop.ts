import { useCallback, useRef, useState } from 'react';
import type { FlatList, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

/** How far down the list has to be before the button is worth offering. */
export const SCROLL_TOP_THRESHOLD = 700;

/**
 * Tracks how far a list has been scrolled and hands back the pieces needed to
 * jump to the top again.
 *
 * `onScroll` fires many times a second, so it only ever calls `setVisible` with
 * a value that differs from the current one — returning the same state bails
 * out of the render, which matters on a list of 150-odd rows.
 */
export function useScrollTop<T>(threshold = SCROLL_TOP_THRESHOLD) {
  const ref = useRef<FlatList<T>>(null);
  const [visible, setVisible] = useState(false);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const past = event.nativeEvent.contentOffset.y > threshold;
      setVisible((current) => (current === past ? current : past));
    },
    [threshold],
  );

  const scrollToTop = useCallback(() => {
    ref.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  return { ref, visible, onScroll, scrollToTop };
}
