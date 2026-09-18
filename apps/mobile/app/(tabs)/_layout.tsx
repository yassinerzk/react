import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useT } from '../../src/i18n';
import { ui } from '../../src/theme';

export default function TabsLayout() {
  const { t, font } = useT();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ui.accent,
        tabBarInactiveTintColor: ui.textMuted,
        tabBarStyle: { backgroundColor: ui.bgElev, borderTopColor: ui.line },
        tabBarLabelStyle: { fontFamily: font.medium, fontSize: 12 },
        sceneStyle: { backgroundColor: ui.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="prayer"
        options={{
          title: t('prayer'),
          tabBarIcon: ({ color, size }) => <Ionicons name="moon" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="mine"
        options={{
          title: t('myPosts'),
          tabBarIcon: ({ color, size }) => <Ionicons name="bookmark" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
