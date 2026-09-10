import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function CreateTaskScreen() {
  const router = useRouter();

  const { boardId } = useLocalSearchParams<{
    boardId?: string;
  }>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [loading, setLoading] = useState(false);

  const createTask = async () => {
    if (title.trim() === '') {
      Alert.alert('Hata', 'Görev adı boş bırakılamaz.');
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
        'http://10.0.2.2:3000/tasks',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            boardId: Number(boardId),
            title: title.trim(),
            description: description.trim(),
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Görev oluşturulamadı',
          data.message || 'Bir hata oluştu.'
        );
        return;
      }

      Alert.alert(
        'Başarılı',
        'Görev başarıyla oluşturuldu.',
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
      <Text style={styles.title}>Yeni Görev Oluştur</Text>

      <Text style={styles.label}>Görev Adı</Text>

      <TextInput
        style={styles.input}
        placeholder="Görev adını girin"
        placeholderTextColor="#999"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Açıklama</Text>

      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Görev açıklaması (isteğe bağlı)"
        placeholderTextColor="#999"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Durum</Text>

      <View style={styles.statusContainer}>
        <TouchableOpacity
          style={[
            styles.statusButton,
            status === 'TODO' && styles.selectedStatus,
          ]}
          onPress={() => setStatus('TODO')}
        >
          <Text
            style={[
              styles.statusText,
              status === 'TODO' && styles.selectedStatusText,
            ]}
          >
            Yapılacak
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusButton,
            status === 'IN_PROGRESS' && styles.selectedStatus,
          ]}
          onPress={() => setStatus('IN_PROGRESS')}
        >
          <Text
            style={[
              styles.statusText,
              status === 'IN_PROGRESS' && styles.selectedStatusText,
            ]}
          >
            Devam Ediyor
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusButton,
            status === 'DONE' && styles.selectedStatus,
          ]}
          onPress={() => setStatus('DONE')}
        >
          <Text
            style={[
              styles.statusText,
              status === 'DONE' && styles.selectedStatusText,
            ]}
          >
            Tamamlandı
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={createTask}
        disabled={loading}
      >
        <Text style={styles.createButtonText}>
          {loading ? 'Oluşturuluyor...' : 'Görev Oluştur'}
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

  statusContainer: {
    marginBottom: 20,
  },

  statusButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
  },

  selectedStatus: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },

  statusText: {
    fontSize: 15,
    textAlign: 'center',
  },

  selectedStatusText: {
    color: '#fff',
    fontWeight: 'bold',
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