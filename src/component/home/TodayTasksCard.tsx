import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

export interface HomeTask {
  id: string;
  title: string;
  time: string;
  done: boolean;
}

interface TodayTasksCardProps {
  tasks: HomeTask[];
}

export function TodayTasksCard({ tasks }: TodayTasksCardProps) {
  const feitas = tasks.filter((task) => task.done).length;
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Hoje em casa</Text>
        <Text style={styles.taskTime}>
          {feitas} de {tasks.length} {tasks.length === 1 ? 'feita' : 'feitas'}
        </Text>
      </View>

      {tasks.slice(0, 4).map((task) => (
        <View key={task.id} style={styles.taskRow}>
          <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]} numberOfLines={1}>
            {task.title}
          </Text>
          <Text style={styles.taskTime}>{task.time}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.primary,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Sora',
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  taskTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  taskTitleDone: {
    color: colors.textSecondary,
  },
  taskTime: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: colors.textSecondary,
  },
});
