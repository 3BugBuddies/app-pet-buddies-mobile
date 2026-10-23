import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

interface PatientCardProps {
  petName: string;
  descricao: string;
  responsavel?: string | null;
  pilula?: { label: string; tratamento: boolean } | null;
  onPress: () => void;
}

export function PatientCard({ petName, descricao, responsavel, pilula, onPress }: PatientCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress} accessibilityRole="button">
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{petName.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.name}>{petName}</Text>
        <Text style={styles.meta}>{descricao}</Text>
        {responsavel ? <Text style={styles.meta}>Responsável · {responsavel}</Text> : null}
        {pilula ? (
          <View style={[styles.pill, pilula.tratamento ? styles.pillTratamento : styles.pillPreventivo]}>
            <Text style={styles.pillText}>{pilula.label}</Text>
          </View>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: colors.cardChia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontWeight: '700', fontSize: 20, color: colors.textPrimary },
  textBlock: { flex: 1, gap: 2 },
  name: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  meta: { fontSize: 13, color: colors.textSecondary },
  pill: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  pillTratamento: { backgroundColor: colors.cardMax },
  pillPreventivo: { backgroundColor: colors.cardChia },
  pillText: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
});
