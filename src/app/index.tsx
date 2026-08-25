import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>

        <Text style={styles.title}>Hoş Geldiniz</Text>

        <Text style={styles.subtitle}>
          Hesabınıza giriş yapın
        </Text>

        <TextInput
          style={styles.input}
          placeholder="E-posta"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Şifre"
          placeholderTextColor="#999"
          secureTextEntry
        />

            {/* GEÇİCİ:
            Backend/authentication bağlantısı yapılana kadar
            giriş butonu doğrudan ana uygulamaya yönlendiriyor. */}
        <TouchableOpacity
           style={styles.loginButton}
            onPress={() => router.replace('/(tabs)/boards')}>
          <Text style={styles.loginButtonText}>Giriş Yap</Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>
            Hesabınız yok mu?
          </Text>

          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text style={styles.registerLink}>Kayıt Ol</Text>
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

  loginButton: {
    height: 55,
    backgroundColor: '#007AFF',
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
    color: '#666',
    fontSize: 15,
  },

  registerLink: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});