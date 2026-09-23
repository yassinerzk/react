import { Platform, Text, View } from 'react-native';
import { formatReminderTime, reminderIsActive } from '@barakah/core';
import { useT } from '../i18n';
import { ui } from '../theme';
import { useToastStore } from '../store';
import { Button } from '../components/ui';
import { useReminderStore } from './store';

/**
 * Settings row for the daily reminder. Always present, whatever was answered to
 * the first offer — a reader who said "not now", or who closed the sheet, needs
 * a way back that does not depend on the app asking again.
 */
export function ReminderRow() {
  const { t, font, row, textAlign } = useT();
  const toast = useToastStore((s) => s.show);
  const prefs = useReminderStore((s) => s.prefs);
  const openOffer = useReminderStore((s) => s.openOffer);
  const turnOff = useReminderStore((s) => s.turnOff);
  const on = reminderIsActive(prefs);

  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return null;

  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: ui.textMuted, fontFamily: font.regular, fontSize: 13, textAlign }}>
        {on ? `${t('reminderEveryDayAt')} ${formatReminderTime(prefs.timeOfDay)}` : t('reminderBody')}
      </Text>
      <View style={{ flexDirection: row, gap: 8, flexWrap: 'wrap' }}>
        <Button
          label={on ? t('reminderChange') : t('reminderTurnOn')}
          variant={on ? 'secondary' : 'primary'}
          size="sm"
          onPress={() => openOffer(on ? 'edit' : 'offer')}
        />
        {on && (
          <Button
            label={t('reminderTurnOff')}
            variant="ghost"
            size="sm"
            onPress={async () => {
              await turnOff();
              toast(t('reminderOffToast'));
            }}
          />
        )}
      </View>
    </View>
  );
}
