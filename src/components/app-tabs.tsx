import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },

        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingTop: 5,
          paddingBottom: insets.bottom + 5,
        },
      }}
    >
      <Tabs.Screen
        name="boards"
        options={{
          title: 'Panolarım',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'albums' : 'albums-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}