import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

export default function TaskDetailScreen() {
  const router = useRouter();

  const { taskId, boardId } =
    useLocalSearchParams<{
      taskId: string;
      boardId: string;
    }>();

  const [task, setTask] =
    useState<Task | null>(null);

  const [loading, setLoading] =
    useState(true);

  const fetchTask = useCallback(
    async () => {
      try {
        setLoading(true);

        const token =
          await SecureStore.getItemAsync(
            "token"
          );

        if (!token) {
          Alert.alert(
            "Hata",
            "Oturum bulunamadı."
          );
          router.replace("/");
          return;
        }

        if (!boardId || !taskId) {
          Alert.alert(
            "Hata",
            "Görev bilgileri bulunamadı."
          );
          return;
        }

        const response =
          await fetch(
            `http://192.168.1.126:3000/tasks/board/${boardId}`,
            {
              method: "GET",
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
            "Hata",
            data.message ||
              "Görev alınamadı."
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
            "Hata",
            "Görev bulunamadı."
          );
          return;
        }

        setTask(selectedTask);
      } catch (error) {
        console.error(error);

        Alert.alert(
          "Bağlantı hatası",
          "Backend sunucusuna bağlanılamadı."
        );
      } finally {
        setLoading(false);
      }
    },
    [boardId, taskId, router]
  );

  useFocusEffect(
    useCallback(() => {
      fetchTask();
    }, [fetchTask])
  );

  const deleteTask = async () => {
    try {
      const token =
        await SecureStore.getItemAsync(
          "token"
        );

      if (!token) {
        Alert.alert(
          "Hata",
          "Oturum bulunamadı."
        );
        return;
      }

      const response =
        await fetch(
          `http://192.168.1.126:3000/tasks/${taskId}`,
          {
            method: "DELETE",
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
          "Hata",
          data.message ||
            "Görev silinemedi."
        );
        return;
      }

      Alert.alert(
        "Başarılı",
        "Görev başarıyla silindi.",
        [
          {
            text: "Tamam",
            onPress: () =>
              router.back(),
          },
        ]
      );
    } catch (error) {
      console.error(error);

      Alert.alert(
        "Bağlantı hatası",
        "Backend sunucusuna bağlanamadı."
      );
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Görevi Sil",
      "Bu görevi silmek istediğine emin misin?",
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: deleteTask,
        },
      ]
    );
  };

  const getPriorityText = (
    priority: string
  ) => {
    switch (priority) {
      case "LOW":
        return "Düşük";

      case "MEDIUM":
        return "Orta";

      case "HIGH":
        return "Yüksek";

      default:
        return priority;
    }
  };

  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleDateString("tr-TR");
  };

  const getAssigneeText = () => {
    if (!task?.assignee) {
      return "Atanmamış";
    }

    return (
      task.assignee.name ||
      task.assignee.email
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text
          style={
            styles.loadingText
          }
        >
          Görev yükleniyor...
        </Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.center}>
        <Text
          style={
            styles.errorText
          }
        >
          Görev bulunamadı.
        </Text>

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
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contentContainer
      }
    >
      <Text style={styles.title}>
        Görev Detayı
      </Text>

      <View style={styles.card}>
        <Text
          style={
            styles.taskTitle
          }
        >
          {task.title}
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>
            Liste
          </Text>

          <Text style={styles.value}>
            {task.list?.title ||
              "Liste bulunamadı"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Öncelik
          </Text>

          <Text style={styles.value}>
            {getPriorityText(
              task.priority
            )}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Son Tarih
          </Text>

          <Text style={styles.value}>
            {task.dueDate
              ? formatDate(
                  task.dueDate
                )
              : "Belirlenmedi"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Atanan Kişi
          </Text>

          <Text style={styles.value}>
            {getAssigneeText()}
          </Text>
        </View>

        {task.description ? (
          <View style={styles.section}>
            <Text
              style={styles.label}
            >
              Açıklama
            </Text>

            <Text
              style={
                styles.description
              }
            >
              {task.description}
            </Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.label}>
            Görev ID
          </Text>

          <Text style={styles.info}>
            {task.id}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={
          styles.editButton
        }
        onPress={() =>
          router.push({
            pathname:
              "/edit-task",
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
    backgroundColor: "#fff",
  },

  contentContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "bold",
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
  },

  taskTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 25,
  },

  section: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 6,
  },

  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#222",
  },

  description: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },

  info: {
    fontSize: 16,
    color: "#333",
  },

  editButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  deleteButton: {
    backgroundColor: "#D32F2F",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  backButton: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});