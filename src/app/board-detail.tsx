import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function BoardDetailScreen() {
  const { boardName, description } = useLocalSearchParams<{
    boardName?: string;
    description?: string;
  }>();

  return (
    <View style={styles.container}>
      {/* GEÇİCİ / MOCK DATA:
          Backend bağlantısı yapılana kadar
          pano ve görev verileri örnek olarak gösterilecek.
      */}

      <Text style={styles.title}>
        {boardName || 'Pano'}
      </Text>

      {description ? (
        <Text style={styles.description}>
          {description}
        </Text>
      ) : null}

      <View style={styles.boardContainer}>
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Yapılacaklar</Text>

          <View style={styles.taskCard}>
            <Text style={styles.taskText}>
              Login ekranını yap
            </Text>
          </View>

          <View style={styles.taskCard}>
            <Text style={styles.taskText}>
              Register ekranını yap
            </Text>
          </View>
        </View>

        <View style={styles.column}>
          <Text style={styles.columnTitle}>Devam Ediyor</Text>

          <View style={styles.taskCard}>
            <Text style={styles.taskText}>
              Board ekranını yap
            </Text>
          </View>
        </View>

        <View style={styles.column}>
          <Text style={styles.columnTitle}>Tamamlandı</Text>

          <View style={styles.taskCard}>
            <Text style={styles.taskText}>
              Expo kurulumu
            </Text>
          </View>
        </View>
      </View>
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
    marginBottom: 8,
  },

  description: {
    fontSize: 15,
    color: '#666',
    marginBottom: 25,
  },

  boardContainer: {
    gap: 20,
  },

  column: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
  },

  columnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },

  taskText: {
    fontSize: 15,
  },
});