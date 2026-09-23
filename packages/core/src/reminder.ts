/**
 * Daily reminder policy — when to offer the reminder, what time to default to,
 * and what each answer means. Pure and testable; the notification API and the
 * modal live in the app.
 *
 * One platform fact shapes all of this: **a notification cannot be sent without
 * an OS permission grant.** Closing an in-app popup is not a grant, so a
 * dismissal cannot switch reminders on. What it can do is remember a sensible
 * time and offer again later, which is what `dismissReminder` does.
 */

/**
 * - `unasked`   — never offered yet.
 * - `dismissed` — the offer was closed without an answer. A preferred time is
 *   remembered, nothing is scheduled, and the offer may return later.
 * - `on`        — accepted and the OS permission was granted.
 * - `off`       — declined, or the OS permission was refused. Never auto-asked
 *   again; the Settings row is the way back.
 */
export type ReminderStatus = 'unasked' | 'dismissed' | 'on' | 'off';

export interface ReminderPrefs {
  status: ReminderStatus;
  /** Minutes after local midnight, 0–1439. */
  timeOfDay: number;
  /** Epoch ms of first launch. The default time comes from this. */
  installedAt: number;
  /** How many times the offer has been shown, so it stops nagging. */
  offersShown: number;
  /** Epoch ms the offer was last shown. */
  lastOfferedAt: number;
}

/** Reminders are only ever scheduled inside civil hours. */
export const REMINDER_WINDOW_START = 7 * 60; // 07:00
export const REMINDER_WINDOW_END = 21 * 60; // 21:00
/** Used when there is no install timestamp to work from. */
export const REMINDER_FALLBACK_TIME = 8 * 60; // 08:00

export const MAX_REMINDER_OFFERS = 3;
/** Never show the offer twice in one day. */
export const REMINDER_OFFER_GAP_MS = 24 * 60 * 60 * 1000;

/**
 * The install moment's time of day, clamped into `REMINDER_WINDOW_*`.
 *
 * The clamp matters: someone who installs at 03:00 must not be signed up for a
 * 3am notification every day for the life of the app. That is how notifications
 * get switched off — or the app uninstalled — so the install time is treated as
 * a hint, not an instruction.
 */
export function defaultReminderTime(installedAt: number): number {
  if (!Number.isFinite(installedAt) || installedAt <= 0) return REMINDER_FALLBACK_TIME;
  const at = new Date(installedAt);
  const minutes = at.getHours() * 60 + at.getMinutes();
  return Math.min(REMINDER_WINDOW_END, Math.max(REMINDER_WINDOW_START, minutes));
}

export function initialReminderPrefs(installedAt: number): ReminderPrefs {
  return {
    status: 'unasked',
    timeOfDay: defaultReminderTime(installedAt),
    installedAt,
    offersShown: 0,
    lastOfferedAt: 0,
  };
}

/**
 * Whether to show the in-app offer on this launch. Answered users are never
 * asked again — only a dismissal earns another try, and at most
 * `MAX_REMINDER_OFFERS` times, a day apart.
 */
export function shouldOfferReminder(prefs: ReminderPrefs, now = Date.now()): boolean {
  if (prefs.status === 'on' || prefs.status === 'off') return false;
  if (prefs.offersShown >= MAX_REMINDER_OFFERS) return false;
  if (prefs.status === 'unasked') return true;
  return now - prefs.lastOfferedAt >= REMINDER_OFFER_GAP_MS;
}

/** Call when the offer becomes visible, not when it is merely due. */
export function recordReminderOffered(prefs: ReminderPrefs, now = Date.now()): ReminderPrefs {
  return { ...prefs, offersShown: prefs.offersShown + 1, lastOfferedAt: now };
}

/** Accepted, and the OS granted permission. `timeOfDay` is the user's choice. */
export function acceptReminder(prefs: ReminderPrefs, timeOfDay: number): ReminderPrefs {
  return { ...prefs, status: 'on', timeOfDay: clampToDay(timeOfDay) };
}

/** Declined in the app, or the OS permission was refused. */
export function declineReminder(prefs: ReminderPrefs): ReminderPrefs {
  return { ...prefs, status: 'off' };
}

/**
 * The offer was closed without an answer. Keeps the install-time default as the
 * preferred time so the setting is never blank, but schedules nothing — there is
 * no permission to schedule with.
 */
export function dismissReminder(prefs: ReminderPrefs): ReminderPrefs {
  return {
    ...prefs,
    status: 'dismissed',
    timeOfDay: prefs.timeOfDay || defaultReminderTime(prefs.installedAt),
  };
}

/** Changing the time later, from the Settings row. */
export function setReminderTime(prefs: ReminderPrefs, timeOfDay: number): ReminderPrefs {
  return { ...prefs, timeOfDay: clampToDay(timeOfDay) };
}

function clampToDay(minutes: number): number {
  if (!Number.isFinite(minutes)) return REMINDER_FALLBACK_TIME;
  return Math.min(1439, Math.max(0, Math.round(minutes)));
}

/** Only `on` is scheduled. Everything else means "no notification". */
export function reminderIsActive(prefs: ReminderPrefs): boolean {
  return prefs.status === 'on';
}

/** The hour and minute an `expo-notifications` DAILY trigger wants. */
export function reminderTrigger(prefs: ReminderPrefs): { hour: number; minute: number } | null {
  if (!reminderIsActive(prefs)) return null;
  return { hour: Math.floor(prefs.timeOfDay / 60), minute: prefs.timeOfDay % 60 };
}

/** 24-hour clock for the settings row and the time picker. */
export function formatReminderTime(minutes: number): string {
  const m = clampToDay(minutes);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
