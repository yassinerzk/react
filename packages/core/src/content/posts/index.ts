import type { CategoryId, Post } from '../../types';
import { fridayPosts } from './friday';
import { morningPosts } from './morning';
import { eveningPosts } from './evening';
import { ramadanPosts } from './ramadan';
import { laylatAlQadrPosts } from './laylatAlQadr';
import { eidAlFitrPosts } from './eidAlFitr';
import { dhulHijjahPosts } from './dhulHijjah';
import { eidAlAdhaPosts } from './eidAlAdha';
import { muharramPosts } from './muharram';
import { israMirajPosts } from './israMiraj';
import { quranPosts } from './quran';
import { hadithPosts } from './hadith';
import { duaPosts } from './dua';
import { occasionsPosts } from './occasions';
import { morePosts } from './more';

/**
 * Post registry. Each category lives in its own file so content can grow
 * without touching code. Register new files here.
 */
export const POSTS: readonly Post[] = [
  ...fridayPosts,
  ...morningPosts,
  ...eveningPosts,
  ...ramadanPosts,
  ...laylatAlQadrPosts,
  ...eidAlFitrPosts,
  ...dhulHijjahPosts,
  ...eidAlAdhaPosts,
  ...muharramPosts,
  ...israMirajPosts,
  ...quranPosts,
  ...hadithPosts,
  ...duaPosts,
  ...occasionsPosts,
  ...morePosts,
];

const POST_MAP = new Map(POSTS.map((p) => [p.id, p]));

export function getPost(id: string): Post | undefined {
  return POST_MAP.get(id);
}

export function getPostsByCategory(category: CategoryId): Post[] {
  return POSTS.filter((p) => p.category === category);
}
