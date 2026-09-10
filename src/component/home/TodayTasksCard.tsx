import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../styles/theme';

export interface HomeTask {
  id: string;
  title: string;
  time: string;
  done: boolean;
}

interface TodayTasksCardProps {
  tasks: HomeTask[];
  onToggle: (id: string) => void;
}

export function TodayTasksCard({ tasks, onToggle }: TodayTasksCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Hoje em casa</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>tutor</Text>
        </View>
      </View>

      {tasks.map((task) => (
        <Pressable
          key={task.id}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.done }}
          style={styles.taskRow}
          onPress={() => onToggle(task.id)}
        >
          <View style={[styles.checkbox, task.done && styles.checkboxDone]}>
            {task.done ? <Text style={styles.checkMark}>✓</Text> : null}
          </View>
          <View style={styles.taskText}>
            <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>
              {task.title}
            </Text>
            <Text style={styles.taskWhen}>{task.time}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radii.pill,
    backgroundColor: colors.cardMax,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkMark: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '700',
  },
  taskText: {
    flex: 1,
  },
  taskTitle: {
    ...typography.body,
    fontSize: 16,
    color: colors.textPrimary,
  },
  taskTitleDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  taskWhen: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
