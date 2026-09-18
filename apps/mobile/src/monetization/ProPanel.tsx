import { Text, View } from 'react-native';
import { hasAdReward, isPro } from '@barakah/core';
import { useEntitlementStore } from './store';
import { useToastStore } from '../store';
import { useT } from '../i18n';
import { ui } from '../theme';
import { Button } from '../components/ui';

export function ProPanel() {
  const { t, font, row, textAlign, locale } = useT();
  const toast = useToastStore((s) => s.show);
  const entitlements = useEntitlementStore((s) => s.entitlements);
  const purchasePro = useEntitlementStore((s) => s.purchasePro);
  const restore = useEntitlementStore((s) => s.restore);
  const busy = useEntitlementStore((s) => s.busy);

  if (isPro(entitlements)) {
    return <Text style={{ color: ui.accent, fontFamily: font.medium, textAlign }}>✓ {t('youArePro')}</Text>;
  }
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: ui.textMuted, fontFamily: font.regular, fontSize: 13, textAlign }}>
        {t('proDesc')}
      </Text>
      {hasAdReward(entitlements) && (
        <Text style={{ color: ui.accent, fontFamily: font.regular, fontSize: 12, textAlign }}>
          {t('adRewardActive')}{' '}
          {new Date(entitlements.adRewardUntil).toLocaleString(locale === 'ar' ? 'ar' : 'en')}
        </Text>
      )}
      <View style={{ flexDirection: row, gap: 8, flexWrap: 'wrap' }}>
        <Button
          label={busy ? t('preparing') : `★ ${t('goPro')}`}
          variant="primary"
          size="sm"
          disabled={busy}
          onPress={async () =>
            toast((await purchasePro()) === 'purchased' ? t('purchased') : t('notAvailableYet'))
          }
        />
        <Button
          label={t('restorePurchases')}
          size="sm"
          variant="ghost"
          disabled={busy}
          onPress={() => void restore()}
        />
      </View>
    </View>
  );
}
