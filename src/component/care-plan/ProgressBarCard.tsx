import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

interface ProgressBarCardProps {
  doneCount: number;
  totalCount: number;
  pointsToday: number;
}

export function ProgressBarCard({ doneCount, totalCount }: Omit<ProgressBarCardProps, 'pointsToday'>) {
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  return (
    <View style={styles.card}>
      <View style={styles.textBlock}>
        <Text style={styles.label}>
          {doneCount} de {totalCount} concluídas
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: `${colors.success}1F`,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  textBlock: {
    flex: 1,
    gap: spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: `${colors.success}2E`,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  points: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.success,
  },
});
