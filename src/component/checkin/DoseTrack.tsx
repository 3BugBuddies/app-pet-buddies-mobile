import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

interface DoseTrackProps {
  minLabel: string;
  maxLabel: string;
  fillPct: number;
}

export function DoseTrack({ minLabel, maxLabel, fillPct }: DoseTrackProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${fillPct}%` }]} />
        <View style={[styles.handle, { left: `${fillPct}%` }]} />
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendText}>{minLabel}</Text>
        <Text style={styles.legendText}>{maxLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  track: {
    height: 8,
    borderRadius: radii.sm,
    backgroundColor: colors.background,
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: radii.sm,
    backgroundColor: colors.cardMax,
  },
  handle: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    marginLeft: -8,
    borderRadius: radii.pill,
    backgroundColor: colors.warning,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
