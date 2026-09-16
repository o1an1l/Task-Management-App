import { Link, useRouter } from 'expo-router';
import { useState } from 'react';

import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !passwordAgain
    ) {
      Alert.alert(
        'Hata',
        'Tüm alanları doldurun.'
      );
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      Alert.alert(
        'Hata',
        'Geçerli bir e-posta adresi girin.'
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Hata',
        'Şifre en az 6 karakter olmalıdır.'
      );
      return;
    }

    if (password !== passwordAgain) {
      Alert.alert(
        'Hata',
        'Şifreler eşleşmiyor.'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        'http://192.168.1.126:3000/auth/register',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Kayıt başarısız',
          data.message ||
            'Kayıt sırasında bir hata oluştu.'
        );
        return;
      }

      Alert.alert(
        'Kayıt başarılı',
        'Hesabınız başarıyla oluşturuldu.',
        [
          {
            text: 'Giriş Yap',
            onPress: () => router.replace('/'),
          },
        ]
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

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Hesap Oluştur
        </Text>

        <Text style={styles.subtitle}>
          Yeni hesabınızı oluşturun
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ad Soyad"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          placeholder="E-posta"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Şifre"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Şifre Tekrar"
          placeholderTextColor="#999"
          secureTextEntry
          value={passwordAgain}
          onChangeText={setPasswordAgain}
        />

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>
            {loading
              ? 'Kayıt yapılıyor...'
              : 'Kayıt Ol'}
          </Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Zaten hesabınız var mı?
          </Text>

          <Link href="/" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>
                Giriş Yap
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
    backgroundColor: '#fff',
    justifyContent: 'center',
  },

  content: {
    paddingHorizontal: 30,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 35,
  },

  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },

  registerButton: {
    height: 55,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  registerButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },

  loginText: {
    color: '#666',
    fontSize: 15,
  },

  loginLink: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});