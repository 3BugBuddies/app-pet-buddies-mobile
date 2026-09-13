import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

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

function taskIconName(title: string): React.ComponentProps<typeof Ionicons>['name'] {
  const t = title.toLowerCase();
  if (t.includes('raç') || t.includes('comi') || t.includes('alim')) return 'restaurant-outline';
  if (t.includes('escov') || t.includes('pelo') || t.includes('banho')) return 'cut-outline';
  if (t.includes('brinc') || t.includes('passei')) return 'tennisball-outline';
  if (t.includes('remé') || t.includes('medicam') || t.includes('vacin')) return 'medkit-outline';
  return 'paw-outline';
}

export function TodayTasksCard({ tasks, onToggle }: TodayTasksCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Hoje em casa</Text>
      </View>

      {tasks.slice(0, 4).map((task) => (
        <Pressable
          key={task.id}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.done }}
          style={styles.taskRow}
          onPress={() => onToggle(task.id)}
        >
          <View style={[styles.checkbox, task.done && styles.checkboxDone]}>
            {task.done && (
              <Ionicons name="checkmark" size={14} color={colors.textLight} />
            )}
          </View>
          <Text
            style={[styles.taskTitle, task.done && styles.taskTitleDone]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          <Text style={styles.taskTime}>{task.time}</Text>
          <Ionicons
            name={taskIconName(task.title)}
            size={20}
            color={colors.textMuted}
          />
        </Pressable>
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
    backgroundColor: colors.action,
    borderColor: colors.action,
  },
  taskTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  taskTitleDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  taskTime: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: colors.textSecondary,
  },
});
