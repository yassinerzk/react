import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useT } from '../../src/i18n';
import { ui } from '../../src/theme';
import { useEditorStore, useLibraryStore, useToastStore } from '../../src/store';
import { useHijriToday } from '../../src/hooks/useHijriToday';
import { useLayoutWidth } from '../../src/hooks/useLayoutWidth';
import { StoryCard } from '../../src/components/StoryCard';
import { Button, SectionTitle } from '../../src/components/ui';
import { authEnabled } from '../../src/auth/supabase';
import { useAuthStore } from '../../src/auth/store';
import { syncAll } from '../../src/auth/sync';
import { ProPanel } from '../../src/monetization/ProPanel';

function AccountPanel() {
  const { t, font, row, textAlign } = useT();
  const toast = useToastStore((s) => s.show);
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const notice = useAuthStore((s) => s.notice);
  const signUp = useAuthStore((s) => s.signUp);
  const signIn = useAuthStore((s) => s.signIn);
  const signOut = useAuthStore((s) => s.signOut);
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [syncing, setSyncing] = useState(false);

  const sync = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      await syncAll(user.id);
      toast(t('synced'), 'success');
    } catch {
      toast(t('authError'), 'error');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const handle = setTimeout(() => void sync(), 0);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const input = {
    backgroundColor: ui.bg,
    borderWidth: 1,
    borderColor: ui.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: ui.text,
    fontFamily: font.regular,
    fontSize: 15,
  } as const;

  if (!authEnabled) {
    return (
      <Text style={{ color: ui.textMuted, fontFamily: font.regular, fontSize: 13, textAlign }}>
        {t('authNotConfigured')}
      </Text>
    );
  }
  if (user) {
    return (
      <View style={{ gap: 10 }}>
        <Text style={{ color: ui.textMuted, fontFamily: font.regular, fontSize: 13, textAlign }}>
          {t('signedInAs')} <Text style={{ color: ui.text, fontFamily: font.medium }}>{user.email}</Text>
        </Text>
        <View style={{ flexDirection: row, gap: 8 }}>
          <Button
            label={syncing ? t('preparing') : `↻ ${t('syncNow')}`}
            size="sm"
            onPress={sync}
            disabled={syncing}
          />
          <Button label={t('signOut')} size="sm" variant="ghost" onPress={signOut} />
        </View>
      </View>
    );
  }
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: ui.textMuted, fontFamily: font.regular, fontSize: 13, textAlign }}>
        {t('syncHint')}
      </Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder={t('email')}
        placeholderTextColor={ui.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        style={input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder={t('password')}
        placeholderTextColor={ui.textMuted}
        secureTextEntry
        autoComplete={mode === 'signup' ? 'new-password' : 'password'}
        style={input}
      />
      {error && <Text style={{ color: ui.danger, fontFamily: font.regular, fontSize: 13 }}>{error}</Text>}
      {notice === 'check-email' && (
        <Text style={{ color: ui.accent, fontFamily: font.medium, fontSize: 13 }}>{t('checkEmail')}</Text>
      )}
      <Button
        label={status === 'busy' ? t('preparing') : mode === 'signup' ? t('createAccount') : t('signIn')}
        variant="primary"
        disabled={status === 'busy' || !email || password.length < 6}
        onPress={() =>
          void (mode === 'signup' ? signUp(email.trim(), password) : signIn(email.trim(), password))
        }
      />
      <Pressable onPress={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>
        <Text style={{ color: ui.accent, fontFamily: font.medium, fontSize: 13, textAlign: 'center' }}>
          {mode === 'signup' ? t('haveAccount') : t('noAccount')}
        </Text>
      </Pressable>
    </View>
  );
}

export default function MeScreen() {
  const { t, font, row, textAlign } = useT();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const width = useLayoutWidth();
  const { label: hijriLabel } = useHijriToday();
  const items = useLibraryStore((s) => s.items);
  const remove = useLibraryStore((s) => s.remove);
  const upsert = useLibraryStore((s) => s.upsert);
  const load = useEditorStore((s) => s.load);
  const colWidth = Math.floor((width - 32 - 12) / 2);

  return (
    <FlatList
      data={items}
      numColumns={2}
      extraData={colWidth}
      keyExtractor={(i) => i.id}
      columnWrapperStyle={{ gap: 12, flexDirection: row }}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, gap: 16 }}
      ListHeaderComponent={
        <View style={{ gap: 6 }}>
          <Text style={{ color: ui.text, fontFamily: font.semibold, fontSize: 24, textAlign }}>
            {t('account')}
          </Text>
          <View
            style={{
              backgroundColor: ui.bgElev,
              borderRadius: ui.radius,
              borderWidth: 1,
              borderColor: ui.line,
              padding: 16,
            }}
          >
            <AccountPanel />
          </View>
          <SectionTitle>{t('proTitle')}</SectionTitle>
          <View
            style={{
              backgroundColor: ui.bgElev,
              borderRadius: ui.radius,
              borderWidth: 1,
              borderColor: ui.line,
              padding: 16,
            }}
          >
            <ProPanel />
          </View>
          <SectionTitle>{t('myPosts')}</SectionTitle>
        </View>
      }
      ListEmptyComponent={
        <Text
          style={{ color: ui.textMuted, fontFamily: font.regular, textAlign: 'center', paddingVertical: 30 }}
        >
          {t('myPostsEmpty')}
        </Text>
      }
      renderItem={({ item }) => (
        <View style={{ width: colWidth, gap: 8 }}>
          <Pressable
            onPress={() => {
              load(item.design, item.id);
              router.push('/editor');
            }}
            style={{ borderRadius: 14, overflow: 'hidden' }}
          >
            <StoryCard design={item.design} width={colWidth} hijriLabel={hijriLabel} />
          </Pressable>
          <View style={{ flexDirection: row, gap: 6, justifyContent: 'flex-end' }}>
            <Button label={t('duplicate')} size="sm" variant="ghost" onPress={() => upsert(item.design)} />
            <Button label={t('delete')} size="sm" variant="danger" onPress={() => remove(item.id)} />
          </View>
        </View>
      )}
    />
  );
}
