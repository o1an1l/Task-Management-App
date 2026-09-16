import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import * as SecureStore from 'expo-secure-store';

import { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import DraggableTaskCard, {
  Task,
} from '../components/DraggableTaskCard';

type List = {
  id: number;
  title: string;
  order: number;
  createdAt: string;
  boardId: number;
};

type TaskLayout = {
  y: number;
  height: number;
};

const { width: SCREEN_WIDTH } =
  Dimensions.get('window');

const COLUMN_WIDTH =
  SCREEN_WIDTH * 0.88;

const COLUMN_GAP = 15;

export default function BoardDetailScreen() {
  const router = useRouter();

  const {
    boardId,
    boardName,
    description,
  } = useLocalSearchParams<{
    boardId?: string;
    boardName?: string;
    description?: string;
  }>();

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [lists, setLists] =
    useState<List[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [dragging, setDragging] =
    useState(false);

  const [taskLayouts, setTaskLayouts] =
    useState<Record<number, TaskLayout>>({});

  const horizontalScrollRef =
    useAnimatedRef<Animated.ScrollView>();

  const scrollX =
    useSharedValue(0);

  const scrollHandler =
    useAnimatedScrollHandler({
      onScroll: (event) => {
        scrollX.value =
          event.contentOffset.x;
      },
    });

  const handleCardLayout = (
    taskId: number,
    y: number,
    height: number
  ) => {
    setTaskLayouts(
      (previous) => ({
        ...previous,
        [taskId]: {
          y,
          height,
        },
      })
    );
  };

  const fetchTasks =
    useCallback(async () => {
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

        if (!boardId) {
          Alert.alert(
            'Hata',
            'Pano bulunamadı.'
          );
          return;
        }

        const response =
          await fetch(
            `http://192.168.1.126:3000/tasks/board/${boardId}`,
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
              'Görevler alınamadı.'
          );
          return;
        }

        setTasks(data.tasks);
      } catch (error) {
        console.error(error);

        Alert.alert(
          'Bağlantı hatası',
          'Backend sunucusuna bağlanılamadı.'
        );
      }
    }, [boardId]);

  const fetchLists =
    useCallback(async () => {
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

        if (!boardId) {
          Alert.alert(
            'Hata',
            'Pano bulunamadı.'
          );
          return;
        }

        const response =
          await fetch(
            `http://192.168.1.126:3000/lists/board/${boardId}`,
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
      } catch (error) {
        console.error(error);

        Alert.alert(
          'Bağlantı hatası',
          'Backend sunucusuna bağlanamadı.'
        );
      }
    }, [boardId]);

  useFocusEffect(
    useCallback(() => {
      const loadData =
        async () => {
          setLoading(true);

          await Promise.all([
            fetchTasks(),
            fetchLists(),
          ]);

          setLoading(false);
        };

      loadData();
    }, [
      fetchTasks,
      fetchLists,
    ])
  );

  const getTasksForList = (
    list: List
  ) => {
    const statusOrderMap:
      Record<string, number> = {
        TODO: 0,
        IN_PROGRESS: 1,
        DONE: 2,
      };

    return [...tasks]
      .filter((task) => {
        if (
          task.listId !== null &&
          task.listId !== undefined
        ) {
          return (
            task.listId ===
            list.id
          );
        }

        return (
          statusOrderMap[
            task.status
          ] === list.order
        );
      })
      .sort(
        (a, b) =>
          a.order - b.order
      );
  };

  const moveTask = async (
    task: Task,
    targetList: List,
    targetOrder: number
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
          `http://192.168.1.126:3000/tasks/${task.id}/move`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              listId:
                targetList.id,

              order:
                targetOrder,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        Alert.alert(
          'Hata',
          data.message ||
            'Görev taşınamadı.'
        );

        await fetchTasks();
        return;
      }

      await fetchTasks();
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Bağlantı hatası',
        'Görev taşınamadı.'
      );

      await fetchTasks();
    }
  };

  const handleDrop = async (
    task: Task,
    absoluteX: number,
    absoluteY: number,
    currentScrollX: number
  ) => {
    if (lists.length === 0) {
      return;
    }

    /*
      absoluteX:
      Parmağın ekran üzerindeki X konumu

      currentScrollX:
      Horizontal ScrollView'in kayma miktarı

      İkisini toplayarak panodaki gerçek
      X konumunu buluyoruz.
    */

    const contentX =
      absoluteX + currentScrollX;

    const relativeX =
      contentX - 20;

    let targetIndex =
      Math.floor(
        relativeX /
          (COLUMN_WIDTH +
            COLUMN_GAP)
      );

    if (targetIndex < 0) {
      targetIndex = 0;
    }

    if (
      targetIndex >=
      lists.length
    ) {
      targetIndex =
        lists.length - 1;
    }

    const targetList =
      lists[targetIndex];

    const targetTasks =
      getTasksForList(
        targetList
      );

    /*
      Sürüklenen görevi hedef listedeki
      karşılaştırmadan çıkarıyoruz.
    */

    const remainingTasks =
      targetTasks.filter(
        (targetTask) =>
          targetTask.id !==
          task.id
      );

    /*
      Görev kartlarını ekrandaki Y
      konumlarına göre sıralıyoruz.
    */

    const tasksWithLayout =
      remainingTasks
        .map((targetTask) => ({
          task: targetTask,
          layout:
            taskLayouts[
              targetTask.id
            ],
        }))
        .filter(
          (
            item
          ) =>
            item.layout !==
            undefined
        )
        .sort(
          (a, b) =>
            a.layout.y -
            b.layout.y
        );

    /*
      Varsayılan olarak görevi
      listenin sonuna koyuyoruz.
    */

    let targetOrder =
      remainingTasks.length;

    /*
      Bırakılan Y konumuna göre hangi
      kartın üstünde/önünde olduğumuzu
      buluyoruz.
    */

    for (
      let index = 0;
      index <
        tasksWithLayout.length;
      index++
    ) {
      const currentTask =
        tasksWithLayout[index];

      const taskCenterY =
        currentTask.layout.y +
        currentTask.layout.height /
          2;

      if (
        absoluteY <
        taskCenterY
      ) {
        targetOrder = index;
        break;
      }
    }

    /*
      Görev zaten aynı kolondaysa,
      eski sırası ile yeni sırası
      aynıysa gereksiz API isteği yapma.
    */

    if (
      task.listId ===
      targetList.id
    ) {
      const oldIndex =
        targetTasks.findIndex(
          (targetTask) =>
            targetTask.id ===
            task.id
        );

      if (
        oldIndex ===
        targetOrder
      ) {
        return;
      }
    }

    await moveTask(
      task,
      targetList,
      targetOrder
    );
  };

  const deleteList = async (
    listId: number
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
          `http://192.168.1.126:3000/lists/${listId}`,
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
            'Kolon silinemedi.'
        );
        return;
      }

      await Promise.all([
        fetchTasks(),
        fetchLists(),
      ]);

      Alert.alert(
        'Başarılı',
        'Kolon başarıyla silindi.'
      );
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Bağlantı hatası',
        'Kolon silinemedi.'
      );
    }
  };

  const confirmDeleteList = (
    list: List
  ) => {
    const listTasks =
      getTasksForList(list);

    const message =
      listTasks.length > 0
        ? `"${list.title}" kolonunu silmek istediğine emin misin?\n\nBu kolonu silersen, içindeki ${listTasks.length} görev de silinecek. Bu işlem geri alınamaz.`
        : `"${list.title}" kolonunu silmek istediğine emin misin?\n\nBu işlem geri alınamaz.`;

    Alert.alert(
      'Kolonu Sil',
      message,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },

        {
          text: 'Sil',
          style: 'destructive',

          onPress: () =>
            deleteList(
              list.id
            ),
        },
      ]
    );
  };

  const renderTask = (
    task: Task
  ) => (
    <DraggableTaskCard
      key={task.id}
      task={task}
      setDragging={
        setDragging
      }
      horizontalScrollRef={
        horizontalScrollRef
      }
      scrollX={scrollX}
      onPress={() =>
        router.push({
          pathname:
            '/task-details',

          params: {
            taskId:
              String(task.id),

            boardId:
              String(boardId),
          },
        })
      }
      onDrop={handleDrop}
      onCardLayout={
        handleCardLayout
      }
    />
  );

  const renderList = (
    list: List
  ) => {
    const listTasks =
      getTasksForList(list);

    return (
      <View
        key={list.id}
        style={styles.columnWrapper}
      >
        <View
          style={styles.column}
        >
          <View
            style={
              styles.columnHeader
            }
          >
            <Text
              style={
                styles.columnTitle
              }
            >
              {list.title}
            </Text>

            <View
              style={
                styles.columnButtons
              }
            >
              <TouchableOpacity
                style={
                  styles.editListButton
                }
                onPress={() =>
                  router.push({
                    pathname:
                      '/edit-list',

                    params: {
                      listId:
                        String(
                          list.id
                        ),
                    },
                  })
                }
              >
                <Text
                  style={
                    styles.editListButtonText
                  }
                >
                  Düzenle
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.deleteListButton
                }
                onPress={() =>
                  confirmDeleteList(
                    list
                  )
                }
              >
                <Text
                  style={
                    styles.deleteListButtonText
                  }
                >
                  Sil
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={
              styles.taskList
            }
          >
            {listTasks.length >
            0 ? (
              listTasks.map(
                renderTask
              )
            ) : (
              <Text
                style={
                  styles.emptyText
                }
              >
                Görev bulunmuyor.
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <GestureHandlerRootView
      style={styles.root}
    >
      <View
        style={styles.header}
      >
        <View
          style={
            styles.headerContent
          }
        >
          <Text
            style={styles.title}
          >
            {boardName ||
              'Pano'}
          </Text>

          {description ? (
            <Text
              style={
                styles.description
              }
            >
              {description}
            </Text>
          ) : null}

          <View
            style={
              styles.topButtons
            }
          >
            <TouchableOpacity
              style={
                styles.addTaskButton
              }
              onPress={() =>
                router.push({
                  pathname:
                    '/create-task',

                  params: {
                    boardId,
                  },
                })
              }
            >
              <Text
                style={
                  styles.addTaskButtonText
                }
              >
                + Yeni Görev
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.addListButton
              }
              onPress={() =>
                router.push({
                  pathname:
                    '/create-list',

                  params: {
                    boardId,
                  },
                })
              }
            >
              <Text
                style={
                  styles.addListButtonText
                }
              >
                + Yeni Kolon
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View
        style={styles.boardArea}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            style={styles.loading}
          />
        ) : lists.length ===
          0 ? (
          <Text
            style={
              styles.emptyText
            }
          >
            Bu panoda henüz
            kolon bulunmuyor.
          </Text>
        ) : (
          <Animated.ScrollView
            ref={
              horizontalScrollRef
            }
            horizontal
            scrollEnabled={
              !dragging
            }
            showsHorizontalScrollIndicator={
              true
            }
            contentContainerStyle={
              styles.horizontalContent
            }
            onScroll={
              scrollHandler
            }
            scrollEventThrottle={
              16
            }
          >
            <View
              style={
                styles.boardContainer
              }
            >
              {lists.map(
                renderList
              )}
            </View>
          </Animated.ScrollView>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor:
      '#fff',
  },

  header: {
    backgroundColor:
      '#fff',
    zIndex: 10,
  },

  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  description: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
  },

  topButtons: {
    flexDirection: 'row',
    gap: 10,
  },

  addTaskButton: {
    flex: 1,
    backgroundColor:
      '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },

  addTaskButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  addListButton: {
    flex: 1,
    backgroundColor:
      '#34C759',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },

  addListButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  boardArea: {
    flex: 1,
  },

  horizontalContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  boardContainer: {
    flexDirection: 'row',
    gap: COLUMN_GAP,
  },

  columnWrapper: {
    width: COLUMN_WIDTH,
  },

  column: {
    backgroundColor:
      '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    minHeight: 500,
  },

  columnHeader: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems:
      'center',
    marginBottom: 12,
  },

  columnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },

  columnButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  editListButton: {
    backgroundColor:
      '#007AFF',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },

  editListButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },

  deleteListButton: {
    backgroundColor:
      '#D32F2F',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },

  deleteListButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },

  taskList: {
    width: '100%',
  },

  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },

  loading: {
    marginTop: 30,
  },
});