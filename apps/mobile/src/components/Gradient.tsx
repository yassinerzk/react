import { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { splitColorAlpha, type ThemeGradient } from '@barakah/core';

interface GradientFillProps {
  id: string;
  gradient: ThemeGradient;
  width: number;
  height: number;
}

/** Draws a core ThemeGradient as an SVG rect (must sit inside an <Svg>). */
export function GradientFill({ id, gradient, width, height }: GradientFillProps) {
  const stops = gradient.stops.map(([offset, raw], i) => {
    // The alpha has to move out of the colour and into stopOpacity, or a
    // translucent scrim is painted solid.
    const { color, opacity } = splitColorAlpha(raw);
    return <Stop key={i} offset={`${Math.round(offset * 100)}%`} stopColor={color} stopOpacity={opacity} />;
  });
  let defs;
  if (gradient.kind === 'linear') {
    const a = (gradient.angle * Math.PI) / 180;
    const vx = Math.sin(a);
    const vy = -Math.cos(a);
    defs = (
      <LinearGradient
        id={id}
        x1={`${50 - 50 * vx}%`}
        y1={`${50 - 50 * vy}%`}
        x2={`${50 + 50 * vx}%`}
        y2={`${50 + 50 * vy}%`}
      >
        {stops}
      </LinearGradient>
    );
  } else {
    defs = (
      <RadialGradient
        id={id}
        cx={`${gradient.cx}%`}
        cy={`${gradient.cy}%`}
        rx={`${gradient.rx}%`}
        ry={`${gradient.ry}%`}
        fx={`${gradient.cx}%`}
        fy={`${gradient.cy}%`}
      >
        {stops}
      </RadialGradient>
    );
  }
  return (
    <>
      <Defs>{defs}</Defs>
      <Rect x={0} y={0} width={width} height={height} fill={`url(#${id})`} />
    </>
  );
}
