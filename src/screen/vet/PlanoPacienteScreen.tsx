import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useCarePlan } from '../../control/useCarePlanControl';
import { usePet } from '../../control/usePetsControl';
import type { PacientesTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';

type Props = NativeStackScreenProps<PacientesTabParamList, 'PlanoPaciente'>;

export function PlanoPacienteScreen({ route }: Props) {
  const { petId } = route.params;
  const insets = useSafeAreaInsets();
  const { data: pet, isLoading: isLoadingPet } = usePet(petId);
  const { data: plan, isLoading: isLoadingPlan, isError } = useCarePlan(petId);

  if (isLoadingPet || isLoadingPlan) {
    return <LoadingIndicator label="Carregando o plano..." />;
  }

  if (isError || !plan || !pet) {
    return <LoadingIndicator label="Não foi possível carregar o plano." />;
  }

  const currentWeek = plan.currentWeekNumber ?? 1;
  const totalWeeks = plan.totalWeeks ?? currentWeek;
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i < currentWeek);

  const tasks = plan.tasks || [];
  const milestones = plan.milestones || [];

  // Calcular aderência geral
  const avgAdherence = tasks.length > 0
    ? tasks.reduce((acc, t) => acc + (t.adherencePct || 0), 0) / tasks.length
    : 100;

  let statusConfig = {
    color: colors.success,
    icon: '🟢',
    title: 'Tratamento no caminho certo',
    sub: 'O tutor está seguindo o plano à risca. Ótimo engajamento!',
  };

  if (avgAdherence < 50) {
    statusConfig = {
      color: colors.error,
      icon: '🔴',
      title: 'Atenção: Baixa Adesão',
      sub: 'O tutor está esquecendo muitas tarefas. Necessária intervenção.',
    };
  } else if (avgAdherence < 80) {
    statusConfig = {
      color: colors.warning,
      icon: '🟡',
      title: 'Adesão Parcial',
      sub: 'O tutor perdeu algumas doses nesta semana. Vale confirmar.',
    };
  }

  const getMock7Days = (adherence: number = 0) => {
    const days = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
    const filledCount = Math.round((adherence / 100) * 7);
    
    // Distribuição fixa/determinística para não piscar no scroll
    const pattern = adherence > 80 ? [true, true, true, false, true, true, true] :
                    adherence > 40 ? [true, false, true, false, true, false, false] :
                    [false, false, true, false, false, false, false];
                    
    return days.map((day, i) => ({
      label: day,
      done: pattern[i] && i < filledCount || (filledCount >= 7),
    }));
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 80 }]}>
      <View style={styles.hero}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroLabel}>Plano vivo · evolução</Text>
          <View style={styles.heroRow}>
            <Text style={styles.heroWeek}>Semana {currentWeek}</Text>
            <Text style={styles.heroTotal}>de {totalWeeks}</Text>
          </View>
          <View style={styles.weekStrip}>
            {weeks.map((filled, index) => (
              <View key={index} style={[styles.weekBar, filled && styles.weekBarFilled]} />
            ))}
          </View>
        </View>

        {/* Traffic Light Banner */}
        <View style={[styles.trafficBanner, { backgroundColor: statusConfig.color + '1A', borderColor: statusConfig.color }]}>
          <Text style={styles.trafficIcon}>{statusConfig.icon}</Text>
          <View style={styles.trafficTextCol}>
            <Text style={[styles.trafficTitle, { color: statusConfig.color }]}>{statusConfig.title}</Text>
            <Text style={styles.trafficSub}>{statusConfig.sub}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Últimos 7 dias em casa</Text>
      <View style={styles.card}>
        {tasks.map((task, index) => {
          const daysMock = getMock7Days(task.adherencePct);
          return (
            <View key={task.id}>
              <View style={styles.taskRow}>
                <View style={styles.textBlock}>
                  <Text style={styles.title}>{task.title}</Text>
                  <Text style={styles.sub}>
                    {task.time} · {task.points} pts
                  </Text>
                </View>
                <View style={styles.adherenceBadge}>
                  <Text style={styles.adherenceText}>{task.adherencePct ?? 0}%</Text>
                </View>
              </View>
              
              {/* Mini-calendário de 7 dias */}
              <View style={styles.calendarStrip}>
                {daysMock.map((d, i) => (
                  <View key={i} style={styles.calendarDayCol}>
                    <Text style={styles.calendarDayLabel}>{d.label}</Text>
                    <View style={[styles.calendarDot, d.done ? styles.calendarDotDone : styles.calendarDotMissed]} />
                  </View>
                ))}
              </View>

              {index < tasks.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          );
        })}
      </View>

      {milestones.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>Clínica · marcos do plano</Text>
          <View style={styles.card}>
            {milestones.map((milestone, index) => (
              <View key={milestone.title}>
                <View style={styles.row}>
                  <View style={[styles.dot, styles.dotClinica]} />
                  <View style={styles.textBlock}>
                    <Text style={styles.title}>{milestone.title}</Text>
                    <Text style={styles.sub}>{milestone.whenLabel}</Text>
                  </View>
                  {milestone.tagLabel ? (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{milestone.tagLabel}</Text>
                    </View>
                  ) : null}
                </View>
                {index < milestones.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </>
      ) : null}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroHeader: {
    backgroundColor: colors.success,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textLight,
    opacity: 0.85,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  heroWeek: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1,
    color: colors.textLight,
  },
  heroTotal: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.85,
  },
  weekStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  weekBar: {
    width: 10,
    height: 6,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  weekBarFilled: {
    backgroundColor: colors.textLight,
  },
  trafficBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
  },
  trafficIcon: {
    fontSize: 20,
  },
  trafficTextCol: {
    flex: 1,
  },
  trafficTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  trafficSub: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  adherenceBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adherenceText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  calendarDayCol: {
    alignItems: 'center',
    gap: 4,
  },
  calendarDayLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  calendarDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  calendarDotDone: {
    backgroundColor: colors.success,
  },
  calendarDotMissed: {
    backgroundColor: colors.borderStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.warning,
  },
  dotClinica: {
    backgroundColor: colors.primary,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  sub: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.cardChia,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  newOrientation: {
    marginTop: spacing.sm,
    height: 52,
    lineHeight: 52,
    textAlign: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    fontSize: 17,
    fontWeight: '600',
    color: colors.warning,
  },
});
