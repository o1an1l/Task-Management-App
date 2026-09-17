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

type List = {
  id: number;
  title: string;
  order: number;
  createdAt: string;
  boardId: number;
};

type User = {
  id: number;
  name?: string | null;
  email: string;
};

export default function CreateTaskScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const { boardId } =
    useLocalSearchParams<{
      boardId?: string;
    }>();

  const [lists, setLists] =
    useState<List[]>([]);

  const [
    selectedListId,
    setSelectedListId,
  ] = useState<number | null>(null);

  const [users, setUsers] =
    useState<User[]>([]);

  const [
    selectedAssigneeId,
    setSelectedAssigneeId,
  ] = useState<number | null>(null);

  const [title, setTitle] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [priority, setPriority] =
    useState('MEDIUM');

  const [dueDate, setDueDate] =
    useState<Date | null>(null);

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [loadingLists, setLoadingLists] =
    useState(true);

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const fetchLists = useCallback(
    async () => {
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
          router.replace('/');
          return;
        }

        if (!boardId) {
          Alert.alert(
            'Hata',
            'Pano bulunamadı.'
          );
          return;
        }

        const response =
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

        const data =
          await response.json();

        if (!response.ok) {
          Alert.alert(
            'Hata',
            data.message ||
              'Kolonlar alınamadı.'
          );
          return;
        }

        const sortedLists =
          [...data.lists].sort(
            (
              a: List,
              b: List
            ) =>
              a.order - b.order
          );

        setLists(sortedLists);

        if (
          sortedLists.length >
          0
        ) {
          setSelectedListId(
            sortedLists[0].id
          );
        }
      } catch (error) {
        console.error(error);

        Alert.alert(
          'Bağlantı hatası',
          'Backend sunucusuna bağlanılamadı.'
        );
      } finally {
        setLoadingLists(false);
      }
    },
    [boardId, router]
  );

  const fetchUsers =
    useCallback(async () => {
      try {
        const token =
          await SecureStore.getItemAsync(
            'token'
          );

        if (!token) {
          return;
        }

        const response =
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

        const data =
          await response.json();

        if (!response.ok) {
          Alert.alert(
            'Hata',
            data.message ||
              'Kullanıcılar alınamadı.'
          );
          return;
        }

        setUsers(
          data.users || []
        );
      } catch (error) {
        console.error(error);

        Alert.alert(
          'Bağlantı hatası',
          'Kullanıcılar alınamadı.'
        );
      } finally {
        setLoadingUsers(false);
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLists();
      fetchUsers();
    }, [fetchLists, fetchUsers])
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

  const createTask = async () => {
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

    if (!boardId) {
      Alert.alert(
        'Hata',
        'Pano bulunamadı.'
      );
      return;
    }

    if (
      selectedListId === null
    ) {
      Alert.alert(
        'Hata',
        'Lütfen bir kolon seçin.'
      );
      return;
    }

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

      const response =
        await fetch(
          'https://task-management-app-xc7f.onrender.com/tasks',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
              Authorization:
                `Bearer ${token}`,
            },
            body: JSON.stringify({
              boardId:
                Number(boardId),
              listId:
                selectedListId,
              title:
                trimmedTitle,
              description:
                trimmedDescription,
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
          'Görev oluşturulamadı',
          data.message ||
            'Bir hata oluştu.'
        );
        return;
      }

      Alert.alert(
        'Başarılı',
        'Görev başarıyla oluşturuldu.',
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
        'Backend sunucusuna bağlanılamadı.'
      );
    } finally {
      setLoading(false);
    }
  };

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
        Yeni Görev Oluştur
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
        placeholder="Görev başlığı girin"
        placeholderTextColor={
          colors.secondaryText
        }
        value={title}
        onChangeText={setTitle}
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
        placeholder="Görev açıklaması (isteğe bağlı)"
        placeholderTextColor={
          colors.secondaryText
        }
        multiline
        value={description}
        onChangeText={setDescription}
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
        Kolon
      </Text>

      {loadingLists ? (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.listLoading}
        />
      ) : lists.length === 0 ? (
        <Text
          style={[
            styles.emptyText,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          Bu panoda kolon bulunmuyor.
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
                  styles.listText,
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
            priority === 'LOW' &&
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
                color: colors.text,
              },
              priority === 'LOW' &&
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
            priority === 'MEDIUM' &&
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
                color: colors.text,
              },
              priority === 'MEDIUM' &&
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
            priority === 'HIGH' &&
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
                color: colors.text,
              },
              priority === 'HIGH' &&
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
              color: colors.text,
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
              color: colors.text,
            },
            selectedAssigneeId ===
              null &&
              styles.selectedAssigneeText,
          ]}
        >
          Atanmamış
        </Text>
      </TouchableOpacity>

      {loadingUsers ? (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.userLoading}
        />
      ) : users.length === 0 ? (
        <Text
          style={[
            styles.emptyText,
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
        style={styles.createButton}
        onPress={createTask}
        disabled={
          loading ||
          loadingLists ||
          loadingUsers
        }
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.createButtonText}>
            Görev Oluştur
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text
          style={[
            styles.cancelButtonText,
            {
              color: colors.primary,
            },
          ]}
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
    padding: 25,
    paddingTop: 60,
    paddingBottom: 30,
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

  listContainer: {
    marginBottom: 20,
  },

  listButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
  },

  selectedList: {
    backgroundColor:
      '#007AFF',
    borderColor:
      '#007AFF',
  },

  listText: {
    fontSize: 15,
    textAlign: 'center',
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

  userLoading: {
    marginBottom: 20,
  },

  listLoading: {
    marginBottom: 20,
  },

  emptyText: {
    marginBottom: 20,
  },

  createButton: {
    height: 55,
    backgroundColor:
      '#007AFF',
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
    fontSize: 16,
  },
});