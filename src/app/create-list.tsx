import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CreateListScreen() {
  const router = useRouter();

  const { boardId } = useLocalSearchParams<{
    boardId?: string;
  }>();

  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const createList = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Kolon adı boş bırakılamaz.');
      return;
    }

    if (!boardId) {
      Alert.alert('Hata', 'Pano bulunamadı.');
      return;
    }

    try {
      setLoading(true);

      const token = await SecureStore.getItemAsync('token');

      if (!token) {
        Alert.alert('Hata', 'Oturum bulunamadı.');
        router.replace('/');
        return;
      }

      const response = await fetch(
        `http://192.168.1.126:3000/lists/board/${boardId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Kolon oluşturulamadı',
          data.message || 'Bir hata oluştu.'
        );
        return;
      }

      Alert.alert(
        'Başarılı',
        'Kolon başarıyla oluşturuldu.',
        [
          {
            text: 'Tamam',
            onPress: () => router.back(),
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
      <Text style={styles.title}>
        Yeni Kolon Oluştur
      </Text>

      <Text style={styles.label}>
        Kolon Adı
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Kolon adını girin"
        placeholderTextColor="#999"
        value={title}
        onChangeText={setTitle}
        maxLength={50}
      />

      <TouchableOpacity
        style={styles.createButton}
        onPress={createList}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.createButtonText}>
            Kolon Oluştur
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>
          İptal
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 25,
    paddingTop: 60,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 35,
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },

  createButton: {
    height: 55,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  createButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  cancelButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});