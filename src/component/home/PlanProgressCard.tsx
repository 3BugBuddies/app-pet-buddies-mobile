import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, radii, spacing } from '../../styles/theme';

const RING_SIZE = 84;
const RING_RADIUS = 36;
const RING_STROKE = 7;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface PlanProgressCardProps {
  weekLabel: string;
  doneCount: number;
  totalCount: number;
}

export function PlanProgressCard({ doneCount, totalCount }: PlanProgressCardProps) {
  const progress = totalCount > 0 ? doneCount / totalCount : 0;
  const strokeDashoffset = RING_CIRCUMFERENCE - RING_CIRCUMFERENCE * progress;
  const percentLabel = `${Math.round(progress * 100)}%`;

  return (
    <View style={styles.card}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>Plano da semana</Text>
        <Text style={styles.sub}>
          {doneCount} de {totalCount} tarefas concluídas
        </Text>
        <Text style={styles.incentive}>Vocês estão indo muito bem! ✨</Text>
      </View>

      <View style={styles.ringWrap}>
        <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={colors.border}
            strokeWidth={RING_STROKE}
            fill="none"
          />
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={colors.primary}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            fill="none"
            rotation={-90}
            origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
          />
        </Svg>
        <View style={styles.ringLabel}>
          <Text style={styles.ringLabelText}>{percentLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardChia,
    borderRadius: radii.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontFamily: 'Sora',
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sub: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: colors.textSecondary,
  },
  incentive: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 2,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
  },
  ringLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabelText: {
    fontFamily: 'Sora',
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
