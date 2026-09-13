import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

interface InfoTintCardProps {
  label: string;
  value: string;
  subLabel: string;
  tone: 'alert' | 'casa';
}

export function InfoTintCard({ label, value, subLabel, tone }: InfoTintCardProps) {
  const isAlert = tone === 'alert';
  return (
    <View style={[styles.card, isAlert ? styles.alertBg : styles.casaBg]}>
      <Text style={[styles.label, isAlert ? styles.alertLabel : styles.casaLabel]}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.sub}>{subLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: 4,
  },
  alertBg: {
    backgroundColor: `${colors.error}1A`,
  },
  casaBg: {
    backgroundColor: colors.cardMax,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  alertLabel: {
    color: colors.error,
  },
  casaLabel: {
    color: colors.textPrimary,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sub: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
