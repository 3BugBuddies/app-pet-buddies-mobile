import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';
import type { PetVaccine } from '../../model/care';

interface VaccineListCardProps {
  vaccines: PetVaccine[];
}

export function VaccineListCard({ vaccines }: VaccineListCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>Vacinas</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>clínica</Text>
        </View>
      </View>

      {vaccines.map((vaccine, index) => (
        <View key={vaccine.id}>
          <View style={styles.row}>
            <View style={styles.textBlock}>
              <Text style={styles.name}>{vaccine.name}</Text>
              <Text style={styles.date}>{vaccine.dateLabel}</Text>
            </View>
            {vaccine.status === 'APPLIED' ? (
              <Text style={styles.check}>✓</Text>
            ) : (
              <View style={styles.dot} />
            )}
          </View>
          {index < vaccines.length - 1 ? <View style={styles.divider} /> : null}
        </View>
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
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.cardChia,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  textBlock: {
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  date: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  check: {
    color: colors.success,
    fontWeight: '700',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
