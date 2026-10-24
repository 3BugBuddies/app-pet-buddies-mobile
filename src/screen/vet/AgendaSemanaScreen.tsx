import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useVetAgenda } from '../../control/useVetAgendaControl';
import { isoLocal } from '../../repository/appointmentRepository';
import type { Appointment } from '../../model/appointment';
import { colors, primitiveColors, radii, spacing } from '../../styles/theme';
import { openClosing } from '../navigation/openClosing';
import type { VetTabParamList } from '../navigation/types';
import { useTabBarSpace } from '../navigation/useTabBarSpace';

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const WEEKDAYS_LONG = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DEFAULT_SLOT_MIN = 30;
const NO_SHOW_BG = '#FDE2E0';
const NO_SHOW_TEXT = '#B42318';

const STATUS_LABEL: Record<string, string> = {
  AGENDADA: 'agendada',
  CONFIRMADA: 'confirmada',
  REALIZADA: 'atendida',
  CANCELADA: 'cancelada',
  NAO_COMPARECEU: 'não compareceu',
};

type DayEntry =
  | { kind: 'appointment'; minutes: number; appointment: Appointment }
  | { kind: 'free'; minutes: number; endMinutes: number; count: number };

const minutesOf = (dateTime: string) => Number(dateTime.slice(11, 13)) * 60 + Number(dateTime.slice(14, 16));

const timeLabel = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
};

function weekDays(offset: number): Date[] {
  const monday = new Date();
  monday.setHours(12, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + offset * 7);
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function statusOf(a: Appointment) {
  return a.backendStatus ?? (a.status === 'COMPLETED' ? 'REALIZADA' : a.status === 'CANCELED' ? 'CANCELADA' : 'AGENDADA');
}

export function AgendaSemanaScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<VetTabParamList>>();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const { appointments, windows } = useVetAgenda();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selected, setSelected] = useState(() => isoLocal(new Date()));

  const refetchAppointments = appointments.refetch;
  const refetchWindows = windows.refetch;
  useFocusEffect(
    useCallback(() => {
      refetchAppointments();
      refetchWindows();
    }, [refetchAppointments, refetchWindows])
  );

  const today = isoLocal(new Date());
  const days = useMemo(() => weekDays(weekOffset), [weekOffset]);
  const dayKeys = days.map(isoLocal);

  const changeWeek = (delta: number) => {
    const next = weekOffset + delta;
    const keys = weekDays(next).map(isoLocal);
    setWeekOffset(next);
    setSelected(keys.includes(today) ? today : keys[0]);
  };

  const countByDay = useMemo(() => {
    const counts: Record<string, number> = {};
    (appointments.data ?? []).forEach((a) => {
      if (statusOf(a) === 'CANCELADA') return;
      const key = a.date.slice(0, 10);
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return counts;
  }, [appointments.data]);

  const { entries, freeCount, apptCount } = useMemo(() => {
    const list: DayEntry[] = [];
    const dayAppointments = (appointments.data ?? []).filter((a) => a.date.slice(0, 10) === selected);
    dayAppointments.forEach((a) => list.push({ kind: 'appointment', minutes: minutesOf(a.date), appointment: a }));

    const dayWindows = (windows.data ?? [])
      .filter((w) => w.dateTime.slice(0, 10) === selected)
      .map((w) => ({ minutes: minutesOf(w.dateTime), free: w.appointmentId == null }))
      .sort((a, b) => a.minutes - b.minutes);
    const diffs = dayWindows.slice(1).map((w, i) => w.minutes - dayWindows[i].minutes).filter((d) => d > 0);
    const slot = diffs.length ? Math.min(...diffs) : DEFAULT_SLOT_MIN;

    let group: { minutes: number; end: number; count: number } | null = null;
    const flush = () => {
      if (group) list.push({ kind: 'free', minutes: group.minutes, endMinutes: group.end, count: group.count });
      group = null;
    };
    dayWindows.forEach((w) => {
      if (!w.free) return flush();
      if (group && group.end === w.minutes) {
        group.end += slot;
        group.count += 1;
      } else {
        flush();
        group = { minutes: w.minutes, end: w.minutes + slot, count: 1 };
      }
    });
    flush();

    list.sort((a, b) => a.minutes - b.minutes);
    return {
      entries: list,
      freeCount: dayWindows.filter((w) => w.free).length,
      apptCount: dayAppointments.filter((a) => statusOf(a) !== 'CANCELADA').length,
    };
  }, [appointments.data, windows.data, selected]);

  if (appointments.isLoading || windows.isLoading) {
    return <LoadingIndicator label="Carregando a agenda..." />;
  }
  if (appointments.isError || windows.isError) {
    return <LoadingIndicator label="Não foi possível carregar a agenda." />;
  }

  const first = days[0];
  const last = days[days.length - 1];
  const selectedDate = new Date(`${selected}T12:00:00`);
  const dayTitle = `${WEEKDAYS_LONG[selectedDate.getDay()]}, ${String(selectedDate.getDate()).padStart(2, '0')}/${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
  const morning = entries.filter((e) => e.minutes < 12 * 60);
  const afternoon = entries.filter((e) => e.minutes >= 12 * 60);

  const openPatient = (a: Appointment) =>
    navigation.navigate('PacientesTab', { screen: 'DetalhesPet', params: { petId: a.petId, consultaId: a.id } });

  const renderEntry = (entry: DayEntry) => {
    if (entry.kind === 'free') {
      return (
        <View key={`free-${entry.minutes}`} style={styles.freeRow}>
          <Text style={styles.freeTime}>{timeLabel(entry.minutes)}</Text>
          <Text style={styles.freeText}>
            Livre até {timeLabel(entry.endMinutes)} · {entry.count} {entry.count === 1 ? 'horário' : 'horários'}
          </Text>
        </View>
      );
    }
    const a = entry.appointment;
    const status = statusOf(a);
    const done = status === 'REALIZADA';
    const canAttend = selected === today && (status === 'AGENDADA' || status === 'CONFIRMADA');
    return (
      <Pressable key={a.id} style={[styles.row, done && styles.rowDone]} onPress={() => openPatient(a)}>
        <Text style={[styles.time, done && styles.textDone]}>{timeLabel(entry.minutes)}</Text>
        <View style={styles.rowText}>
          <Text style={[styles.petName, done && styles.textDone]}>{a.animalNome ?? 'Paciente'}</Text>
          {a.reason ? <Text style={styles.reason} numberOfLines={1}>{a.reason}</Text> : null}
        </View>
        {canAttend ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={6}
            style={styles.attendButton}
            onPress={() => openClosing(navigation, { petId: a.petId, consultaId: a.id })}
          >
            <Text style={styles.attendText}>Atender</Text>
          </Pressable>
        ) : (
          <View style={[styles.tag, status === 'NAO_COMPARECEU' && styles.tagNoShow, (status === 'AGENDADA' || status === 'CONFIRMADA') && styles.tagScheduled, status === 'CANCELADA' && styles.tagCanceled]}>
            <Text style={[styles.tagText, status === 'NAO_COMPARECEU' && styles.tagNoShowText]}>{STATUS_LABEL[status] ?? status.toLowerCase()}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  const renderSection = (title: string, list: DayEntry[]) =>
    list.length === 0 ? null : (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {list.map(renderEntry)}
      </View>
    );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: tabBarSpace }]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.weekLabel}>{MONTHS[first.getMonth()]} · semana {first.getDate()} a {last.getDate()}</Text>
          <Text style={styles.title}>Agenda</Text>
        </View>
        <View style={styles.arrows}>
          <Pressable accessibilityRole="button" accessibilityLabel="Semana anterior" style={styles.arrow} onPress={() => changeWeek(-1)}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Próxima semana" style={styles.arrow} onPress={() => changeWeek(1)}>
            <Ionicons name="chevron-forward" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.strip}>
        {days.map((d, i) => {
          const key = dayKeys[i];
          const isToday = key === today;
          const isPast = key < today;
          const isSelected = key === selected;
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              style={[styles.dayChip, isPast && styles.dayPast, isSelected && !isToday && styles.daySelected, isToday && styles.dayToday]}
              onPress={() => setSelected(key)}
            >
              <Text style={[styles.dayName, isPast && styles.dayPastText, isToday && styles.dayTodayText]}>{isToday ? 'hoje' : WEEKDAYS[d.getDay()]}</Text>
              <Text style={[styles.dayNumber, isPast && styles.dayPastText, isToday && styles.dayTodayText]}>{d.getDate()}</Text>
              <Text style={[styles.dayCount, isPast && styles.dayPastText, isToday && styles.dayCountToday]}>{countByDay[key] ?? 0}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.dayHeader}>
        <Text style={styles.dayTitle}>{dayTitle}</Text>
        <Text style={styles.daySummary}>
          {apptCount} {apptCount === 1 ? 'consulta' : 'consultas'} · {freeCount} {freeCount === 1 ? 'horário livre' : 'horários livres'}
        </Text>
      </View>

      {entries.length === 0 ? <Text style={styles.empty}>Nada agendado neste dia.</Text> : null}
      {renderSection('MANHÃ', morning)}
      {renderSection('TARDE', afternoon)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  weekLabel: { fontSize: 15, color: colors.textSecondary },
  title: { fontSize: 32, fontWeight: '700', letterSpacing: -0.5, color: colors.textPrimary },
  arrows: { flexDirection: 'row', gap: spacing.sm },
  arrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strip: { flexDirection: 'row', gap: 6 },
  dayChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 2,
  },
  dayPast: { backgroundColor: colors.border, borderColor: colors.border },
  daySelected: { borderColor: colors.primary, borderWidth: 2 },
  dayToday: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  dayNumber: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  dayCount: { fontSize: 13, color: colors.textSecondary },
  dayPastText: { color: colors.textSecondary },
  dayTodayText: { color: colors.textLight },
  dayCountToday: { color: primitiveColors.tsNeon, fontWeight: '700' },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: spacing.xs },
  dayTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  daySummary: { fontSize: 14, color: colors.textSecondary },
  empty: { fontSize: 15, color: colors.textSecondary, paddingVertical: spacing.md },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1.2, color: colors.textSecondary, marginTop: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  rowDone: { backgroundColor: colors.border },
  time: { width: 52, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  textDone: { color: colors.textSecondary },
  rowText: { flex: 1 },
  petName: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  reason: { fontSize: 14, color: colors.textSecondary },
  tag: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radii.pill, backgroundColor: colors.surface },
  tagScheduled: { backgroundColor: colors.cardChia },
  tagCanceled: { backgroundColor: colors.border },
  tagNoShow: { backgroundColor: NO_SHOW_BG },
  tagText: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  tagNoShowText: { color: NO_SHOW_TEXT },
  attendButton: { paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radii.pill, backgroundColor: colors.primary },
  attendText: { fontSize: 15, fontWeight: '700', color: colors.textLight },
  freeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  freeTime: { width: 52, textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  freeText: { fontSize: 16, color: colors.textSecondary },
});
