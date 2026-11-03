import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { radii, spacing } from '../../styles/theme';
import { makeStyles, useTheme } from '../../styles/useTheme';

interface PointsCardProps {
  // Nulo enquanto o saldo carrega ou quando ele não veio. O programa só tem pontos, sem nível.
  points: number | null;
}

export function PointsCard({ points }: PointsCardProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="paw" size={18} color={colors.action} />
        <Text style={styles.label}>
          <Text style={styles.labelRegular}>Pata </Text>
          <Text style={styles.labelBold}>Segura</Text>
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.textSecondary}
          style={styles.chevron}
        />
      </View>

      <Text style={styles.value}>
        {points == null ? '—' : points.toLocaleString('pt-BR')}{' '}
        <Text style={styles.valueUnit}>{points === 1 ? 'ponto' : 'pontos'}</Text>
      </Text>

      <Text style={styles.caption}>Mais carinho{'\n'}em cada cuidado.</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.cardMax,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
    minHeight: 160,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    flex: 1,
  },
  labelRegular: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: colors.textPrimary,
  },
  labelBold: {
    fontFamily: 'Sora',
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chevron: {
    marginLeft: 'auto',
  },
  value: {
    fontFamily: 'Sora',
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  valueUnit: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  caption: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 'auto',
    lineHeight: 16,
  },
}));
