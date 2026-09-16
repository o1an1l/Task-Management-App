import {
    useFocusEffect,
    useLocalSearchParams,
    useRouter,
} from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
    useCallback,
    useState,
} from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Board = {
  id: number;
  name: string;
  description?: string | null;
  createdAt: string;
  userId: number;
};

export default function EditBoardScreen() {
  const router = useRouter();

  const { boardId } = useLocalSearchParams<{
    boardId: string;
  }>();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBoard = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('token');

      if (!token) {
        Alert.alert('Hata', 'Oturum bulunamadı.');
        router.replace('/');
        return;
      }

      if (!boardId) {
        Alert.alert('Hata', 'Pano bilgisi bulunamadı.');
        return;
      }

      const response = await fetch('https://task-management-app-xc7f.onrender.com/boards', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Hata',
          data.message || 'Pano bilgileri alınamadı.'
        );
        return;
      }

      const selectedBoard = data.boards.find(
        (item: Board) => item.id === Number(boardId)
      );

      if (!selectedBoard) {
        Alert.alert('Hata', 'Pano bulunamadı.');
        return;
      }

      setName(selectedBoard.name);
      setDescription(selectedBoard.description || '');
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Bağlantı hatası',
        'Backend sunucusuna bağlanılamadı.'
      );
    } finally {
      setLoading(false);
    }
  }, [boardId, router]);

  useFocusEffect(
    useCallback(() => {
      fetchBoard();
    }, [fetchBoard])
  );

  const updateBoard = async () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Pano adı boş bırakılamaz.');
      return;
    }

    try {
      setSaving(true);

      const token = await SecureStore.getItemAsync('token');

      if (!token) {
        Alert.alert('Hata', 'Oturum bulunamadı.');
        return;
      }

      const response = await fetch(
        `https://task-management-app-xc7f.onrender.com/boards/${boardId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Hata',
          data.message || 'Pano güncellenemedi.'
        );
        return;
      }

      Alert.alert(
        'Başarılı',
        'Pano başarıyla güncellendi.',
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
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Pano yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pano Düzenle</Text>

      <Text style={styles.label}>Pano Adı</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Pano adı"
      />

      <Text style={styles.label}>Açıklama</Text>

      <TextInput
        style={[styles.input, styles.descriptionInput]}
        value={description}
        onChangeText={setDescription}
        placeholder="Pano açıklaması"
        multiline
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={updateBoard}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Kaydet</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={saving}
      >
        <Text style={styles.buttonText}>İptal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },

  label: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },

  descriptionInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },

  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },

  cancelButton: {
    backgroundColor: '#333',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});