import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Task = {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  createdAt: string;
  boardId: number;
};

export default function EditTaskScreen() {
  const router = useRouter();

  const { taskId, boardId } = useLocalSearchParams<{
    taskId: string;
    boardId: string;
  }>();

  const [task, setTask] = useState<Task | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TODO");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchTask = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        Alert.alert("Hata", "Oturum bulunamadı.");
        router.replace("/");
        return;
      }

      if (!boardId || !taskId) {
        Alert.alert("Hata", "Görev bilgileri bulunamadı.");
        return;
      }

      const response = await fetch(
        `http://10.0.2.2:3000/tasks/board/${boardId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Hata",
          data.message || "Görev alınamadı."
        );
        return;
      }

      const selectedTask = data.tasks.find(
        (item: Task) => item.id === Number(taskId)
      );

      if (!selectedTask) {
        Alert.alert("Hata", "Görev bulunamadı.");
        return;
      }

      setTask(selectedTask);
      setTitle(selectedTask.title);
      setDescription(selectedTask.description || "");
      setStatus(selectedTask.status);
    } catch (error) {
      console.error(error);

      Alert.alert(
        "Bağlantı hatası",
        "Backend sunucusuna bağlanılamadı."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, []);

  const updateTask = async () => {
    if (!title.trim()) {
      Alert.alert("Hata", "Görev adı boş bırakılamaz.");
      return;
    }

    try {
      setSaving(true);

      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        Alert.alert("Hata", "Oturum bulunamadı.");
        return;
      }

      const response = await fetch(
        `http://10.0.2.2:3000/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            status: status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Hata",
          data.message || "Görev güncellenemedi."
        );
        return;
      }

      Alert.alert(
        "Başarılı",
        "Görev başarıyla güncellendi.",
        [
          {
            text: "Tamam",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error(error);

      Alert.alert(
        "Bağlantı hatası",
        "Backend sunucusuna bağlanılamadı."
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
          Görev yükleniyor...
        </Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Görev bulunamadı.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>
            Geri Dön
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Görevi Düzenle
      </Text>

      <Text style={styles.label}>
        Görev Adı
      </Text>

      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Görev adı"
      />

      <Text style={styles.label}>
        Açıklama
      </Text>

      <TextInput
        style={[styles.input, styles.descriptionInput]}
        value={description}
        onChangeText={setDescription}
        placeholder="Görev açıklaması"
        multiline
      />

      <Text style={styles.label}>
        Durum
      </Text>

      <View style={styles.statusContainer}>
        <TouchableOpacity
          style={[
            styles.statusButton,
            status === "TODO" && styles.selectedStatus,
          ]}
          onPress={() => setStatus("TODO")}
        >
          <Text
            style={[
              styles.statusButtonText,
              status === "TODO" &&
                styles.selectedStatusText,
            ]}
          >
            Yapılacak
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusButton,
            status === "IN_PROGRESS" &&
              styles.selectedStatus,
          ]}
          onPress={() => setStatus("IN_PROGRESS")}
        >
          <Text
            style={[
              styles.statusButtonText,
              status === "IN_PROGRESS" &&
                styles.selectedStatusText,
            ]}
          >
            Devam Ediyor
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusButton,
            status === "DONE" && styles.selectedStatus,
          ]}
          onPress={() => setStatus("DONE")}
        >
          <Text
            style={[
              styles.statusButtonText,
              status === "DONE" &&
                styles.selectedStatusText,
            ]}
          >
            Tamamlandı
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={updateTask}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            Değişiklikleri Kaydet
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          İptal
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60,
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
    marginBottom: 30,
  },

  label: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#fff",
  },

  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
  },

  statusContainer: {
    gap: 10,
    marginBottom: 25,
  },

  statusButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 13,
    alignItems: "center",
  },

  selectedStatus: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },

  statusButtonText: {
    fontSize: 15,
    color: "#333",
  },

  selectedStatusText: {
    color: "#fff",
    fontWeight: "bold",
  },

  saveButton: {
    backgroundColor: "#007AFF",
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