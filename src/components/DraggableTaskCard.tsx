import { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

import Animated, {
  runOnJS,
  scrollTo,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  order: number;
  createdAt: string;
  boardId: number;
  listId?: number | null;
};

type Props = {
  task: Task;

  onPress: () => void;

  onDrop: (
    task: Task,
    absoluteX: number,
    absoluteY: number,
    scrollX: number
  ) => void;

  setDragging: (value: boolean) => void;

  horizontalScrollRef: any;
  scrollX: any;

  onCardLayout: (
    taskId: number,
    y: number,
    height: number
  ) => void;
};

export default function DraggableTaskCard({
  task,
  onPress,
  onDrop,
  setDragging,
  horizontalScrollRef,
  scrollX,
  onCardLayout,
}: Props) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const startScrollX = useSharedValue(0);

  const cardRef = useRef<any>(null);

  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    isDragging.value = false;
    startScrollX.value = 0;
  }, [task.id]);

  const measureCard = () => {
    if (!cardRef.current) {
      return;
    }

    cardRef.current.measureInWindow(
      (
        _x: number,
        y: number,
        _width: number,
        height: number
      ) => {
        onCardLayout(
          task.id,
          y,
          height
        );
      }
    );
  };

  const getPriorityText = () => {
    switch (task.priority) {
      case 'LOW':
        return 'DÜŞÜK';

      case 'HIGH':
        return 'YÜKSEK';

      case 'MEDIUM':
      default:
        return 'ORTA';
    }
  };

  const getPriorityStyle = () => {
    switch (task.priority) {
      case 'LOW':
        return styles.lowPriority;

      case 'HIGH':
        return styles.highPriority;

      case 'MEDIUM':
      default:
        return styles.mediumPriority;
    }
  };

  const getPriorityTextStyle = () => {
    switch (task.priority) {
      case 'MEDIUM':
        return styles.mediumPriorityText;

      case 'LOW':
      case 'HIGH':
      default:
        return styles.lightPriorityText;
    }
  };

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(300)

    .onBegin(() => {
      isDragging.value = true;

      startScrollX.value =
        scrollX.value;

      runOnJS(setDragging)(true);
    })

    .onUpdate((event) => {
      translateX.value =
        event.translationX +
        (scrollX.value -
          startScrollX.value);

      translateY.value =
        event.translationY;

      const screenWidth = 393;
      const edgeThreshold = 70;
      const scrollStep = 8;

      if (
        event.absoluteX >
        screenWidth -
          edgeThreshold
      ) {
        const nextScrollX =
          scrollX.value +
          scrollStep;

        scrollX.value =
          nextScrollX;

        scrollTo(
          horizontalScrollRef,
          nextScrollX,
          0,
          false
        );
      } else if (
        event.absoluteX <
        edgeThreshold
      ) {
        const nextScrollX =
          Math.max(
            0,
            scrollX.value -
              scrollStep
          );

        scrollX.value =
          nextScrollX;

        scrollTo(
          horizontalScrollRef,
          nextScrollX,
          0,
          false
        );
      }
    })

    .onFinalize((event) => {
      const dropX =
        event.absoluteX;

      const dropY =
        event.absoluteY;

      const finalScrollX =
        scrollX.value;

      isDragging.value = false;

      runOnJS(onDrop)(
        task,
        dropX,
        dropY,
        finalScrollX
      );

      runOnJS(setDragging)(false);

      translateX.value =
        withSpring(0);

      translateY.value =
        withSpring(0);
    });

  const animatedStyle =
    useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateX:
              translateX.value,
          },
          {
            translateY:
              translateY.value,
          },
          {
            scale:
              isDragging.value
                ? 1.05
                : 1,
          },
        ],

        zIndex:
          isDragging.value
            ? 100
            : 1,

        elevation:
          isDragging.value
            ? 10
            : 0,
      };
    });

  return (
    <GestureDetector
      gesture={panGesture}
    >
      <Animated.View
        ref={cardRef}
        onLayout={measureCard}
        style={[
          styles.wrapper,
          animatedStyle,
        ]}
      >
        <TouchableOpacity
          style={styles.taskCard}
          activeOpacity={0.8}
          onPress={onPress}
        >
          <Text
            style={styles.taskText}
          >
            {task.title}
          </Text>

          {task.description ? (
            <Text
              style={
                styles.taskDescription
              }
            >
              {task.description}
            </Text>
          ) : null}

          <Text
            style={[
              styles.priorityBadge,
              getPriorityStyle(),
              getPriorityTextStyle(),
            ]}
          >
            {getPriorityText()}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },

  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 10,
    minHeight: 80,
  },

  taskText: {
    fontSize: 15,
    fontWeight: '500',
  },

  taskDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 5,
  },

  priorityBadge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 'bold',
  },

  lowPriority: {
    backgroundColor: '#34C759',
  },

  mediumPriority: {
    backgroundColor: '#FFC107',
  },

  highPriority: {
    backgroundColor: '#D32F2F',
  },

  lightPriorityText: {
    color: '#fff',
  },

  mediumPriorityText: {
    color: '#222',
  },
});