import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';
import type { FreeWeek, MedicationLine, TreatmentWeek, WeekDayCell } from '../../model/careHome';
import { WeekStrip } from './WeekStrip';

interface TreatmentWeekCardProps {
  week: TreatmentWeek;
  showLegend?: boolean;
  medications?: MedicationLine[];
  onSeeCare?: () => void;
}

function Legend({ week }: { week: TreatmentWeek }) {
  const hasNoDose = week.days.some((day) => day.dot === 'NO_DOSE');
  return (
    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.lime }]} />
        <Text style={styles.legendText}>dose dada</Text>
      </View>
      {hasNoDose ? (
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.lime }]} />
          <Text style={styles.legendText}>sem dose</Text>
        </View>
      ) : null}
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.dangerSoft, borderWidth: 1.5, borderColor: colors.danger }]} />
        <Text style={styles.legendText}>clínica acionada</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { borderWidth: 1.5, borderColor: colors.border }]} />
        <Text style={styles.legendText}>a fazer</Text>
      </View>
    </View>
  );
}

function MedicationLines({ lines }: { lines: MedicationLine[] }) {
  return (
    <View style={styles.medications}>
      {lines.map((line) => (
        <View key={line.name} style={styles.medicationRow}>
          <Text style={styles.medicationName} numberOfLines={1}>
            {[line.name, line.dose].filter(Boolean).join(' · ')}
          </Text>
          <Text style={styles.medicationMeta}>
            {[line.frequency, line.ended ? 'encerrado' : `até ${line.endLabel}`].filter(Boolean).join(' · ')}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function TreatmentWeekCard({ week, showLegend, medications, onSeeCare }: TreatmentWeekCardProps) {
  const multi = week.medications.length > 1;
  const doses = multi
    ? `${week.reportsDone} ${week.reportsDone === 1 ? 'relato feito' : 'relatos feitos'}`
    : `${week.dosesGiven} ${week.dosesGiven === 1 ? 'dose dada' : 'doses dadas'}`;
  const content = (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>{`Tratamento · ${week.medication}`}</Text>
          <Text style={styles.title}>Semana do tratamento</Text>
        </View>
        <Text style={styles.counter}>{`dia ${week.currentDay} de ${week.totalDays}`}</Text>
      </View>
      <WeekStrip days={week.days} />
      {showLegend ? <Legend week={week} /> : null}
      {medications && medications.length > 1 ? <MedicationLines lines={medications} /> : null}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{`${doses} · termina em ${week.endLabel}`}</Text>
        {onSeeCare ? (
          <View style={styles.link}>
            <Text style={styles.linkText}>Ver cuidados</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textPrimary} />
          </View>
        ) : null}
      </View>
    </View>
  );

  if (!onSeeCare) return content;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Ver cuidados" onPress={onSeeCare}>
      {content}
    </Pressable>
  );
}

interface FreeWeekCardProps {
  week: FreeWeek;
  onPressDay: (day: WeekDayCell) => void;
}

export function FreeWeekCard({ week, onPressDay }: FreeWeekCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Sua semana</Text>
      <WeekStrip days={week.days} onPressDay={onPressDay} />
      <Text style={styles.footerText}>{week.footer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm + 4,
    shadowColor: colors.primary,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  titleBlock: { flex: 1, gap: 2 },
  eyebrow: {
    fontFamily: 'Inter',
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  title: { fontFamily: 'Sora', fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  counter: { fontFamily: 'Inter', fontSize: 12, color: colors.textSecondary },
  medications: { gap: 8 },
  medicationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: spacing.sm },
  medicationName: { fontFamily: 'Inter', fontSize: 13, fontWeight: '600', color: colors.textPrimary, flexShrink: 1 },
  medicationMeta: { fontFamily: 'Inter', fontSize: 12, color: colors.textSecondary },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: radii.pill },
  legendText: { fontFamily: 'Inter', fontSize: 11, color: colors.textSecondary },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  footerText: { fontFamily: 'Inter', fontSize: 12, color: colors.textSecondary, flexShrink: 1 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  linkText: { fontFamily: 'Inter', fontSize: 12, fontWeight: '700', color: colors.textPrimary },
});
