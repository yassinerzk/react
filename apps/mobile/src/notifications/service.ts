import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

/**
 * The OS side of the daily reminder. One stable identifier, so rescheduling
 * replaces the existing notification instead of stacking a second one.
 *
 * Everything here is local — nothing is sent to a server, no push token is
 * requested, and no data leaves the device, so the Play Data Safety
 * declaration and the privacy policy are unaffected.
 */

export const DAILY_REMINDER_ID = 'barakah.daily-reminder';
const CHANNEL_ID = 'daily-reminder';

export type PermissionOutcome = 'granted' | 'denied' | 'unsupported';

/** Notifications are a phone feature; the web build must not try. */
const supported = Platform.OS === 'ios' || Platform.OS === 'android';

/** Android 8+ delivers nothing without a channel. */
async function ensureChannel(channelName: string): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: channelName,
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/**
 * Asks the OS, but only when asking can still succeed.
 *
 * The system prompt is effectively one-shot on both platforms: once refused,
 * calling it again does nothing at all. So a refusal is reported back as
 * `denied` and the app points the user at their settings instead of silently
 * doing nothing.
 */
export async function requestReminderPermission(): Promise<PermissionOutcome> {
  if (!supported) return 'unsupported';
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return 'granted';
    if (!current.canAskAgain) return 'denied';
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}

/** True when permission is already held, without prompting for it. */
export async function hasReminderPermission(): Promise<boolean> {
  if (!supported) return false;
  try {
    return (await Notifications.getPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

export interface ReminderContent {
  title: string;
  body: string;
  /** Android channel name, shown in the system notification settings. */
  channelName: string;
}

/**
 * One repeating daily notification. The text is fixed at scheduling time, so
 * the app reschedules on every launch — that keeps the wording in the user's
 * current language and costs nothing.
 */
export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  content: ReminderContent,
): Promise<boolean> {
  if (!supported) return false;
  try {
    await ensureChannel(content.channelName);
    await cancelDailyReminder();
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_REMINDER_ID,
      content: { title: content.title, body: content.body, sound: 'default' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        channelId: CHANNEL_ID,
        hour,
        minute,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelDailyReminder(): Promise<void> {
  if (!supported) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
  } catch {
    // Nothing scheduled under that id; that is the desired state anyway.
  }
}
