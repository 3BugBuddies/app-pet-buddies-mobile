import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

interface PointsCardProps {
  points: number;
  tierLabel: string;
  filledDots: number;
  totalDots: number;
}

export function PointsCard({ points, tierLabel, filledDots, totalDots }: PointsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Pontos</Text>
      <Text style={styles.value}>{points.toLocaleString('pt-BR')}</Text>
      <View style={styles.dots}>
        {Array.from({ length: totalDots }).map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index < filledDots ? styles.dotFilled : styles.dotEmpty]}
          />
        ))}
      </View>
      <Text style={styles.tier}>{tierLabel}</Text>
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
    gap: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
  },
  dotFilled: {
    backgroundColor: colors.cardChia,
  },
  dotEmpty: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
  },
  tier: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
