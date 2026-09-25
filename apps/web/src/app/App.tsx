import { useEffect } from 'react';
import { useNavStore, useSettingsStore } from '@/app/store';
import { dirOf, LOCALES, type Locale } from '@barakah/core';
import { useT } from '@/shared/hooks/useT';
import { Toaster } from '@/shared/ui/Toaster';
import { GalleryScreen } from '@/features/gallery/GalleryScreen';
import { EditorScreen } from '@/features/editor/EditorScreen';

export function App() {
  const { t, locale } = useT();
  const setLocale = useSettingsStore((s) => s.setLocale);
  const route = useNavStore((s) => s.route);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dirOf(locale);
  }, [locale]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [route.name]);

  return (
    <div className="app">
      <header className="app__header">
        <button
          type="button"
          className="brand"
          onClick={() => useNavStore.getState().navigate({ name: 'gallery' })}
        >
          <span className="brand__mark" aria-hidden>
            ☪
          </span>
          <span>
            <strong>{t('appName')}</strong>
            <small>{t('tagline')}</small>
          </span>
        </button>
        {/* A native select: it is the accessible, familiar control on the web,
            and each option stays labelled in its own language. */}
        <select
          className="lang"
          aria-label={t('language')}
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
        >
          {LOCALES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </header>
      {route.name === 'gallery' ? (
        <GalleryScreen />
      ) : (
        <EditorScreen key={route.savedId ?? 'draft'} savedId={route.savedId} />
      )}
      <Toaster />
    </div>
  );
}
