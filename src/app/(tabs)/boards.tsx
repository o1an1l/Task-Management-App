import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function BoardListScreen() {
  const router = useRouter();

  const { boardName, description } = useLocalSearchParams<{
    boardName?: string;
    description?: string;
  }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panolarım</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/create-board')}>
        <Text style={styles.addButtonText}>+ Yeni Pano</Text>
      </TouchableOpacity>

      {/* GEÇİCİ / MOCK DATA:
          Backend bağlantısı olmadığı için
          örnek bir pano gösteriyoruz.
      */}
      <TouchableOpacity
        style={styles.boardCard}
        onPress={() => router.push('/board-detail')}>
        <Text style={styles.boardTitle}>Üniversite Projesi</Text>

        <Text style={styles.boardDescription}>
          Staj projesi için örnek pano
        </Text>
      </TouchableOpacity>

      {/* GEÇİCİ / MOCK:
          Oluşturulan pano şu anda backend'e kaydedilmiyor.
          Route parametreleri üzerinden geçici olarak
          bu ekranda gösteriliyor.
      */}
      {boardName && (
        <TouchableOpacity
  style={styles.boardCard}
  onPress={() =>
    router.push({
      pathname: '/board-detail',
      params: {
        boardName: boardName,
        description: description,
      },
    })
  }
>
  <Text style={styles.boardTitle}>{boardName}</Text>

  {description ? (
    <Text style={styles.boardDescription}>
      {description}
    </Text>
  ) : (
    <Text style={styles.boardDescription}>
      Açıklama bulunmuyor.
    </Text>
  )}
</TouchableOpacity>
      )}
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

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },

  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  boardCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 18,
    marginTop: 20,
  },

  boardTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  boardDescription: {
    fontSize: 14,
    color: '#666',
  },
});