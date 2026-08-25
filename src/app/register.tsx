import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link } from 'expo-router';

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>

        <Text style={styles.title}>Hesap Oluştur</Text>

        <Text style={styles.subtitle}>
          Yeni hesabınızı oluşturun
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

        <TextInput
          style={styles.input}
          placeholder="Şifre Tekrar"
          placeholderTextColor="#999"
          secureTextEntry
        />

        <TouchableOpacity style={styles.registerButton}>
          <Text style={styles.registerButtonText}>
            Kayıt Ol
          </Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Zaten hesabınız var mı?
          </Text>


          <Link href="/" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Giriş Yap</Text>
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