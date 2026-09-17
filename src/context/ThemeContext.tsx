import * as SecureStore from 'expo-secure-store';
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeColors = {
  background: string;
  surface: string;
  card: string;
  text: string;
  secondaryText: string;
  border: string;
  input: string;
  primary: string;
  danger: string;
};

type ThemeContextType = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => Promise<void>;
  colorScheme: 'light' | 'dark';
  colors: ThemeColors;
};

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F8FAFC',
  card: '#F5F5F5',
  text: '#0F172A',
  secondaryText: '#64748B',
  border: '#E2E8F0',
  input: '#FFFFFF',
  primary: '#007AFF',
  danger: '#D32F2F',
};

const darkColors: ThemeColors = {
  background: '#0F172A',
  surface: '#111827',
  card: '#1E293B',
  text: '#F8FAFC',
  secondaryText: '#94A3B8',
  border: '#334155',
  input: '#1E293B',
  primary: '#3B82F6',
  danger: '#EF4444',
};

const ThemeContext = createContext<
  ThemeContextType | undefined
>(undefined);

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const systemColorScheme = useColorScheme();

  const [theme, setThemeState] =
    useState<ThemeMode>('system');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme =
        await SecureStore.getItemAsync('appTheme');

      if (
        savedTheme === 'light' ||
        savedTheme === 'dark' ||
        savedTheme === 'system'
      ) {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error(
        'Tema yüklenemedi:',
        error
      );
    }
  };

  const setTheme = async (
    newTheme: ThemeMode
  ) => {
    try {
      setThemeState(newTheme);

      await SecureStore.setItemAsync(
        'appTheme',
        newTheme
      );
    } catch (error) {
      console.error(
        'Tema kaydedilemedi:',
        error
      );
    }
  };

  const colorScheme: 'light' | 'dark' =
    theme === 'system'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : theme;

  const colors =
    colorScheme === 'dark'
      ? darkColors
      : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        colorScheme,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme, ThemeProvider içerisinde kullanılmalıdır.'
    );
  }

  return context;
}