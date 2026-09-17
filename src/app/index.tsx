import { Link, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/context/ThemeContext';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [checkingToken, setCheckingToken] =
    useState(true);

  useEffect(() => {
    const checkToken =
      async () => {
        const token =
          await SecureStore.getItemAsync(
            'token'
          );

        if (token) {
          router.replace(
            '/(tabs)/boards'
          );
        } else {
          setCheckingToken(false);
        }
      };

    checkToken();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        'Hata',
        'Email ve şifre alanlarını doldurun.'
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          'https://task-management-app-xc7f.onrender.com/auth/login',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        Alert.alert(
          'Giriş başarısız',
          data.message
        );
        return;
      }

      console.log(
        'Login başarılı:',
        data
      );

      await SecureStore.setItemAsync(
        'token',
        data.token
      );

      router.replace(
        '/(tabs)/boards'
      );
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Bağlantı hatası',
        'Backend sunucusuna bağlanılamadı.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <Text
          style={{
            color: colors.text,
          }}
        >
          Oturum kontrol ediliyor...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          Hoş Geldiniz
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          Hesabınıza giriş yapın
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor:
                colors.border,
              backgroundColor:
                colors.input,
            },
          ]}
          placeholder="E-posta"
          placeholderTextColor={
            colors.secondaryText
          }
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor:
                colors.border,
              backgroundColor:
                colors.input,
            },
          ]}
          placeholder="Şifre"
          placeholderTextColor={
            colors.secondaryText
          }
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text
            style={
              styles.loginButtonText
            }
          >
            {loading
              ? 'Giriş yapılıyor...'
              : 'Giriş Yap'}
          </Text>
        </TouchableOpacity>

        <View
          style={
            styles.registerContainer
          }
        >
          <Text
            style={[
              styles.registerText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Hesabınız yok mu?
          </Text>

          <Link
            href="/register"
            asChild
          >
            <TouchableOpacity>
              <Text
                style={[
                  styles.registerLink,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                Kayıt Ol
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    paddingHorizontal: 30,
    width: '100%',
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 35,
  },

  input: {
    height: 55,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },

  loginButton: {
    height: 55,
    backgroundColor:
      '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  loginButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },

  registerText: {
    fontSize: 15,
  },

  registerLink: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});