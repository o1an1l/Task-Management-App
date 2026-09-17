import DateTimePicker from '@expo/ui/community/datetime-picker';

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

  assignee?: {
    id: number;
    name?: string | null;
    email: string;
  } | null;
};

type List = {
  id: number;
  title: string;
  order: number;
  boardId: number;
};

type User = {
  id: number;
  name?: string | null;
  email: string;
};

export default function EditTaskScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const {
    taskId,
    boardId,
  } = useLocalSearchParams<{
    taskId: string;
    boardId: string;
  }>();

  const [task, setTask] =
    useState<Task | null>(null);

  const [lists, setLists] =
    useState<List[]>([]);

  const [users, setUsers] =
    useState<User[]>([]);

  const [title, setTitle] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [
    selectedListId,
    setSelectedListId,
  ] = useState<number | null>(null);

  const [priority, setPriority] =
    useState('MEDIUM');

  const [dueDate, setDueDate] =
    useState<Date | null>(null);

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [
    selectedAssigneeId,
    setSelectedAssigneeId,
  ] = useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const fetchData = async () => {
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

      const taskResponse =
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

      const taskData =
        await taskResponse.json();

      if (!taskResponse.ok) {
        Alert.alert(
          'Hata',
          taskData.message ||
            'Görev alınamadı.'
        );
        return;
      }

      const selectedTask =
        taskData.tasks.find(
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

      const listResponse =
        await fetch(
          `https://task-management-app-xc7f.onrender.com/lists/board/${boardId}`,
          {
            method: 'GET',
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const listData =
        await listResponse.json();

      if (!listResponse.ok) {
        Alert.alert(
          'Hata',
          listData.message ||
            'Listeler alınamadı.'
        );
        return;
      }

      const sortedLists =
        [...listData.lists].sort(
          (
            a: List,
            b: List
          ) =>
            a.order - b.order
        );

      const userResponse =
        await fetch(
          'https://task-management-app-xc7f.onrender.com/auth/users',
          {
            method: 'GET',
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const userData =
        await userResponse.json();

      if (!userResponse.ok) {
        Alert.alert(
          'Hata',
          userData.message ||
            'Kullanıcılar alınamadı.'
        );
        return;
      }

      setTask(selectedTask);
      setLists(sortedLists);
      setUsers(
        userData.users || []
      );

      setTitle(
        selectedTask.title
      );

      setDescription(
        selectedTask.description ||
          ''
      );

      if (
        selectedTask.listId
      ) {
        setSelectedListId(
          selectedTask.listId
        );
      } else if (
        sortedLists.length > 0
      ) {
        setSelectedListId(
          sortedLists[0].id
        );
      }

      setPriority(
        selectedTask.priority ||
          'MEDIUM'
      );

      if (
        selectedTask.dueDate
      ) {
        setDueDate(
          new Date(
            selectedTask.dueDate
          )
        );
      } else {
        setDueDate(null);
      }

      if (
        selectedTask.assignee
      ) {
        setSelectedAssigneeId(
          selectedTask.assignee.id
        );
      } else {
        setSelectedAssigneeId(
          null
        );
      }
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Bağlantı hatası',
        'Backend sunucusuna bağlanamadı.'
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [taskId, boardId])
  );

  const handleDateChange = (
    event: any,
    selectedDate: Date
  ) => {
    setShowDatePicker(false);

    const today = new Date();
    today.setHours(
      0,
      0,
      0,
      0
    );

    const selectedDay =
      new Date(selectedDate);

    selectedDay.setHours(
      0,
      0,
      0,
      0
    );

    if (selectedDay < today) {
      Alert.alert(
        'Geçersiz tarih',
        'Geçmiş bir tarih seçemezsiniz.'
      );
      return;
    }

    setDueDate(selectedDate);
  };

  const updateTask = async () => {
    const trimmedTitle =
      title.trim();

    const trimmedDescription =
      description.trim();

    if (trimmedTitle.length < 2) {
      Alert.alert(
        'Hata',
        'Görev başlığı en az 2 karakter olmalıdır.'
      );
      return;
    }

    if (trimmedTitle.length > 150) {
      Alert.alert(
        'Hata',
        'Görev başlığı en fazla 150 karakter olabilir.'
      );
      return;
    }

    if (
      trimmedDescription.length >
      1000
    ) {
      Alert.alert(
        'Hata',
        'Görev açıklaması en fazla 1000 karakter olabilir.'
      );
      return;
    }

    if (!selectedListId) {
      Alert.alert(
        'Hata',
        'Lütfen bir liste seçin.'
      );
      return;
    }

    try {
      setSaving(true);

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
            method: 'PUT',
            headers: {
              'Content-Type':
                'application/json',
              Authorization:
                `Bearer ${token}`,
            },
            body: JSON.stringify({
              title:
                trimmedTitle,
              description:
                trimmedDescription,
              listId:
                selectedListId,
              priority,
              dueDate: dueDate
                ? dueDate.toISOString()
                : null,
              assigneeId:
                selectedAssigneeId,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        Alert.alert(
          'Hata',
          data.message ||
            'Görev güncellenemedi.'
        );
        return;
      }

      Alert.alert(
        'Başarılı',
        'Görev başarıyla güncellendi.',
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
        'Backend sunucusuna bağlanamadı.'
      );
    } finally {
      setSaving(false);
    }
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
            style={styles.buttonText}
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
        Görevi Düzenle
      </Text>

      <Text
        style={[
          styles.label,
          {
            color: colors.text,
          },
        ]}
      >
        Görev Adı
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor:
              colors.border,
            backgroundColor:
              colors.input,
          },
        ]}
        value={title}
        onChangeText={setTitle}
        placeholder="Görev adı"
        placeholderTextColor={
          colors.secondaryText
        }
        maxLength={150}
      />

      <Text
        style={[
          styles.label,
          {
            color: colors.text,
          },
        ]}
      >
        Açıklama
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.descriptionInput,
          {
            color: colors.text,
            borderColor:
              colors.border,
            backgroundColor:
              colors.input,
          },
        ]}
        value={description}
        onChangeText={
          setDescription
        }
        placeholder="Görev açıklaması"
        placeholderTextColor={
          colors.secondaryText
        }
        multiline
        maxLength={1000}
      />

      <Text
        style={[
          styles.label,
          {
            color: colors.text,
          },
        ]}
      >
        Liste
      </Text>

      {lists.length === 0 ? (
        <Text
          style={[
            styles.noListText,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          Bu panoda henüz liste bulunmuyor.
        </Text>
      ) : (
        <View
          style={
            styles.listContainer
          }
        >
          {lists.map((list) => (
            <TouchableOpacity
              key={list.id}
              style={[
                styles.listButton,
                {
                  borderColor:
                    colors.border,
                },
                selectedListId ===
                  list.id &&
                  styles.selectedList,
              ]}
              onPress={() =>
                setSelectedListId(
                  list.id
                )
              }
            >
              <Text
                style={[
                  styles.listButtonText,
                  {
                    color:
                      colors.text,
                  },
                  selectedListId ===
                    list.id &&
                    styles.selectedListText,
                ]}
              >
                {list.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text
        style={[
          styles.label,
          {
            color: colors.text,
          },
        ]}
      >
        Öncelik
      </Text>

      <View
        style={
          styles.priorityContainer
        }
      >
        <TouchableOpacity
          style={[
            styles.priorityButton,
            {
              borderColor:
                colors.border,
            },
            priority ===
              'LOW' &&
              styles.selectedPriority,
          ]}
          onPress={() =>
            setPriority('LOW')
          }
        >
          <Text
            style={[
              styles.priorityText,
              {
                color:
                  colors.text,
              },
              priority ===
                'LOW' &&
                styles.selectedPriorityText,
            ]}
          >
            Düşük
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.priorityButton,
            {
              borderColor:
                colors.border,
            },
            priority ===
              'MEDIUM' &&
              styles.selectedPriority,
          ]}
          onPress={() =>
            setPriority('MEDIUM')
          }
        >
          <Text
            style={[
              styles.priorityText,
              {
                color:
                  colors.text,
              },
              priority ===
                'MEDIUM' &&
                styles.selectedPriorityText,
            ]}
          >
            Orta
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.priorityButton,
            {
              borderColor:
                colors.border,
            },
            priority ===
              'HIGH' &&
              styles.selectedPriority,
          ]}
          onPress={() =>
            setPriority('HIGH')
          }
        >
          <Text
            style={[
              styles.priorityText,
              {
                color:
                  colors.text,
              },
              priority ===
                'HIGH' &&
                styles.selectedPriorityText,
            ]}
          >
            Yüksek
          </Text>
        </TouchableOpacity>
      </View>

      <Text
        style={[
          styles.label,
          {
            color: colors.text,
          },
        ]}
      >
        Son Tarih
      </Text>

      <TouchableOpacity
        style={[
          styles.dateButton,
          {
            borderColor:
              colors.border,
            backgroundColor:
              colors.input,
          },
        ]}
        onPress={() =>
          setShowDatePicker(true)
        }
      >
        <Text
          style={[
            styles.dateButtonText,
            {
              color:
                colors.text,
            },
          ]}
        >
          {dueDate
            ? dueDate.toLocaleDateString(
                'tr-TR'
              )
            : 'Son tarih seçin (isteğe bağlı)'}
        </Text>
      </TouchableOpacity>

      {dueDate ? (
        <TouchableOpacity
          style={
            styles.clearDateButton
          }
          onPress={() =>
            setDueDate(null)
          }
        >
          <Text style={styles.clearDateText}>
            Son tarihi kaldır
          </Text>
        </TouchableOpacity>
      ) : null}

      {showDatePicker ? (
        <DateTimePicker
          value={
            dueDate || new Date()
          }
          mode="date"
          presentation="dialog"
          minimumDate={
            new Date()
          }
          onValueChange={
            handleDateChange
          }
          onDismiss={() =>
            setShowDatePicker(false)
          }
        />
      ) : null}

      <Text
        style={[
          styles.label,
          {
            color: colors.text,
          },
        ]}
      >
        Atanan Kişi
      </Text>

      <TouchableOpacity
        style={[
          styles.assigneeButton,
          {
            borderColor:
              colors.border,
          },
          selectedAssigneeId ===
            null &&
            styles.selectedAssignee,
        ]}
        onPress={() =>
          setSelectedAssigneeId(null)
        }
      >
        <Text
          style={[
            styles.assigneeText,
            {
              color:
                colors.text,
            },
            selectedAssigneeId ===
              null &&
              styles.selectedAssigneeText,
          ]}
        >
          Atanmamış
        </Text>
      </TouchableOpacity>

      {users.length === 0 ? (
        <Text
          style={[
            styles.noUserText,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          Kayıtlı kullanıcı bulunmuyor.
        </Text>
      ) : (
        <View
          style={
            styles.userContainer
          }
        >
          {users.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={[
                styles.assigneeButton,
                {
                  borderColor:
                    colors.border,
                },
                selectedAssigneeId ===
                  user.id &&
                  styles.selectedAssignee,
              ]}
              onPress={() =>
                setSelectedAssigneeId(
                  user.id
                )
              }
            >
              <Text
                style={[
                  styles.assigneeText,
                  {
                    color:
                      colors.text,
                  },
                  selectedAssigneeId ===
                    user.id &&
                    styles.selectedAssigneeText,
                ]}
              >
                {user.name ||
                  user.email}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.saveButton,
          (saving ||
            lists.length === 0) &&
            styles.disabledButton,
        ]}
        onPress={updateTask}
        disabled={
          saving ||
          lists.length === 0
        }
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            style={styles.buttonText}
          >
            Değişiklikleri Kaydet
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() =>
          router.back()
        }
        disabled={saving}
      >
        <Text
          style={styles.buttonText}
        >
          İptal
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
    paddingBottom: 30,
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
    marginBottom: 30,
  },

  label: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },

  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },

  listContainer: {
    gap: 10,
    marginBottom: 25,
  },

  listButton: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
  },

  selectedList: {
    backgroundColor:
      '#007AFF',
    borderColor:
      '#007AFF',
  },

  listButtonText: {
    fontSize: 15,
  },

  selectedListText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  priorityContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  priorityButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },

  selectedPriority: {
    backgroundColor:
      '#007AFF',
    borderColor:
      '#007AFF',
  },

  priorityText: {
    fontSize: 15,
  },

  selectedPriorityText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  dateButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
  },

  dateButtonText: {
    fontSize: 15,
  },

  clearDateButton: {
    alignSelf: 'flex-start',
    marginBottom: 15,
  },

  clearDateText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: 'bold',
  },

  assigneeButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
  },

  selectedAssignee: {
    backgroundColor:
      '#007AFF',
    borderColor:
      '#007AFF',
  },

  assigneeText: {
    fontSize: 15,
    textAlign: 'center',
  },

  selectedAssigneeText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  userContainer: {
    marginBottom: 20,
  },

  noUserText: {
    marginBottom: 20,
  },

  noListText: {
    marginBottom: 25,
    fontSize: 15,
  },

  saveButton: {
    backgroundColor:
      '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
  },

  disabledButton: {
    opacity: 0.5,
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