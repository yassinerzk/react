import type { BackgroundId } from '@barakah/core';

// Vite turns these into hashed, cache-friendly URLs at build time.
const full = import.meta.glob('../../../../../packages/assets/backgrounds/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const thumbs = import.meta.glob('../../../../../packages/assets/backgrounds/thumbs/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const byId = (map: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(map).map(([path, url]) => [path.split('/').pop()!.replace('.webp', ''), url]),
  );

const FULL = byId(full);
const THUMB = byId(thumbs);

export function backgroundSrc(id: BackgroundId): string | undefined {
  return FULL[id];
}
export function backgroundThumb(id: BackgroundId): string | undefined {
  return THUMB[id];
}
