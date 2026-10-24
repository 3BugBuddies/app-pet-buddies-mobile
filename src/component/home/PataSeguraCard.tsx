import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

export function PataSeguraCard() {
  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Pata Segura</Text>
        <Image source={require('../../../assets/images/pata-segura.png')} style={styles.shield} resizeMode="contain" />
      </View>
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
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shield: { width: 28, height: 28 },
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
