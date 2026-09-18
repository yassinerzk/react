import type { BackgroundId } from '@barakah/core';

/* eslint-disable @typescript-eslint/no-require-imports */
// Metro needs static require() calls, so the photo registry in core is mirrored here.
export const BACKGROUND_IMAGES: Record<Exclude<BackgroundId, 'none'>, number> = {
  wildflowers: require('../../../packages/assets/backgrounds/wildflowers.webp'),
  'cherry-blossom': require('../../../packages/assets/backgrounds/cherry-blossom.webp'),
  'lavender-field': require('../../../packages/assets/backgrounds/lavender-field.webp'),
  'river-valley': require('../../../packages/assets/backgrounds/river-valley.webp'),
  'mountain-lake': require('../../../packages/assets/backgrounds/mountain-lake.webp'),
  'forest-light': require('../../../packages/assets/backgrounds/forest-light.webp'),
  'ocean-sunrise': require('../../../packages/assets/backgrounds/ocean-sunrise.webp'),
  'desert-dusk': require('../../../packages/assets/backgrounds/desert-dusk.webp'),
  'starry-night': require('../../../packages/assets/backgrounds/starry-night.webp'),
  'mosque-sunset': require('../../../packages/assets/backgrounds/mosque-sunset.webp'),
  'mosque-courtyard': require('../../../packages/assets/backgrounds/mosque-courtyard.webp'),
  'mosque-sea': require('../../../packages/assets/backgrounds/mosque-sea.webp'),
};

export const BACKGROUND_THUMBS: Record<Exclude<BackgroundId, 'none'>, number> = {
  wildflowers: require('../../../packages/assets/backgrounds/thumbs/wildflowers.webp'),
  'cherry-blossom': require('../../../packages/assets/backgrounds/thumbs/cherry-blossom.webp'),
  'lavender-field': require('../../../packages/assets/backgrounds/thumbs/lavender-field.webp'),
  'river-valley': require('../../../packages/assets/backgrounds/thumbs/river-valley.webp'),
  'mountain-lake': require('../../../packages/assets/backgrounds/thumbs/mountain-lake.webp'),
  'forest-light': require('../../../packages/assets/backgrounds/thumbs/forest-light.webp'),
  'ocean-sunrise': require('../../../packages/assets/backgrounds/thumbs/ocean-sunrise.webp'),
  'desert-dusk': require('../../../packages/assets/backgrounds/thumbs/desert-dusk.webp'),
  'starry-night': require('../../../packages/assets/backgrounds/thumbs/starry-night.webp'),
  'mosque-sunset': require('../../../packages/assets/backgrounds/thumbs/mosque-sunset.webp'),
  'mosque-courtyard': require('../../../packages/assets/backgrounds/thumbs/mosque-courtyard.webp'),
  'mosque-sea': require('../../../packages/assets/backgrounds/thumbs/mosque-sea.webp'),
};
