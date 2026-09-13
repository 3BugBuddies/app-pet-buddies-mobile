import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';
import type { CareTask } from '../../model/care';

interface TaskListCardProps {
  tasks: CareTask[];
  onToggle: (id: string) => void;
  children?: React.ReactNode;
}

export function TaskListCard({ tasks, onToggle, children }: TaskListCardProps) {
  return (
    <View style={styles.card}>
      {tasks.map((task, index) => (
        <View key={task.id}>
          <TouchableOpacity
            accessibilityRole="checkbox"
            accessibilityState={{ checked: task.completed }}
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => onToggle(task.id)}
          >
            <View style={[styles.checkbox, task.completed && styles.checkboxDone]}>
              {task.completed ? <Feather name="check" size={16} color={colors.textLight} /> : null}
            </View>
            <View style={styles.textBlock}>
              <Text style={[styles.title, task.completed && styles.titleDone]}>{task.title}</Text>
              <Text style={styles.description}>
                {task.time} · {task.description}
              </Text>
            </View>
          </TouchableOpacity>
          {/* {index < tasks.length - 1 ? <View style={styles.divider} /> : null} */}
        </View>
      ))}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 72,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  titleDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
