import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CreateBoardScreen() {
  const router = useRouter();

  const [boardName, setBoardName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const createBoard = async () => {
    if (boardName.trim() === '') {
      Alert.alert('Hata', 'Pano adı boş bırakılamaz.');
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
        'http://192.168.1.126:3000/boards',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: boardName.trim(),
            description: description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Pano oluşturulamadı',
          data.message || 'Bir hata oluştu.'
        );
        return;
      }

      Alert.alert(
        'Başarılı',
        'Pano başarıyla oluşturuldu.',
        [
          {
            text: 'Tamam',
            onPress: () => router.replace('/(tabs)/boards'),
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
      <Text style={styles.title}>Yeni Pano Oluştur</Text>

      <Text style={styles.label}>Pano Adı</Text>

      <TextInput
        style={styles.input}
        placeholder="Pano adını girin"
        placeholderTextColor="#999"
        value={boardName}
        onChangeText={setBoardName}
      />

      <Text style={styles.label}>Açıklama</Text>

      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Pano açıklaması (isteğe bağlı)"
        placeholderTextColor="#999"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity
        style={styles.createButton}
        onPress={createBoard}
        disabled={loading}
      >
        <Text style={styles.createButtonText}>
          {loading ? 'Oluşturuluyor...' : 'Pano Oluştur'}
        </Text>
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

  descriptionInput: {
    height: 120,
    paddingTop: 15,
    textAlignVertical: 'top',
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