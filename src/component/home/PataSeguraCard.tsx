import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

export function PataSeguraCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Pata Segura</Text>
      <Text style={styles.title}>Em breve</Text>
      <Text style={styles.text}>Consulta efetivada vira ponto.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardMax,
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
  text: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
