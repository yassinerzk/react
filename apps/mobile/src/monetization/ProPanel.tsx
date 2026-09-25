import { Text, View } from 'react-native';
import { hasAdReward, isPro, tagOf } from '@barakah/core';
import { useEntitlementStore } from './store';
import { monetizationReady } from './adapter';
import { useToastStore } from '../store';
import { useT } from '../i18n';
import { ui } from '../theme';
import { Button } from '../components/ui';

/** Small outlined pill marking something that exists but is not live yet. */
function ComingSoon() {
  const { t, font } = useT();
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: ui.accent,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: 'center',
      }}
    >
      <Text style={{ color: ui.accent, fontFamily: font.medium, fontSize: 12 }}>{t('comingSoon')}</Text>
    </View>
  );
}

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

  const description = (
    <Text style={{ color: ui.textMuted, fontFamily: font.regular, fontSize: 13, textAlign }}>
      {t('proDesc')}
    </Text>
  );

  // No billing SDK in this build, so every button here could only end in an
  // apology. Show what is coming and leave the controls inert.
  if (!monetizationReady) {
    return (
      <View style={{ gap: 10 }}>
        {description}
        <View style={{ flexDirection: row, gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button label={`★ ${t('goPro')}`} variant="primary" size="sm" disabled onPress={() => {}} />
          <ComingSoon />
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {description}
      {hasAdReward(entitlements) && (
        <Text style={{ color: ui.accent, fontFamily: font.regular, fontSize: 12, textAlign }}>
          {t('adRewardActive')} {new Date(entitlements.adRewardUntil).toLocaleString(tagOf(locale))}
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
