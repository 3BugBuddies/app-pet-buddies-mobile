import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

interface ClinicCardProps {
  title: string;
  dayLabel?: string;
  timeLabel?: string;
  vetName?: string;
  hint?: string;
}

export function ClinicCard({ title, dayLabel, timeLabel, vetName, hint }: ClinicCardProps) {
  const hasDate = !!(dayLabel || timeLabel);

  return (
    <View style={styles.card}>
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
      {hint ? <Text style={styles.vet}>{hint}</Text> : null}
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
    letterSpacing: 1.2,
    textTransform: 'uppercase',
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
});
