import { useWindowDimensions } from 'react-native';

/**
 * Window width that is never zero. During static web rendering the window
 * has no size, and a negative card width would stick until the next render.
 */
export function useLayoutWidth(fallback = 390): number {
  const { width } = useWindowDimensions();
  return width > 0 ? width : fallback;
}
