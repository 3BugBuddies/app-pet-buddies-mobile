import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

interface ClinicCardProps {
  title: string;
  dayLabel?: string;
  timeLabel?: string;
  vetName?: string;
}

export function ClinicCard({ title, dayLabel, timeLabel, vetName }: ClinicCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Clínica</Text>
      <Text style={styles.title}>{title}</Text>
      {dayLabel ? (
        <Text style={styles.when}>
          {dayLabel}
          {timeLabel ? ` · ${timeLabel}` : ''}
          {vetName ? `\n${vetName}` : ''}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardChia,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
    minHeight: 150,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  when: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 'auto',
  },
});
