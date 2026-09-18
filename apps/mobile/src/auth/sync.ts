import type { QuranProgress, SavedDesign, StoryDesign } from '@barakah/core';
import { supabase } from './supabase';
import { useLibraryStore, useQuranStore } from '../store';

interface SavedDesignRow {
  id: string;
  user_id: string;
  design: StoryDesign;
  created_at: number;
  updated_at: number;
}

interface QuranProgressRow {
  user_id: string;
  last_surah: number | null;
  last_ayah: number | null;
  finished: number[];
  updated_at: number;
}

/**
 * Two-way sync of saved posts and Quran progress for the signed-in user.
 * Newer `updated_at` wins on both sides; nothing is deleted remotely.
 */
export async function syncAll(userId: string): Promise<void> {
  if (!supabase) return;

  // ---- saved designs ----
  const local = useLibraryStore.getState().items;
  const { data: remoteRows, error } = await supabase.from('saved_designs').select('*').eq('user_id', userId);
  if (error) throw error;
  const remote = new Map((remoteRows as SavedDesignRow[]).map((r) => [r.id, r]));
  const merged = new Map<string, SavedDesign>();
  for (const r of remote.values())
    merged.set(r.id, { id: r.id, design: r.design, createdAt: r.created_at, updatedAt: r.updated_at });
  const toPush: SavedDesignRow[] = [];
  for (const item of local) {
    const r = remote.get(item.id);
    if (!r || r.updated_at < item.updatedAt) {
      merged.set(item.id, item);
      toPush.push({
        id: item.id,
        user_id: userId,
        design: item.design,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
      });
    }
  }
  if (toPush.length > 0) {
    const { error: upErr } = await supabase.from('saved_designs').upsert(toPush);
    if (upErr) throw upErr;
  }
  useLibraryStore.setState({ items: [...merged.values()].sort((a, b) => b.updatedAt - a.updatedAt) });

  // ---- quran progress ----
  const q = useQuranStore.getState();
  const { data: qRows, error: qErr } = await supabase
    .from('quran_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (qErr) throw qErr;
  const row = qRows as QuranProgressRow | null;
  if (row && row.updated_at > q.updatedAt) {
    const progress: QuranProgress = {
      lastRead: row.last_surah && row.last_ayah ? { surah: row.last_surah, ayah: row.last_ayah } : null,
      finished: row.finished ?? [],
      updatedAt: row.updated_at,
    };
    q.applyRemote(progress);
  } else if (q.updatedAt > 0) {
    const { error: pErr } = await supabase.from('quran_progress').upsert({
      user_id: userId,
      last_surah: q.lastRead?.surah ?? null,
      last_ayah: q.lastRead?.ayah ?? null,
      finished: q.finished,
      updated_at: q.updatedAt,
    });
    if (pErr) throw pErr;
  }
}
