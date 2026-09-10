import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

interface PointsHeroCardProps {
  totalPoints: number;
  pointsToday: number;
  tier: string;
  nextTier: string;
  pointsToNextTier: number;
  progressPct: number;
}

export function PointsHeroCard({
  totalPoints,
  pointsToday,
  tier,
  nextTier,
  pointsToNextTier,
  progressPct,
}: PointsHeroCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Pontos de cuidado</Text>
      <View style={styles.row}>
        <Text style={styles.total}>{totalPoints.toLocaleString('pt-BR')}</Text>
        <Text style={styles.today}>+{pointsToday} hoje</Text>
      </View>
      <View style={styles.tierBlock}>
        <View style={styles.tierRow}>
          <Text style={styles.tierLabel}>{tier}</Text>
          <Text style={styles.tierNext}>
            {nextTier} em {pointsToNextTier}
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progressPct}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.success,
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.md,
    overflow: 'hidden',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textLight,
    opacity: 0.85,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  total: {
    fontSize: 56,
    fontWeight: '700',
    letterSpacing: -1.5,
    color: colors.textLight,
  },
  today: {
    fontSize: 15,
    color: colors.textLight,
    opacity: 0.85,
  },
  tierBlock: {
    gap: spacing.sm,
  },
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tierLabel: {
    fontWeight: '600',
    color: colors.textLight,
    fontSize: 13,
  },
  tierNext: {
    color: colors.textLight,
    opacity: 0.85,
    fontSize: 13,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.textLight,
    borderRadius: 4,
  },
});
