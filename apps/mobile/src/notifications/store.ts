import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  acceptReminder,
  declineReminder,
  dismissReminder,
  initialReminderPrefs,
  recordReminderOffered,
  reminderIsActive,
  reminderTrigger,
  setReminderTime,
  shouldOfferReminder,
  translate,
  type ReminderPrefs,
} from '@barakah/core';
import { useSettingsStore } from '../store';
import {
  cancelDailyReminder,
  hasReminderPermission,
  requestReminderPermission,
  scheduleDailyReminder,
} from './service';

/**
 * The offer is held back until the second session. Asking four seconds into
 * someone's very first visit — before they have seen a single card — is the
 * pattern people recognise and refuse, and the OS prompt only comes once. A
 * reader who has come back is both likelier to say yes and likelier to mean it.
 */
export const MIN_SESSIONS_BEFORE_OFFER = 2;

/** How long after the home screen settles before the offer appears. */
export const REMINDER_OFFER_DELAY_MS = 4000;

function content() {
  const locale = useSettingsStore.getState().locale;
  return {
    title: translate(locale, 'reminderNotifTitle'),
    body: translate(locale, 'reminderNotifBody'),
    channelName: translate(locale, 'reminderLabel'),
  };
}

async function applySchedule(prefs: ReminderPrefs): Promise<void> {
  const trigger = reminderTrigger(prefs);
  if (!trigger) {
    await cancelDailyReminder();
    return;
  }
  await scheduleDailyReminder(trigger.hour, trigger.minute, content());
}

export type ReminderSheetMode = 'offer' | 'edit';

interface ReminderState {
  prefs: ReminderPrefs;
  /** App launches so far. Persisted, so it survives a restart. */
  sessions: number;
  /** Which sheet is on screen: the first offer, or changing the time. */
  offering: ReminderSheetMode | null;
  startSession: () => void;
  /** True when the offer should be shown on this launch. */
  dueToOffer: () => boolean;
  openOffer: (mode: ReminderSheetMode) => void;
  accept: (timeOfDay: number) => Promise<'granted' | 'denied' | 'unsupported'>;
  decline: () => void;
  dismiss: () => void;
  changeTime: (timeOfDay: number) => Promise<void>;
  turnOff: () => Promise<void>;
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => ({
      prefs: initialReminderPrefs(Date.now()),
      sessions: 0,
      offering: null,

      startSession: () => {
        set({ sessions: get().sessions + 1 });
        // Rescheduling on every launch keeps the wording in the current
        // language and repairs anything the OS dropped.
        void (async () => {
          const prefs = get().prefs;
          if (!reminderIsActive(prefs)) return;
          if (!(await hasReminderPermission())) {
            // Permission was revoked in system settings since last time.
            set({ prefs: declineReminder(prefs) });
            await cancelDailyReminder();
            return;
          }
          await applySchedule(prefs);
        })();
      },

      dueToOffer: () => {
        if (Platform.OS !== 'ios' && Platform.OS !== 'android') return false;
        if (get().sessions < MIN_SESSIONS_BEFORE_OFFER) return false;
        return shouldOfferReminder(get().prefs);
      },

      openOffer: (mode) =>
        set({
          offering: mode,
          // Only the automatic offer counts towards the nag limit; opening it
          // from Settings is the reader's own choice.
          prefs: mode === 'offer' ? recordReminderOffered(get().prefs) : get().prefs,
        }),

      accept: async (timeOfDay) => {
        const outcome = await requestReminderPermission();
        if (outcome !== 'granted') {
          // The OS said no, so the app must not pretend the reminder is on.
          set({ prefs: declineReminder(get().prefs), offering: null });
          return outcome;
        }
        const prefs = acceptReminder(get().prefs, timeOfDay);
        set({ prefs, offering: null });
        await applySchedule(prefs);
        return 'granted';
      },

      decline: () => set({ prefs: declineReminder(get().prefs), offering: null }),

      // Closing the sheet keeps the remembered time but schedules nothing:
      // there is no permission to schedule with.
      dismiss: () => set({ prefs: dismissReminder(get().prefs), offering: null }),

      changeTime: async (timeOfDay) => {
        const prefs = setReminderTime(get().prefs, timeOfDay);
        set({ prefs, offering: null });
        await applySchedule(prefs);
      },

      turnOff: async () => {
        set({ prefs: declineReminder(get().prefs), offering: null });
        await cancelDailyReminder();
      },
    }),
    {
      name: 'barakah.reminder',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // `offering` is screen state, not something to restore on launch.
      partialize: (s) => ({ prefs: s.prefs, sessions: s.sessions }),
    },
  ),
);
