import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale, SavedDesign, StoryDesign } from '@/domain/types';
import { DEFAULT_DESIGN } from '@/domain/design';
import { detectLocale } from '@/shared/i18n';
import { newId } from '@/shared/lib/id';

/* ---------------- settings ---------------- */

interface SettingsState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      locale: detectLocale(),
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'barakah.settings', version: 1 },
  ),
);

/* ---------------- navigation ---------------- */

export type Route = { name: 'gallery' } | { name: 'editor'; savedId?: string };

interface NavState {
  route: Route;
  navigate: (route: Route) => void;
}

export const useNavStore = create<NavState>()((set) => ({
  route: { name: 'gallery' },
  navigate: (route) => set({ route }),
}));

/* ---------------- editor ---------------- */

interface EditorState {
  design: StoryDesign;
  /** The design the editor was opened with, for "reset". */
  original: StoryDesign;
  load: (design: StoryDesign) => void;
  patch: (partial: Partial<StoryDesign>) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      design: DEFAULT_DESIGN,
      original: DEFAULT_DESIGN,
      load: (design) => set({ design, original: design }),
      patch: (partial) => set({ design: { ...get().design, ...partial } }),
      reset: () => set({ design: get().original }),
    }),
    { name: 'barakah.editor', version: 1 },
  ),
);

/* ---------------- library (saved designs) ---------------- */

interface LibraryState {
  items: SavedDesign[];
  upsert: (design: StoryDesign, id?: string) => SavedDesign;
  remove: (id: string) => void;
  get: (id: string) => SavedDesign | undefined;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      items: [],
      upsert: (design, id) => {
        const now = Date.now();
        const existing = id ? get().items.find((i) => i.id === id) : undefined;
        const saved: SavedDesign = existing
          ? { ...existing, design, updatedAt: now }
          : { id: newId('post'), design, createdAt: now, updatedAt: now };
        set({ items: [saved, ...get().items.filter((i) => i.id !== saved.id)] });
        return saved;
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      get: (id) => get().items.find((i) => i.id === id),
    }),
    { name: 'barakah.library', version: 1 },
  ),
);

/* ---------------- toasts ---------------- */

export interface Toast {
  id: string;
  message: string;
  tone: 'info' | 'success' | 'error';
}

interface ToastState {
  toasts: Toast[];
  show: (message: string, tone?: Toast['tone']) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  show: (message, tone = 'info') => {
    const id = newId('t');
    set({ toasts: [...get().toasts, { id, message, tone }] });
    setTimeout(() => get().dismiss(id), 3200);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
