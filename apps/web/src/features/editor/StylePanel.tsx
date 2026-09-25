import { useEditorStore } from '@/app/store';
import {
  THEMES,
  BACKGROUNDS,
  ARABIC_FONTS,
  LATIN_FONTS,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  gradientToCss,
} from '@barakah/core';
import { DECORATIONS } from '@/domain/decorations';
import { backgroundThumb } from '@/shared/lib/backgrounds';
import { useT } from '@/shared/hooks/useT';
import { Chip } from '@/shared/ui/Chip';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';

const pickRandom = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

export function StylePanel() {
  const { t, l } = useT();
  const design = useEditorStore((s) => s.design);
  const patch = useEditorStore((s) => s.patch);
  const reset = useEditorStore((s) => s.reset);

  const surprise = () =>
    patch({
      theme: pickRandom(THEMES).id,
      decoration: pickRandom(DECORATIONS.filter((d) => d.id !== 'none')).id,
      arabicFont: pickRandom(ARABIC_FONTS).id,
    });

  return (
    <div className="panel">
      <div className="panel__row">
        <Button size="sm" onClick={surprise}>
          🎲 {t('surprise')}
        </Button>
        <Button size="sm" variant="ghost" onClick={reset}>
          {t('reset')}
        </Button>
      </div>

      <section className="control">
        <h3 className="control__title">{t('theme')}</h3>
        <div className="swatches">
          {THEMES.map((th) => (
            <button
              key={th.id}
              type="button"
              title={l(th.name)}
              aria-label={l(th.name)}
              aria-pressed={design.theme === th.id}
              className={cn('swatch', design.theme === th.id && 'swatch--active')}
              style={{ background: gradientToCss(th.gradient) }}
              onClick={() => patch({ theme: th.id })}
            >
              <span style={{ background: th.accent }} />
            </button>
          ))}
        </div>
      </section>

      <section className="control">
        <h3 className="control__title">{t('photo')}</h3>
        <div className="photos">
          <button
            type="button"
            className={cn('photo', design.background === 'none' && 'photo--active')}
            aria-pressed={design.background === 'none'}
            onClick={() => patch({ background: 'none' })}
          >
            {t('photoNone')}
          </button>
          {BACKGROUNDS.map((b) => (
            <button
              key={b.id}
              type="button"
              title={l(b.name)}
              aria-label={l(b.name)}
              aria-pressed={design.background === b.id}
              className={cn('photo', design.background === b.id && 'photo--active')}
              onClick={() => patch({ background: b.id })}
            >
              <img src={backgroundThumb(b.id)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </section>

      <section className="control">
        <h3 className="control__title">{t('decoration')}</h3>
        <div className="chips">
          {DECORATIONS.map((d) => (
            <Chip key={d.id} active={design.decoration === d.id} onClick={() => patch({ decoration: d.id })}>
              {l(d.name)}
            </Chip>
          ))}
        </div>
      </section>

      <section className="control">
        <h3 className="control__title">{t('arabicFont')}</h3>
        <div className="chips">
          {ARABIC_FONTS.map((f) => (
            <Chip
              key={f.id}
              active={design.arabicFont === f.id}
              style={{ fontFamily: f.family, fontSize: '1.05rem' }}
              onClick={() => patch({ arabicFont: f.id })}
            >
              {f.name.ar ?? f.name.en}
            </Chip>
          ))}
        </div>
      </section>

      <section className="control">
        <h3 className="control__title">{t('latinFont')}</h3>
        <div className="chips">
          {LATIN_FONTS.map((f) => (
            <Chip
              key={f.id}
              active={design.latinFont === f.id}
              style={{ fontFamily: f.family, fontStyle: f.italic ? 'italic' : 'normal' }}
              onClick={() => patch({ latinFont: f.id })}
            >
              {f.name.en}
            </Chip>
          ))}
        </div>
      </section>

      <section className="control">
        <h3 className="control__title">
          {t('fontSize')} <span className="control__value">{Math.round(design.fontScale * 100)}%</span>
        </h3>
        <input
          type="range"
          min={FONT_SCALE_MIN}
          max={FONT_SCALE_MAX}
          step={0.05}
          value={design.fontScale}
          onChange={(e) => patch({ fontScale: Number(e.target.value) })}
        />
      </section>

      <section className="control">
        <h3 className="control__title">{t('align')}</h3>
        <div className="chips">
          <Chip active={design.align === 'center'} onClick={() => patch({ align: 'center' })}>
            {t('alignCenter')}
          </Chip>
          <Chip active={design.align === 'start'} onClick={() => patch({ align: 'start' })}>
            {t('alignStart')}
          </Chip>
        </div>
      </section>
    </div>
  );
}
