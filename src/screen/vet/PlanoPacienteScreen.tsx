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

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 80 }]}>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Plano vivo · controle de peso</Text>
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

      <Text style={styles.sectionLabel}>Em casa · o tutor marca</Text>
      <View style={styles.card}>
        {plan.tasks.map((task, index) => (
          <View key={task.id}>
            <View style={styles.row}>
              <View style={styles.dot} />
              <View style={styles.textBlock}>
                <Text style={styles.title}>{task.title}</Text>
                <Text style={styles.sub}>
                  {task.time} · {task.points} pts
                  {task.adherencePct !== undefined ? ` · ${task.adherencePct}% feito` : ''}
                </Text>
              </View>
            </View>
            {index < plan.tasks.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </View>

      {plan.milestones && plan.milestones.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>Clínica · marcos do plano</Text>
          <View style={styles.card}>
            {plan.milestones.map((milestone, index) => (
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
                {index < plan.milestones!.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </>
      ) : null}

      <Text
        style={styles.newOrientation}
        onPress={() => Alert.alert('Em breve', 'Cadastro de nova orientação para casa em breve.')}
      >
        + Nova orientação para casa
      </Text>
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
    backgroundColor: colors.success,
    borderRadius: radii.lg,
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
