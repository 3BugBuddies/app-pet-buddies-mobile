import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
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
  const percentLabel = `${Math.round(progress * 100)}%`;

  return (
    <View style={styles.card}>
      <View style={styles.textBlock}>
        <Text style={styles.label}>PET BUDDIES VET</Text>
        <Text style={styles.value}>{remaining} consultas restantes</Text>
        <Text style={styles.sub}>
          {seenCount} atendidas{nextTime ? ` · próxima às ${nextTime}` : ''}
        </Text>
      </View>

      <View style={styles.ringWrap}>
        <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={RING_STROKE}
            fill="none"
          />
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={colors.textLight}
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
    backgroundColor: colors.textPrimary,
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
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textLight,
    opacity: 0.85,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textLight,
  },
  sub: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.9,
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
    fontSize: 16,
    fontWeight: '700',
    color: colors.textLight,
  },
});
