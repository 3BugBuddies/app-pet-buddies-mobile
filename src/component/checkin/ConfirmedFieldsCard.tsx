import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

export interface ConfirmedField {
  label: string;
  value: string;
  flagged?: boolean;
}

interface ConfirmedFieldsCardProps {
  fields: ConfirmedField[];
}

export function ConfirmedFieldsCard({ fields }: ConfirmedFieldsCardProps) {
  return (
    <View style={styles.card}>
      {fields.map((field, index) => (
        <View key={field.label}>
          <View style={styles.row}>
            <Text style={styles.label}>{field.label}</Text>
            <View style={[styles.valuePill, field.flagged && styles.valuePillFlagged]}>
              <Text style={[styles.valueText, field.flagged && styles.valueTextFlagged]}>
                {field.value}
              </Text>
            </View>
          </View>
          {index < fields.length - 1 ? <View style={styles.divider} /> : null}
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
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: colors.textSecondary,
  },
  valuePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
  },
  valuePillFlagged: {
    backgroundColor: colors.cardMax,
  },
  valueText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  valueTextFlagged: {
    color: colors.warning,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
