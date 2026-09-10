import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';
import type { WeekDay } from '../../model/care';

interface WeekStripProps {
  days: WeekDay[];
}

const DOT_COLOR: Record<WeekDay['dotColor'], string> = {
  CUIDADO: colors.success,
  CASA: colors.warning,
  NONE: 'transparent',
};

export function WeekStrip({ days }: WeekStripProps) {
  return (
    <View style={styles.row}>
      {days.map((day, index) => (
        <View key={index} style={[styles.day, day.isActive && styles.dayActive]}>
          <Text style={[styles.label, day.isActive && styles.labelActive]}>{day.label}</Text>
          <Text style={[styles.num, day.isActive && styles.labelActive]}>{day.dayNumber}</Text>
          <View style={[styles.dot, { backgroundColor: DOT_COLOR[day.dotColor] }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  dayActive: {
    backgroundColor: colors.textPrimary,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.textLight,
  },
  num: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: radii.pill,
  },
});
