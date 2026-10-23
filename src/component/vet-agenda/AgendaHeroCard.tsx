import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { remainingAppointmentsLabel } from '../../model/pet';
import { colors, radii, spacing } from '../../styles/theme';

const RING_SIZE = 84;
const RING_RADIUS = 36;
const RING_STROKE = 8;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface AgendaHeroCardProps {
  remaining: number;
  seenCount: number;
  totalCount: number;
  nextTime?: string;
}

export function AgendaHeroCard({ remaining, seenCount, totalCount, nextTime }: AgendaHeroCardProps) {
  const progress = totalCount > 0 ? seenCount / totalCount : 0;
  const strokeDashoffset = RING_CIRCUMFERENCE - RING_CIRCUMFERENCE * progress;

  return (
    <View style={styles.card}>
      <View style={styles.textBlock}>
        <Text style={styles.label}>AGENDA DE HOJE</Text>
        <Text style={styles.value}>{seenCount} de {totalCount}</Text>
        <Text style={styles.sub}>consultas atendidas</Text>
        <Text style={styles.sub}>
          {remainingAppointmentsLabel(remaining)}{nextTime ? ` · próxima às ${nextTime}` : ''}
        </Text>
      </View>

      <View style={styles.ringWrap}>
        <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={colors.surface}
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
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.textPrimary,
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sub: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
  },
});
