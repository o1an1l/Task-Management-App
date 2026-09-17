import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as ExpoThemeProvider,
  Stack,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import {
  ThemeProvider,
  useTheme,
} from '@/context/ThemeContext';

SplashScreen.preventAutoHideAsync();

function AppLayout() {
  const { colorScheme } = useTheme();

  return (
    <ExpoThemeProvider
      value={
        colorScheme === 'dark'
          ? DarkTheme
          : DefaultTheme
      }
    >
      <AnimatedSplashOverlay />

      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="register"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="board-detail"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="task-details"
          options={{
            title: 'Görev Detayı',
          }}
        />

        <Stack.Screen
          name="create-task"
          options={{
            title: 'Yeni Görev',
          }}
        />

        <Stack.Screen
          name="create-list"
          options={{
            title: 'Yeni Kolon',
          }}
        />

        <Stack.Screen
          name="edit-task"
          options={{
            title: 'Görevi Düzenle',
          }}
        />

        <Stack.Screen
          name="edit-list"
          options={{
            title: 'Kolonu Düzenle',
          }}
        />

        <Stack.Screen
          name="create-board"
          options={{
            title: 'Yeni Pano',
          }}
        />
      </Stack>
    </ExpoThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppLayout />
    </ThemeProvider>
  );
}