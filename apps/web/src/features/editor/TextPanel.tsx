import { useEditorStore } from '@/app/store';
import { useT } from '@/shared/hooks/useT';
import { Field } from '@/shared/ui/Field';
import { Toggle } from '@/shared/ui/Toggle';

export function TextPanel() {
  const { t } = useT();
  const design = useEditorStore((s) => s.design);
  const patch = useEditorStore((s) => s.patch);
  return (
    <div className="panel">
      <Field label={t('headline')}>
        <input
          dir="auto"
          value={design.headline}
          placeholder={t('headlinePlaceholder')}
          onChange={(e) => patch({ headline: e.target.value })}
        />
      </Field>
      <Field label={t('arabicText')}>
        <textarea
          dir="rtl"
          rows={4}
          className="input--arabic"
          value={design.arabic}
          onChange={(e) => patch({ arabic: e.target.value })}
        />
      </Field>
      <Field label={t('translation')}>
        <textarea
          dir="auto"
          rows={3}
          value={design.translation}
          onChange={(e) => patch({ translation: e.target.value })}
        />
      </Field>
      <Field label={t('source')}>
        <input dir="auto" value={design.source} onChange={(e) => patch({ source: e.target.value })} />
      </Field>
      <Field label={t('footer')}>
        <input
          dir="auto"
          value={design.footer}
          placeholder={t('footerPlaceholder')}
          onChange={(e) => patch({ footer: e.target.value })}
        />
      </Field>
      <div className="toggles">
        <Toggle
          label={t('showTranslation')}
          checked={design.showTranslation}
          onChange={(v) => patch({ showTranslation: v })}
        />
        <Toggle
          label={t('showSource')}
          checked={design.showSource}
          onChange={(v) => patch({ showSource: v })}
        />
        <Toggle
          label={t('showHijriDate')}
          checked={design.showHijriDate}
          onChange={(v) => patch({ showHijriDate: v })}
        />
        <Toggle label={t('showFrame')} checked={design.showFrame} onChange={(v) => patch({ showFrame: v })} />
      </div>
    </div>
  );
}
