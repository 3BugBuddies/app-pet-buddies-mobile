import { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../../styles/theme';
import type { DayDot, WeekDayCell } from '../../model/careHome';

interface WeekStripProps {
  days: WeekDayCell[];
  tone?: 'default' | 'suspended';
  onPressDay?: (day: WeekDayCell) => void;
}

const CELL_WIDTH = 44;
const MAX_FIXED_DAYS = 7;

function Dot({ dot }: { dot: DayDot }) {
  switch (dot) {
    case 'DONE':
      return (
        <View style={[styles.dot, styles.dotLime]}>
          <Ionicons name="checkmark" size={12} color={colors.textPrimary} />
        </View>
      );
    case 'NO_DOSE':
      return (
        <View style={[styles.dot, styles.dotLime]}>
          <Ionicons name="remove" size={12} color={colors.textPrimary} />
        </View>
      );
    case 'REFERRED':
      return (
        <View style={[styles.dot, styles.dotDanger]}>
          <Text style={styles.dotMark}>!</Text>
        </View>
      );
    case 'PENDING':
      return <View style={[styles.dot, styles.dotPending]} />;
    case 'TODO':
      return <View style={[styles.dot, styles.dotTodo]} />;
    case 'OFF':
      return <View style={styles.dotOff} />;
    case 'APPOINTMENT':
      return <View style={[styles.dot, styles.dotAppointment]} />;
  }
}

export function WeekStrip({ days, tone = 'default', onPressDay }: WeekStripProps) {
  const scrollRef = useRef<ScrollView>(null);
  const scrolls = days.length > MAX_FIXED_DAYS;
  const todayIndex = days.findIndex((day) => day.isToday);

  const cells = days.map((day) => {
    const highlighted = day.isToday && tone === 'default';
    const dimmed = day.dot === 'OFF';
    const labelColor = highlighted
      ? colors.borderStrong
      : day.isToday && tone === 'suspended'
        ? colors.danger
        : dimmed
          ? colors.dimmed
          : colors.textSecondary;
    const pressable = !!onPressDay && !!day.pressable;
    return (
      <Pressable
        key={day.iso}
        disabled={!pressable}
        accessibilityRole={pressable ? 'button' : undefined}
        onPress={() => onPressDay?.(day)}
        style={[styles.cell, scrolls ? { width: CELL_WIDTH } : styles.cellFlex, highlighted && styles.cellToday]}
      >
        <Text style={[styles.weekday, { color: labelColor }]}>{day.isToday ? 'hoje' : day.weekday}</Text>
        <Text
          style={[
            styles.number,
            highlighted ? { color: colors.background } : dimmed ? { color: colors.dimmed } : null,
          ]}
        >
          {day.dayNumber}
        </Text>
        <Dot dot={day.dot} />
      </Pressable>
    );
  });

  if (!scrolls) return <View style={styles.row}>{cells}</View>;

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      onContentSizeChange={() => {
        if (todayIndex > 0) scrollRef.current?.scrollTo({ x: Math.max(0, (todayIndex - 1) * (CELL_WIDTH + 4)), animated: false });
      }}
    >
      {cells}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  cell: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    borderRadius: radii.md - 4,
  },
  cellFlex: { flex: 1 },
  cellToday: { backgroundColor: colors.primary },
  weekday: { fontFamily: 'Inter', fontSize: 10, fontWeight: '600' },
  number: { fontFamily: 'Sora', fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  dot: { width: 16, height: 16, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  dotLime: { backgroundColor: colors.lime },
  dotDanger: { backgroundColor: colors.danger },
  dotMark: { fontFamily: 'Inter', fontSize: 10, lineHeight: 12, fontWeight: '800', color: colors.textLight },
  dotPending: { borderWidth: 2.5, borderColor: colors.action },
  dotAppointment: { backgroundColor: colors.info },
  dotTodo: { borderWidth: 2, borderColor: colors.border },
  dotOff: { width: 16, height: 2, marginVertical: 7, borderRadius: 2, backgroundColor: colors.borderStrong },
});
