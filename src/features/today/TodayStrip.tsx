import type { CategoryId } from '@/domain/types';
import { getCategory } from '@/domain/content';
import { useHijriToday } from '@/shared/hooks/useHijriToday';
import { useT } from '@/shared/hooks/useT';
import { Chip } from '@/shared/ui/Chip';

interface TodayStripProps {
  onPick: (category: CategoryId) => void;
}

export function TodayStrip({ onPick }: TodayStripProps) {
  const { t, l, locale } = useT();
  const { label, occasions } = useHijriToday();
  const weekday = new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en', { weekday: 'long' }).format(
    new Date(),
  );
  return (
    <section className="today">
      <div className="today__date">
        <span className="today__weekday">{weekday}</span>
        {label && <span className="today__hijri">{label}</span>}
      </div>
      {occasions.length > 0 && (
        <div className="today__picks">
          <span className="today__label">{t('todayPicks')}</span>
          <div className="chips">
            {occasions.map((o) => {
              const c = getCategory(o.category);
              return (
                <Chip key={o.category} onClick={() => onPick(o.category)} className="chip--accent">
                  <span aria-hidden>{c.icon}</span> {l(o.reason)}
                </Chip>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
