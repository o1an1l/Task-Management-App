import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Board = {
  id: number;
  name: string;
  description?: string | null;
  createdAt: string;
  userId: number;
};

export default function BoardListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('token');
    router.replace('/');
  };

  const fetchBoards = useCallback(async () => {
    try {
      const token =
        await SecureStore.getItemAsync('token');

      if (!token) {
        router.replace('/');
        return;
      }

      const response = await fetch(
        'https://task-management-app-xc7f.onrender.com/boards',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Hata',
          data.message || 'Panolar alınamadı.'
        );
        return;
      }

      setBoards(data.boards);
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Bağlantı hatası',
        'Backend sunucusuna bağlanılamadı.'
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      fetchBoards();
    }, [fetchBoards])
  );

  const deleteBoard = async (boardId: number) => {
    try {
      const token =
        await SecureStore.getItemAsync('token');

      if (!token) {
        Alert.alert(
          'Hata',
          'Oturum bulunamadı.'
        );
        return;
      }

      const response = await fetch(
        `https://task-management-app-xc7f.onrender.com/boards/${boardId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Hata',
          data.message || 'Pano silinemedi.'
        );
        return;
      }

      Alert.alert(
        'Başarılı',
        'Pano başarıyla silindi.'
      );

      fetchBoards();
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Bağlantı hatası',
        'Backend sunucusuna bağlanamadı.'
      );
    }
  };

  const confirmDeleteBoard = (board: Board) => {
    Alert.alert(
      'Panoyu Sil',
      `"${board.name}" panosunu silmek istediğine emin misin?`,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () =>
            deleteBoard(board.id),
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
          },
        ]}
      >
        Panolarım
      </Text>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>
          Çıkış Yap
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          router.push('/create-board')
        }
      >
        <Text style={styles.addButtonText}>
          + Yeni Pano
        </Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loading}
        />
      ) : boards.length === 0 ? (
        <Text
          style={[
            styles.emptyText,
            {
              color: colors.secondaryText,
            },
          ]}
        >
          Henüz oluşturulmuş bir panonuz yok.
        </Text>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.boardList}
        >
          {boards.map((board) => (
            <View
              key={board.id}
              style={[
                styles.boardCard,
                {
                  backgroundColor: colors.card,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: '/board-detail',
                    params: {
                      boardId:
                        board.id.toString(),
                      boardName:
                        board.name,
                      description:
                        board.description || '',
                    },
                  })
                }
              >
                <Text
                  style={[
                    styles.boardTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {board.name}
                </Text>

                {board.description ? (
                  <Text
                    style={[
                      styles.boardDescription,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    {board.description}
                  </Text>
                ) : (
                  <Text
                    style={[
                      styles.boardDescription,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    Açıklama bulunmuyor.
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    router.push({
                      pathname:
                        '/edit-board',
                      params: {
                        boardId:
                          board.id.toString(),
                      },
                    })
                  }
                >
                  <Text style={styles.buttonText}>
                    Düzenle
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    confirmDeleteBoard(board)
                  }
                >
                  <Text style={styles.buttonText}>
                    Sil
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
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

  boardList: {
    paddingBottom: 30,
  },

  boardCard: {
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
    marginBottom: 15,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },

  editButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#D32F2F',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  logoutButton: {
    alignSelf: 'flex-end',
    marginBottom: 15,
  },

  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: 'bold',
  },

  loading: {
    marginTop: 30,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 15,
  },
});