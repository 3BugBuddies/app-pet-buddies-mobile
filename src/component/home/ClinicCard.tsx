import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

interface ClinicCardProps {
  title: string;
  dayLabel?: string;
  timeLabel?: string;
  vetName?: string;
}

export function ClinicCard({ title, dayLabel, timeLabel, vetName }: ClinicCardProps) {
  const hasDate = !!(dayLabel || timeLabel);

  return (
    <View style={styles.card}>
      <Ionicons name="calendar-outline" size={20} color={colors.primary} />
      <Text style={styles.label}>Próxima consulta</Text>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      {hasDate && (
        <Text style={styles.when}>
          {[dayLabel, timeLabel].filter(Boolean).join(' · ')}
        </Text>
      )}
      {vetName ? <Text style={styles.vet}>{vetName}</Text> : null}
      <View style={styles.arrowWrap}>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardChia,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
    minHeight: 160,
    flex: 1,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  title: {
    fontFamily: 'Sora',
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 19,
  },
  when: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  vet: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: colors.textSecondary,
  },
  arrowWrap: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
