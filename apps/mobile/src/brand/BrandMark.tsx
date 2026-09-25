import { SvgXml } from 'react-native-svg';
import { MARK_ASPECT, markTight, WORDMARK_ASPECT, wordmarkTight } from './artwork';

interface BrandMarkProps {
  /** Height in points; width follows the artwork's own proportions. */
  size: number;
  color: string;
}

/** The crescent on its own, cropped to the artwork so it needs no padding around it. */
export function BrandMark({ size, color }: BrandMarkProps) {
  return <SvgXml xml={markTight(color)} width={size * MARK_ASPECT} height={size} />;
}

interface BrandWordmarkProps {
  /** Width in points; height follows the artwork's own proportions. */
  width: number;
  color: string;
  opacity?: number;
}

/** The full "baraka stories" lockup, crescent included. */
export function BrandWordmark({ width, color, opacity }: BrandWordmarkProps) {
  return (
    <SvgXml xml={wordmarkTight(color)} width={width} height={width / WORDMARK_ASPECT} opacity={opacity} />
  );
}
