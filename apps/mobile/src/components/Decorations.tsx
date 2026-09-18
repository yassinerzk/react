import {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Mask,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import type { DecorationId, Localized } from '@barakah/core';

export interface DecorationProps {
  color: string;
  uid: string;
}

/** All decorations draw inside an <Svg viewBox="0 0 1080 1920">. */
function Crescent({ color, uid }: DecorationProps) {
  const mid = `cres-${uid}`;
  return (
    <>
      <Defs>
        <Mask id={mid}>
          <Circle cx={760} cy={330} r={170} fill="#fff" />
          <Circle cx={830} cy={290} r={150} fill="#000" />
        </Mask>
        <RadialGradient id={`${mid}-g`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={0.35} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={760} cy={330} r={330} fill={`url(#${mid}-g)`} />
      <Circle cx={760} cy={330} r={170} fill={color} mask={`url(#${mid})`} />
      <G fill={color}>
        <Circle cx={330} cy={260} r={7} />
        <Circle cx={420} cy={420} r={4} />
        <Circle cx={900} cy={560} r={5} />
        <Circle cx={240} cy={520} r={3} />
        <Path d="M560 180 l6 18 18 6 -18 6 -6 18 -6 -18 -18 -6 18 -6z" opacity={0.9} />
        <Path d="M980 140 l4 12 12 4 -12 4 -4 12 -4 -12 -12 -4 12 -4z" opacity={0.8} />
      </G>
    </>
  );
}

function Stars({ color }: DecorationProps) {
  const pts: Array<[number, number, number, number]> = [
    [120, 220, 5, 0.9],
    [300, 140, 3, 0.7],
    [520, 260, 4, 0.8],
    [760, 160, 6, 0.9],
    [960, 300, 3, 0.6],
    [200, 420, 2.5, 0.6],
    [860, 480, 4, 0.7],
    [90, 700, 3, 0.5],
    [1000, 760, 2.5, 0.5],
    [140, 1500, 3, 0.5],
    [940, 1560, 4, 0.6],
    [520, 1700, 3, 0.5],
    [300, 1780, 5, 0.7],
    [820, 1800, 3, 0.6],
  ];
  const sparkle = (x: number, y: number, s: number) =>
    `M${x} ${y - s * 3} l${s * 0.8} ${s * 2.2} ${s * 2.2} ${s * 0.8} -${s * 2.2} ${s * 0.8} -${s * 0.8} ${s * 2.2} -${s * 0.8} -${s * 2.2} -${s * 2.2} -${s * 0.8} ${s * 2.2} -${s * 0.8}z`;
  return (
    <G fill={color}>
      {pts.map(([x, y, r, o], i) =>
        i % 3 === 0 ? (
          <Path key={i} d={sparkle(x, y, r)} opacity={o} />
        ) : (
          <Circle key={i} cx={x} cy={y} r={r} opacity={o} />
        ),
      )}
    </G>
  );
}

function Lantern({ x, drop, color, scale = 1 }: { x: number; drop: number; color: string; scale?: number }) {
  return (
    <G transform={`translate(${x} 0)`}>
      <Line x1={0} y1={0} x2={0} y2={drop} stroke={color} strokeWidth={3} />
      <G transform={`translate(0 ${drop}) scale(${scale})`} fill={color}>
        <Rect x={-22} y={0} width={44} height={18} rx={4} />
        <Path d="M-48 22 h96 l-14 120 h-68z" opacity={0.95} />
        <Path d="M-22 22 h44 l-8 120 h-28z" fill="#000" opacity={0.18} />
        <Rect x={-36} y={142} width={72} height={14} rx={3} />
        <Path d="M0 158 l16 34 -16 34 -16 -34z" />
      </G>
    </G>
  );
}

function Lanterns({ color, uid }: DecorationProps) {
  const g = `lg-${uid}`;
  return (
    <>
      <Defs>
        <RadialGradient id={g} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={0.28} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={200} cy={300} r={230} fill={`url(#${g})`} />
      <Circle cx={540} cy={200} r={200} fill={`url(#${g})`} />
      <Circle cx={880} cy={360} r={230} fill={`url(#${g})`} />
      <Lantern x={200} drop={190} color={color} />
      <Lantern x={540} drop={90} color={color} scale={0.85} />
      <Lantern x={880} drop={250} color={color} />
    </>
  );
}

function Mosque({ color, uid }: DecorationProps) {
  const g = `mq-${uid}`;
  return (
    <>
      <Defs>
        <LinearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0} />
          <Stop offset="1" stopColor={color} stopOpacity={0.28} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={1450} width={1080} height={470} fill={`url(#${g})`} />
      <G fill={color} opacity={0.55}>
        <Rect x={150} y={1560} width={46} height={360} />
        <Path d="M150 1560 h46 l-23 -70z" />
        <Rect x={136} y={1600} width={74} height={16} />
        <Rect x={884} y={1560} width={46} height={360} />
        <Path d="M884 1560 h46 l-23 -70z" />
        <Rect x={870} y={1600} width={74} height={16} />
        <Rect x={240} y={1740} width={600} height={180} />
        <Path d="M340 1740 C 340 1560, 740 1560, 740 1740z" />
        <Rect x={532} y={1520} width={16} height={50} />
        <Circle cx={540} cy={1512} r={12} />
        <Path d="M230 1770 C 230 1690, 370 1690, 370 1770z" />
        <Path d="M710 1770 C 710 1690, 850 1690, 850 1770z" />
        <Path d="M500 1920 v-90 C 500 1790, 580 1790, 580 1830 v90z" fill="#000" opacity={0.3} />
      </G>
    </>
  );
}

function Kaaba({ color, uid }: DecorationProps) {
  const g = `kb-${uid}`;
  return (
    <>
      <Defs>
        <RadialGradient id={g} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={0.3} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={540} cy={1780} rx={420} ry={200} fill={`url(#${g})`} />
      <G transform="translate(540 1780)">
        <Path d="M-150 -110 h230 v250 h-230z" fill="#0d0d0d" />
        <Path d="M80 -110 l80 -40 v250 l-80 40z" fill="#1c1c1c" />
        <Path d="M-150 -110 l80 -40 h230 l-80 40z" fill="#262626" />
        <Rect x={-150} y={-50} width={230} height={34} fill={color} opacity={0.95} />
        <Path d="M80 -50 l80 -40 v34 l-80 40z" fill={color} opacity={0.75} />
        <Rect x={10} y={20} width={44} height={90} rx={4} fill={color} opacity={0.9} />
        <Rect x={-150} y={138} width={230} height={4} fill={color} opacity={0.6} />
      </G>
    </>
  );
}

function Arch({ color }: DecorationProps) {
  const outer = 'M150 1560 V 640 C 150 430, 320 300, 540 250 C 760 300, 930 430, 930 640 V 1560';
  const inner = 'M180 1560 V 650 C 180 460, 340 340, 540 290 C 740 340, 900 460, 900 650 V 1560';
  return (
    <>
      <G fill="none" stroke={color} strokeLinecap="round">
        <Path d={outer} strokeWidth={4} opacity={0.9} />
        <Path d={inner} strokeWidth={1.5} opacity={0.7} />
        <Path d="M150 1560 H 930 M180 1600 H 900" strokeWidth={3} opacity={0.8} />
      </G>
      <G fill={color}>
        <Path d="M540 190 l8 24 24 8 -24 8 -8 24 -8 -24 -24 -8 24 -8z" />
        <Circle cx={150} cy={1560} r={8} />
        <Circle cx={930} cy={1560} r={8} />
      </G>
    </>
  );
}

function Lights({ color, uid }: DecorationProps) {
  const g = `lt-${uid}`;
  const bulbs = [90, 230, 370, 510, 650, 790, 930, 1030];
  const y = (x: number) => 150 + 60 * Math.sin((x / 1080) * Math.PI);
  return (
    <>
      <Defs>
        <RadialGradient id={g} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={0.55} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Path d="M-20 140 Q 540 260 1100 140" fill="none" stroke={color} strokeWidth={3} opacity={0.8} />
      <Path d="M-20 60 Q 540 150 1100 60" fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
      {bulbs.map((x, i) => (
        <G key={x}>
          <Line x1={x} y1={y(x)} x2={x} y2={y(x) + 40} stroke={color} strokeWidth={2.5} opacity={0.8} />
          <Circle cx={x} cy={y(x) + 60} r={60} fill={`url(#${g})`} />
          {i % 2 === 0 ? (
            <Circle cx={x} cy={y(x) + 56} r={16} fill={color} />
          ) : (
            <Path
              d={`M${x} ${y(x) + 38} l10 30 30 10 -30 10 -10 30 -10 -30 -30 -10 30 -10z`}
              fill={color}
              opacity={0.95}
            />
          )}
        </G>
      ))}
    </>
  );
}

function Sunrise({ color, uid }: DecorationProps) {
  const g = `sr-${uid}`;
  const rays = Array.from({ length: 13 }, (_, i) => -90 + i * 15);
  return (
    <>
      <Defs>
        <RadialGradient id={g} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={0.55} />
          <Stop offset="0.5" stopColor={color} stopOpacity={0.15} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={540} cy={360} r={420} fill={`url(#${g})`} />
      <G stroke={color} strokeWidth={3} strokeLinecap="round" opacity={0.45}>
        {rays.map((a) => {
          const rad = ((a - 90) * Math.PI) / 180;
          return (
            <Line
              key={a}
              x1={540 + 190 * Math.cos(rad)}
              y1={360 + 190 * Math.sin(rad)}
              x2={540 + 330 * Math.cos(rad)}
              y2={360 + 330 * Math.sin(rad)}
            />
          );
        })}
      </G>
      <Circle cx={540} cy={360} r={130} fill={color} opacity={0.9} />
      <G fill={color} opacity={0.4}>
        <Path d="M0 1700 Q 270 1640 540 1700 T 1080 1700 V 1920 H 0z" />
        <Path d="M0 1780 Q 270 1730 540 1780 T 1080 1780 V 1920 H 0z" opacity={0.7} />
      </G>
    </>
  );
}

export interface DecorationDef {
  id: DecorationId;
  name: Localized;
  Component: (props: DecorationProps) => React.ReactNode;
}

export const DECORATIONS: readonly DecorationDef[] = [
  { id: 'none', name: { en: 'None', ar: 'بدون' }, Component: () => null },
  { id: 'crescent', name: { en: 'Crescent', ar: 'هلال' }, Component: Crescent },
  { id: 'stars', name: { en: 'Stars', ar: 'نجوم' }, Component: Stars },
  { id: 'lanterns', name: { en: 'Lanterns', ar: 'فوانيس' }, Component: Lanterns },
  { id: 'lights', name: { en: 'Festive lights', ar: 'زينة' }, Component: Lights },
  { id: 'mosque', name: { en: 'Mosque', ar: 'مسجد' }, Component: Mosque },
  { id: 'kaaba', name: { en: 'Kaaba', ar: 'الكعبة' }, Component: Kaaba },
  { id: 'arch', name: { en: 'Arch', ar: 'قوس' }, Component: Arch },
  { id: 'sunrise', name: { en: 'Sunrise', ar: 'شروق' }, Component: Sunrise },
];

export const DECORATION_MAP = Object.fromEntries(DECORATIONS.map((d) => [d.id, d])) as Record<
  DecorationId,
  DecorationDef
>;
