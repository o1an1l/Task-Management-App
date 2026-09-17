import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { theme, setTheme, colorScheme } =
    useTheme();

  const getThemeText = () => {
    if (theme === 'light') return 'Açık';
    if (theme === 'dark') return 'Koyu';
    return 'Sistem';
  };

  const selectTheme = () => {
    Alert.alert(
      'Tema Seçimi',
      'Uygulamanın görünümünü seçin.',
      [
        {
          text: 'Açık',
          onPress: () =>
            setTheme('light'),
        },
        {
          text: 'Koyu',
          onPress: () =>
            setTheme('dark'),
        },
        {
          text: 'Sistem',
          onPress: () =>
            setTheme('system'),
        },
        {
          text: 'İptal',
          style: 'cancel',
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabından çıkış yapmak istediğine emin misin?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await SecureStore.deleteItemAsync(
              'token'
            );

            router.replace('/');
          },
        },
      ]
    );
  };

  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? '#0F172A'
            : '#F8FAFC',
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 30,
        }}
      >
        <Text
          style={[
            styles.title,
            {
              color: isDark
                ? '#F8FAFC'
                : '#0F172A',
            },
          ]}
        >
          Ayarlar
        </Text>

        <View
          style={[
            styles.section,
            {
              backgroundColor: isDark
                ? '#1E293B'
                : '#FFFFFF',
            },
          ]}
        >
          <Text style={styles.sectionTitle}>
            Görünüm
          </Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={selectTheme}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name="color-palette-outline"
                size={23}
                color="#2563EB"
              />
            </View>

            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.settingTitle,
                  {
                    color: isDark
                      ? '#F8FAFC'
                      : '#0F172A',
                  },
                ]}
              >
                Tema
              </Text>

              <Text
                style={[
                  styles.settingDescription,
                  {
                    color: isDark
                      ? '#94A3B8'
                      : '#64748B',
                  },
                ]}
              >
                {getThemeText()}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={21}
              color="#94A3B8"
            />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.section,
            {
              backgroundColor: isDark
                ? '#1E293B'
                : '#FFFFFF',
            },
          ]}
        >
          <Text style={styles.sectionTitle}>
            Uygulama
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="information-circle-outline"
                size={23}
                color="#2563EB"
              />
            </View>

            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.settingTitle,
                  {
                    color: isDark
                      ? '#F8FAFC'
                      : '#0F172A',
                  },
                ]}
              >
                Uygulama Bilgileri
              </Text>

              <Text
                style={[
                  styles.settingDescription,
                  {
                    color: isDark
                      ? '#94A3B8'
                      : '#64748B',
                  },
                ]}
              >
                Task Management App
              </Text>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="code-slash-outline"
                size={23}
                color="#2563EB"
              />
            </View>

            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.settingTitle,
                  {
                    color: isDark
                      ? '#F8FAFC'
                      : '#0F172A',
                  },
                ]}
              >
                Sürüm
              </Text>

              <Text
                style={[
                  styles.settingDescription,
                  {
                    color: isDark
                      ? '#94A3B8'
                      : '#64748B',
                  },
                ]}
              >
                1.0.0
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.section,
            {
              backgroundColor: isDark
                ? '#1E293B'
                : '#FFFFFF',
            },
          ]}
        >
          <Text style={styles.sectionTitle}>
            Hesap
          </Text>

          <TouchableOpacity
            style={styles.logoutRow}
            onPress={handleLogout}
          >
            <View
              style={
                styles.logoutIconContainer
              }
            >
              <Ionicons
                name="log-out-outline"
                size={23}
                color="#EF4444"
              />
            </View>

            <Text style={styles.logoutText}>
              Çıkış Yap
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>
            Task Management App
          </Text>

          <Text style={styles.footerText}>
            Görevlerinizi daha kolay yönetin.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    marginHorizontal: 20,
    marginBottom: 25,
  },

  section: {
    marginHorizontal: 18,
    marginBottom: 20,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },

  settingRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderTopColor: '#33415522',
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  textContainer: {
    flex: 1,
  },

  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },

  settingDescription: {
    fontSize: 13,
  },

  logoutRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderTopColor: '#33415522',
  },

  logoutIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },

  footer: {
    alignItems: 'center',
    marginTop: 5,
    paddingHorizontal: 20,
  },

  footerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },

  footerText: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 4,
  },
});