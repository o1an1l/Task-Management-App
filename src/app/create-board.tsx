import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function CreateBoardScreen() {
  const router = useRouter();

  // GEÇİCİ / MOCK:
  // Backend bağlantısı yapılana kadar
  // pano bilgilerini ekranda tutmak için
  // local state kullanıyoruz.
  const [boardName, setBoardName] = useState('');
  const [description, setDescription] = useState('');

  const createBoard = () => {
    // Pano adı boş bırakılırsa işlem yapılmıyor.
    if (boardName.trim() === '') {
      return;
    }

    /*
      GEÇİCİ / MOCK:
      Backend bağlantısı olmadığı için
      şu anda gerçek bir veritabanına kayıt yapılmıyor.

      Bir sonraki aşamada burada API isteği
      gönderilecek ve pano backend'e kaydedilecek.
    */

    router.replace({
      pathname: '/(tabs)/boards',
      params: {
        boardName: boardName,
        description: description,
      },
    });
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
      >
        <Text style={styles.createButtonText}>
          Pano Oluştur
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
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