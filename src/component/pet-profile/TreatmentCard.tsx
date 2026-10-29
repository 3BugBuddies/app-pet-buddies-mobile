import { Text, View } from 'react-native';
import { radii, spacing } from '../../styles/theme';
import { makeStyles } from '../../styles/useTheme';

interface TreatmentCardProps {
  names: string[];
  until?: string | null;
}

export function TreatmentCard({ names, until }: TreatmentCardProps) {
  const styles = useStyles();
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Tratamento em andamento</Text>
      <Text style={styles.value}>{until ? `${names.join(' + ')} até ${until}` : names.join(' + ')}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
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
}));
