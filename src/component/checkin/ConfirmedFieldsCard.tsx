import { Ionicons } from '@expo/vector-icons';
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
      <Text style={styles.header}>O que encontrei</Text>
      {fields.map((field) => (
        <View key={`${field.label}-${field.value}`} style={styles.row}>
          {field.flagged ? (
            <View style={styles.flagDot} />
          ) : (
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={14} color={colors.textPrimary} />
            </View>
          )}
          <Text style={styles.text}>
            {field.label} · {field.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagDot: {
    width: 12,
    height: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.error,
    marginHorizontal: 6,
  },
  text: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
