import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

interface ActivePlansCardProps {
  count: number;
  adherencePct: number;
}

export function ActivePlansCard({ count, adherencePct }: ActivePlansCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Planos ativos</Text>
      <Text style={styles.value}>{count}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${adherencePct}%` }]} />
      </View>
      <Text style={styles.sub}>{adherencePct}% de adesão média</Text>
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
    color: colors.success,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.success,
  },
  track: {
    marginTop: 'auto',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  sub: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
