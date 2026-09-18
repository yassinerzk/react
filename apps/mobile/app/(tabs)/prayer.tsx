import { useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { CALC_METHODS, CITIES, formatClock, PRAYER_NAMES, toLocaleDigits } from '@barakah/core';
import { useT } from '../../src/i18n';
import { ui } from '../../src/theme';
import { usePrayerStore, useToastStore } from '../../src/store';
import { usePrayerTimes } from '../../src/features/prayer/usePrayerTimes';
import { useHeading } from '../../src/features/prayer/useHeading';
import { QiblaCompass } from '../../src/features/prayer/QiblaCompass';
import { Button, Chip, SectionTitle } from '../../src/components/ui';

export default function PrayerScreen() {
  const { t, l, locale, font, row, textAlign } = useT();
  const insets = useSafeAreaInsets();
  const toast = useToastStore((s) => s.show);
  const { location, times, next, countdown, qibla } = usePrayerTimes();
  const setLocation = usePrayerStore((s) => s.setLocation);
  const method = usePrayerStore((s) => s.method);
  const setMethod = usePrayerStore((s) => s.setMethod);
  const madhab = usePrayerStore((s) => s.madhab);
  const setMadhab = usePrayerStore((s) => s.setMadhab);
  const [locating, setLocating] = useState(false);
  const [compassOn, setCompassOn] = useState(false);
  const heading = useHeading(compassOn);

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        toast(t('locationDenied'), 'error');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      let label = `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`;
      if (Platform.OS !== 'web') {
        const places = await Location.reverseGeocodeAsync(pos.coords).catch(() => []);
        const p = places[0];
        if (p) label = [p.city ?? p.subregion ?? p.region, p.country].filter(Boolean).join(', ');
      }
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, label });
      setCompassOn(true);
    } catch {
      toast(t('locationDenied'), 'error');
    } finally {
      setLocating(false);
    }
  };

  const enableCompass = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') setCompassOn(true);
    else toast(t('locationDenied'), 'error');
  };

  const tz = location?.timeZone;

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: 40, gap: 6 }}
    >
      <Text style={{ color: ui.text, fontFamily: font.semibold, fontSize: 24, textAlign }}>
        {t('prayerTimes')}
      </Text>

      {/* location */}
      <SectionTitle>{t('location')}</SectionTitle>
      <View style={{ flexDirection: row, gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button
          label={locating ? t('locating') : `📍 ${t('useMyLocation')}`}
          onPress={useMyLocation}
          disabled={locating}
        />
        {location && (
          <Text style={{ color: ui.accent, fontFamily: font.medium, flexShrink: 1 }} numberOfLines={1}>
            {location.label}
          </Text>
        )}
      </View>
      <Text style={{ color: ui.textMuted, fontFamily: font.regular, fontSize: 13, marginTop: 8, textAlign }}>
        {t('chooseCity')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -16 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 8 }}
      >
        {CITIES.map((c) => (
          <Chip
            key={c.id}
            label={l(c.name)}
            active={location?.label === l(c.name)}
            onPress={() => setLocation({ lat: c.lat, lng: c.lng, label: l(c.name), timeZone: c.timeZone })}
          />
        ))}
      </ScrollView>

      {!location ? (
        <Text
          style={{ color: ui.textMuted, fontFamily: font.regular, textAlign: 'center', paddingVertical: 30 }}
        >
          {t('noLocation')}
        </Text>
      ) : (
        <>
          {/* next prayer */}
          {next && countdown && (
            <View
              style={{
                backgroundColor: ui.bgElev2,
                borderRadius: ui.radius,
                padding: 16,
                marginTop: 12,
                borderWidth: 1,
                borderColor: ui.line,
              }}
            >
              <Text style={{ color: ui.textMuted, fontFamily: font.regular, fontSize: 13, textAlign }}>
                {t('nextPrayer')}
              </Text>
              <View style={{ flexDirection: row, justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Text style={{ color: ui.text, fontFamily: font.semibold, fontSize: 28 }}>
                  {l(PRAYER_NAMES.find((p) => p.id === next.id)!.label)}
                </Text>
                <Text
                  style={{
                    color: ui.accent,
                    fontFamily: font.semibold,
                    fontSize: 28,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {formatClock(next.time, locale, tz)}
                </Text>
              </View>
              <Text style={{ color: ui.textMuted, fontFamily: font.regular, textAlign }}>
                {t('inTime')} {toLocaleDigits(countdown.hours, locale)}
                {t('hoursShort')} {toLocaleDigits(countdown.minutes, locale)}
                {t('minutesShort')}
              </Text>
            </View>
          )}

          {/* times */}
          <View
            style={{
              backgroundColor: ui.bgElev,
              borderRadius: ui.radius,
              marginTop: 12,
              borderWidth: 1,
              borderColor: ui.line,
              overflow: 'hidden',
            }}
          >
            {times.map((tm, i) => {
              const meta = PRAYER_NAMES[i];
              const isNext = next?.id === tm.id;
              return (
                <View
                  key={tm.id}
                  style={{
                    flexDirection: row,
                    justifyContent: 'space-between',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: ui.line,
                    backgroundColor: isNext ? 'rgba(217,182,92,0.12)' : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      color: meta.isPrayer ? ui.text : ui.textMuted,
                      fontFamily: isNext ? font.semibold : font.regular,
                      fontSize: 16,
                    }}
                  >
                    {l(meta.label)}
                  </Text>
                  <Text
                    style={{
                      color: isNext ? ui.accent : ui.text,
                      fontFamily: font.medium,
                      fontSize: 16,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {formatClock(tm.time, locale, tz)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* qibla */}
          <SectionTitle>{t('qibla')}</SectionTitle>
          {qibla !== null && (
            <View
              style={{
                backgroundColor: ui.bgElev,
                borderRadius: ui.radius,
                padding: 16,
                borderWidth: 1,
                borderColor: ui.line,
                gap: 12,
              }}
            >
              <QiblaCompass qibla={qibla} heading={heading} />
              <Text style={{ color: ui.text, fontFamily: font.semibold, fontSize: 18, textAlign: 'center' }}>
                {toLocaleDigits(Math.round(qibla), locale)}° {t('degreesFromNorth')}
              </Text>
              <Text
                style={{ color: ui.textMuted, fontFamily: font.regular, fontSize: 13, textAlign: 'center' }}
              >
                {heading === null ? t('qiblaStatic') : t('qiblaHint')}
              </Text>
              {heading === null && Platform.OS !== 'web' && (
                <Button label="🧭 Compass" onPress={enableCompass} size="sm" />
              )}
            </View>
          )}

          {/* settings */}
          <SectionTitle>{t('method')}</SectionTitle>
          <View style={{ flexDirection: row, flexWrap: 'wrap', gap: 8 }}>
            {CALC_METHODS.map((m) => (
              <Chip key={m.id} label={l(m.label)} active={method === m.id} onPress={() => setMethod(m.id)} />
            ))}
          </View>
          <SectionTitle>{t('madhab')}</SectionTitle>
          <View style={{ flexDirection: row, gap: 8 }}>
            <Chip label={t('shafi')} active={madhab === 'shafi'} onPress={() => setMadhab('shafi')} />
            <Chip label={t('hanafi')} active={madhab === 'hanafi'} onPress={() => setMadhab('hanafi')} />
          </View>
        </>
      )}
    </ScrollView>
  );
}
