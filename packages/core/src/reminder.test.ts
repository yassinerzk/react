import {
  acceptReminder,
  declineReminder,
  defaultReminderTime,
  dismissReminder,
  formatReminderTime,
  initialReminderPrefs,
  MAX_REMINDER_OFFERS,
  recordReminderOffered,
  REMINDER_FALLBACK_TIME,
  REMINDER_OFFER_GAP_MS,
  REMINDER_WINDOW_END,
  REMINDER_WINDOW_START,
  reminderIsActive,
  reminderTrigger,
  setReminderTime,
  shouldOfferReminder,
} from './reminder';

/** Local time, because the reminder is a local-clock thing. */
const at = (h: number, m = 0) => new Date(2026, 8, 23, h, m).getTime();

describe('defaultReminderTime', () => {
  it('uses the time of day the app was installed', () => {
    expect(defaultReminderTime(at(9, 30))).toBe(9 * 60 + 30);
  });

  it('never signs a 3am installer up for a 3am notification', () => {
    expect(defaultReminderTime(at(3))).toBe(REMINDER_WINDOW_START);
    expect(defaultReminderTime(at(0, 5))).toBe(REMINDER_WINDOW_START);
  });

  it('pulls a late-night install back to the end of the window', () => {
    expect(defaultReminderTime(at(23, 30))).toBe(REMINDER_WINDOW_END);
  });

  it('falls back when there is no usable install time', () => {
    expect(defaultReminderTime(0)).toBe(REMINDER_FALLBACK_TIME);
    expect(defaultReminderTime(Number.NaN)).toBe(REMINDER_FALLBACK_TIME);
  });
});

describe('the offer', () => {
  it('shows on a fresh install', () => {
    expect(shouldOfferReminder(initialReminderPrefs(at(9)), at(9))).toBe(true);
  });

  it('never returns once the user has answered either way', () => {
    const base = initialReminderPrefs(at(9));
    const on = acceptReminder(base, 8 * 60);
    const off = declineReminder(base);
    const muchLater = at(9) + 400 * REMINDER_OFFER_GAP_MS;
    expect(shouldOfferReminder(on, muchLater)).toBe(false);
    expect(shouldOfferReminder(off, muchLater)).toBe(false);
  });

  it('waits a day before asking a dismisser again, and gives up after a few tries', () => {
    let p = recordReminderOffered(initialReminderPrefs(at(9)), at(9));
    p = dismissReminder(p);
    expect(shouldOfferReminder(p, at(9) + 1000)).toBe(false);
    expect(shouldOfferReminder(p, at(9) + REMINDER_OFFER_GAP_MS)).toBe(true);

    // Dismissed every time it was offered.
    let clock = at(9);
    while (p.offersShown < MAX_REMINDER_OFFERS) {
      clock += REMINDER_OFFER_GAP_MS;
      p = dismissReminder(recordReminderOffered(p, clock));
    }
    expect(shouldOfferReminder(p, clock + 10 * REMINDER_OFFER_GAP_MS)).toBe(false);
  });
});

describe('answers', () => {
  const base = initialReminderPrefs(at(9, 30));

  it('accepting turns it on at the chosen time', () => {
    const p = acceptReminder(base, 6 * 60 + 15);
    expect(reminderIsActive(p)).toBe(true);
    expect(reminderTrigger(p)).toEqual({ hour: 6, minute: 15 });
  });

  it('a dismissal keeps the install-time default but schedules nothing', () => {
    const p = dismissReminder(base);
    expect(p.status).toBe('dismissed');
    expect(p.timeOfDay).toBe(9 * 60 + 30); // the install time, as asked for
    // No OS permission has been granted, so there is nothing to schedule.
    expect(reminderIsActive(p)).toBe(false);
    expect(reminderTrigger(p)).toBeNull();
  });

  it('declining schedules nothing', () => {
    expect(reminderTrigger(declineReminder(base))).toBeNull();
  });

  it('the time can be changed later without touching the status', () => {
    const p = setReminderTime(acceptReminder(base, 8 * 60), 20 * 60 + 45);
    expect(p.status).toBe('on');
    expect(reminderTrigger(p)).toEqual({ hour: 20, minute: 45 });
  });

  it('keeps a chosen time inside the day', () => {
    expect(setReminderTime(base, -30).timeOfDay).toBe(0);
    expect(setReminderTime(base, 5000).timeOfDay).toBe(1439);
  });
});

describe('formatReminderTime', () => {
  it('pads to a 24-hour clock', () => {
    expect(formatReminderTime(7 * 60)).toBe('07:00');
    expect(formatReminderTime(21 * 60 + 5)).toBe('21:05');
    expect(formatReminderTime(0)).toBe('00:00');
  });
});
