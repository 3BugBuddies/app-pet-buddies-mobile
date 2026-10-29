import { Text, View } from 'react-native';
import { radii, spacing } from '../../styles/theme';
import { makeStyles } from '../../styles/useTheme';

interface HomePendingCardProps {
  count: number;
}

export function HomePendingCard({ count }: HomePendingCardProps) {
  const styles = useStyles();
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Casa · pendências</Text>
      <Text style={styles.value}>{count}</Text>
      <Text style={styles.sub}>tutores com tarefas atrasadas há 3+ dias</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.cardMax,
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
    color: colors.textPrimary,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  sub: {
    marginTop: 'auto',
    fontSize: 14,
    color: colors.textPrimary,
    opacity: 0.75,
  },
}));
