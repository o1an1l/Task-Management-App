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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/context/ThemeContext';

type Task = {
  id: number;
  title: string;
  description?: string | null;
  priority: string;
  dueDate?: string | null;
  createdAt: string;
  boardId: number;
  listId?: number | null;

  list?: {
    id: number;
    title: string;
    order: number;
  } | null;

  assignee?: {
    id: number;
    name?: string | null;
    email: string;
  } | null;
};

type Comment = {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    name?: string | null;
    email: string;
  };
};

export default function TaskDetailScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const {
    taskId,
    boardId,
  } =
    useLocalSearchParams<{
      taskId: string;
      boardId: string;
    }>();

  const [task, setTask] =
    useState<Task | null>(null);

  const [comments, setComments] =
    useState<Comment[]>([]);

  const [commentText, setCommentText] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [loadingComments, setLoadingComments] =
    useState(true);

  const [addingComment, setAddingComment] =
    useState(false);

  const fetchTask =
    useCallback(
      async () => {
        try {
          setLoading(true);

          const token =
            await SecureStore.getItemAsync(
              'token'
            );

          if (!token) {
            Alert.alert(
              'Hata',
              'Oturum bulunamadı.'
            );
            router.replace('/');
            return;
          }

          if (!boardId || !taskId) {
            Alert.alert(
              'Hata',
              'Görev bilgileri bulunamadı.'
            );
            return;
          }

          const response =
            await fetch(
              `https://task-management-app-xc7f.onrender.com/tasks/board/${boardId}`,
              {
                method: 'GET',
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            Alert.alert(
              'Hata',
              data.message ||
                'Görev alınamadı.'
            );
            return;
          }

          const selectedTask =
            data.tasks.find(
              (item: Task) =>
                item.id ===
                Number(taskId)
            );

          if (!selectedTask) {
            Alert.alert(
              'Hata',
              'Görev bulunamadı.'
            );
            return;
          }

          setTask(
            selectedTask
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
      },
      [
        boardId,
        taskId,
        router,
      ]
    );

  const fetchComments =
    useCallback(
      async () => {
        try {
          setLoadingComments(true);

          const token =
            await SecureStore.getItemAsync(
              'token'
            );

          if (!token) {
            return;
          }

          if (!taskId) {
            return;
          }

          const response =
            await fetch(
              `https://task-management-app-xc7f.onrender.com/comments/task/${taskId}`,
              {
                method: 'GET',
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            Alert.alert(
              'Hata',
              data.message ||
                'Yorumlar alınamadı.'
            );
            return;
          }

          setComments(
            data.comments || []
          );
        } catch (error) {
          console.error(error);

          Alert.alert(
            'Bağlantı hatası',
            'Yorumlar alınamadı.'
          );
        } finally {
          setLoadingComments(false);
        }
      },
      [taskId]
    );

  useFocusEffect(
    useCallback(() => {
      fetchTask();
      fetchComments();
    }, [
      fetchTask,
      fetchComments,
    ])
  );

  const addComment = async () => {
    const trimmedComment =
      commentText.trim();

    if (!trimmedComment) {
      Alert.alert(
        'Hata',
        'Yorum boş bırakılamaz.'
      );
      return;
    }

    if (
      trimmedComment.length >
      1000
    ) {
      Alert.alert(
        'Hata',
        'Yorum en fazla 1000 karakter olabilir.'
      );
      return;
    }

    try {
      setAddingComment(true);

      const token =
        await SecureStore.getItemAsync(
          'token'
        );

      if (!token) {
        Alert.alert(
          'Hata',
          'Oturum bulunamadı.'
        );
        return;
      }

      if (!taskId) {
        Alert.alert(
          'Hata',
          'Görev bulunamadı.'
        );
        return;
      }

      const response =
        await fetch(
          `https://task-management-app-xc7f.onrender.com/comments/task/${taskId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
              Authorization:
                `Bearer ${token}`,
            },
            body: JSON.stringify({
              content:
                trimmedComment,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        Alert.alert(
          'Hata',
          data.message ||
            'Yorum eklenemedi.'
        );
        return;
      }

      setComments(
        (previous) => [
          ...previous,
          data.comment,
        ]
      );

      setCommentText('');
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Bağlantı hatası',
        'Yorum eklenemedi.'
      );
    } finally {
      setAddingComment(false);
    }
  };

  const deleteComment = async (
    commentId: number
  ) => {
    try {
      const token =
        await SecureStore.getItemAsync(
          'token'
        );

      if (!token) {
        Alert.alert(
          'Hata',
          'Oturum bulunamadı.'
        );
        return;
      }

      const response =
        await fetch(
          `https://task-management-app-xc7f.onrender.com/comments/${commentId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        Alert.alert(
          'Hata',
          data.message ||
            'Yorum silinemedi.'
        );
        return;
      }

      setComments(
        (previous) =>
          previous.filter(
            (comment) =>
              comment.id !==
              commentId
          )
      );
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Bağlantı hatası',
        'Yorum silinemedi.'
      );
    }
  };

  const confirmDeleteComment = (
    commentId: number
  ) => {
    Alert.alert(
      'Yorumu Sil',
      'Bu yorumu silmek istediğine emin misin?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () =>
            deleteComment(
              commentId
            ),
        },
      ]
    );
  };

  const deleteTask = async () => {
    try {
      const token =
        await SecureStore.getItemAsync(
          'token'
        );

      if (!token) {
        Alert.alert(
          'Hata',
          'Oturum bulunamadı.'
        );
        return;
      }

      const response =
        await fetch(
          `https://task-management-app-xc7f.onrender.com/tasks/${taskId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        Alert.alert(
          'Hata',
          data.message ||
            'Görev silinemedi.'
        );
        return;
      }

      Alert.alert(
        'Başarılı',
        'Görev başarıyla silindi.',
        [
          {
            text: 'Tamam',
            onPress: () =>
              router.back(),
          },
        ]
      );
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Bağlantı hatası',
        'Görev silinemedi.'
      );
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Görevi Sil',
      'Bu görevi silmek istediğine emin misin?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress:
            deleteTask,
        },
      ]
    );
  };

  const getPriorityText = (
    priority: string
  ) => {
    switch (priority) {
      case 'LOW':
        return 'Düşük';

      case 'MEDIUM':
        return 'Orta';

      case 'HIGH':
        return 'Yüksek';

      default:
        return priority;
    }
  };

  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleDateString(
      'tr-TR'
    );
  };

  const formatCommentDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleString(
      'tr-TR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const getAssigneeText = () => {
    if (!task?.assignee) {
      return 'Atanmamış';
    }

    return (
      task.assignee.name ||
      task.assignee.email
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text
          style={[
            styles.loadingText,
            {
              color: colors.text,
            },
          ]}
        >
          Görev yükleniyor...
        </Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <Text
          style={[
            styles.errorText,
            {
              color: colors.text,
            },
          ]}
        >
          Görev bulunamadı.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.buttonText
            }
          >
            Geri Dön
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
      contentContainerStyle={
        styles.contentContainer
      }
      showsVerticalScrollIndicator={
        true
      }
      keyboardShouldPersistTaps="handled"
    >
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
          },
        ]}
      >
        Görev Detayı
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor:
              colors.card,
          },
        ]}
      >
        <Text
          style={[
            styles.taskTitle,
            {
              color: colors.text,
            },
          ]}
        >
          {task.title}
        </Text>

        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Liste
          </Text>

          <Text
            style={[
              styles.value,
              {
                color: colors.text,
              },
            ]}
          >
            {task.list?.title ||
              'Liste bulunamadı'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Öncelik
          </Text>

          <Text
            style={[
              styles.value,
              {
                color: colors.text,
              },
            ]}
          >
            {getPriorityText(
              task.priority
            )}
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Son Tarih
          </Text>

          <Text
            style={[
              styles.value,
              {
                color: colors.text,
              },
            ]}
          >
            {task.dueDate
              ? formatDate(
                  task.dueDate
                )
              : 'Belirlenmedi'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Atanan Kişi
          </Text>

          <Text
            style={[
              styles.value,
              {
                color: colors.text,
              },
            ]}
          >
            {getAssigneeText()}
          </Text>
        </View>

        {task.description ? (
          <View
            style={
              styles.section
            }
          >
            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Açıklama
            </Text>

            <Text
              style={[
                styles.description,
                {
                  color: colors.text,
                },
              ]}
            >
              {task.description}
            </Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Görev ID
          </Text>

          <Text
            style={[
              styles.info,
              {
                color: colors.text,
              },
            ]}
          >
            {task.id}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          router.push({
            pathname:
              '/edit-task',
            params: {
              taskId:
                String(taskId),
              boardId:
                String(boardId),
            },
          })
        }
      >
        <Text
          style={
            styles.buttonText
          }
        >
          Düzenle
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={
          styles.deleteButton
        }
        onPress={
          confirmDelete
        }
      >
        <Text
          style={
            styles.buttonText
          }
        >
          Görevi Sil
        </Text>
      </TouchableOpacity>

      <View
        style={[
          styles.commentsSection,
          {
            backgroundColor:
              colors.card,
          },
        ]}
      >
        <Text
          style={[
            styles.commentsTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Yorumlar
        </Text>

        <View
          style={
            styles.commentInputContainer
          }
        >
          <TextInput
            style={[
              styles.commentInput,
              {
                color: colors.text,
                borderColor:
                  colors.border,
                backgroundColor:
                  colors.input,
              },
            ]}
            placeholder="Yorumunuzu yazın..."
            placeholderTextColor={
              colors.secondaryText
            }
            multiline
            value={commentText}
            onChangeText={
              setCommentText
            }
            maxLength={1000}
          />

          <TouchableOpacity
            style={[
              styles.commentButton,
              addingComment &&
                styles.disabledButton,
            ]}
            onPress={
              addComment
            }
            disabled={
              addingComment
            }
          >
            {addingComment ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={
                  styles.commentButtonText
                }
              >
                Yorum Ekle
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {loadingComments ? (
          <View
            style={
              styles.commentsLoading
            }
          >
            <ActivityIndicator
              size="small"
              color={
                colors.primary
              }
            />

            <Text
              style={[
                styles.commentsLoadingText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Yorumlar yükleniyor...
            </Text>
          </View>
        ) : comments.length === 0 ? (
          <Text
            style={[
              styles.noCommentsText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Henüz yorum yapılmamış.
          </Text>
        ) : (
          <View
            style={
              styles.commentsList
            }
          >
            {comments.map(
              (comment) => (
                <View
                  key={comment.id}
                  style={[
                    styles.commentCard,
                    {
                      backgroundColor:
                        colors.surface,
                      borderColor:
                        colors.border,
                    },
                  ]}
                >
                  <View
                    style={
                      styles.commentHeader
                    }
                  >
                    <View
                      style={
                        styles.commentUserContainer
                      }
                    >
                      <Text
                        style={[
                          styles.commentUser,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {comment.user
                          .name ||
                          comment.user
                            .email}
                      </Text>

                      <Text
                        style={[
                          styles.commentDate,
                          {
                            color:
                              colors.secondaryText,
                          },
                        ]}
                      >
                        {formatCommentDate(
                          comment.createdAt
                        )}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() =>
                        confirmDeleteComment(
                          comment.id
                        )
                      }
                    >
                      <Text
                        style={
                          styles.deleteCommentText
                        }
                      >
                        Sil
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text
                    style={[
                      styles.commentContent,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {comment.content}
                  </Text>
                </View>
              )
            )}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={
          styles.backButton
        }
        onPress={() =>
          router.back()
        }
      >
        <Text
          style={
            styles.buttonText
          }
        >
          Geri Dön
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  contentContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
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

  errorText: {
    fontSize: 18,
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
  },

  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },

  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
  },

  section: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  value: {
    fontSize: 16,
    fontWeight: '500',
  },

  description: {
    fontSize: 16,
    lineHeight: 22,
  },

  info: {
    fontSize: 16,
  },

  editButton: {
    backgroundColor:
      '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },

  deleteButton: {
    backgroundColor:
      '#D32F2F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },

  commentsSection: {
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
  },

  commentsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
  },

  commentInputContainer: {
    marginBottom: 20,
  },

  commentInput: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    textAlignVertical: 'top',
    marginBottom: 10,
  },

  commentButton: {
    backgroundColor:
      '#007AFF',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },

  commentButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  disabledButton: {
    opacity: 0.5,
  },

  commentsLoading: {
    alignItems: 'center',
    paddingVertical: 15,
  },

  commentsLoadingText: {
    marginTop: 8,
    fontSize: 14,
  },

  noCommentsText: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 10,
  },

  commentsList: {
    gap: 12,
  },

  commentCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },

  commentHeader: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  commentUserContainer: {
    flex: 1,
    marginRight: 10,
  },

  commentUser: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 3,
  },

  commentDate: {
    fontSize: 12,
  },

  commentContent: {
    fontSize: 15,
    lineHeight: 22,
  },

  deleteCommentText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: 'bold',
  },

  backButton: {
    backgroundColor:
      '#333',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});