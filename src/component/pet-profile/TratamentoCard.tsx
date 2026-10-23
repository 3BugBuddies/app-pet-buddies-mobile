import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

interface TratamentoCardProps {
  nome: string;
  ate?: string | null;
}

export function TratamentoCard({ nome, ate }: TratamentoCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Tratamento em andamento</Text>
      <Text style={styles.value}>{ate ? `${nome} até ${ate}` : nome}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardAlert,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
