import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

interface PointsCardProps {
  points: number;
  tierLabel: string;
  filledDots: number;
  totalDots: number;
}

export function PointsCard({ points, filledDots, totalDots }: PointsCardProps) {
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
        {points.toLocaleString('pt-BR')}{' '}
        <Text style={styles.valueUnit}>pontos</Text>
      </Text>

      <View style={styles.dots}>
        {Array.from({ length: totalDots }).map((_, index) => (
          <Ionicons
            key={index}
            name="paw"
            size={22}
            color={index < filledDots ? colors.action : colors.border}
          />
        ))}
      </View>

      <Text style={styles.caption}>Mais carinho{'\n'}em cada cuidado.</Text>
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
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  caption: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 'auto',
    lineHeight: 16,
  },
});
