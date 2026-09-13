import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressBarCard } from '../../component/care-plan/ProgressBarCard';
import { ErrorState } from '../../component/ui/ErrorState';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { LogoHeader } from '../../component/ui/LogoHeader';
import { useCarePlan } from '../../control/useCarePlanControl';
import { usePets } from '../../control/usePetsControl';
import type { PlanoTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';

type Props = NativeStackScreenProps<PlanoTabParamList, 'CarePlan'>;

export function CarePlanScreen({ route }: Props) {
  const { data: pets, isLoading: isLoadingPets, isError: isPetsError } = usePets();
  const petId = route.params?.petId ?? pets?.[0]?.id ?? '';
  const navigation = useNavigation<NativeStackNavigationProp<PlanoTabParamList>>();

  const { data: plan, isLoading: isLoadingPlan, isError: isPlanError } = useCarePlan(petId);

  const insets = useSafeAreaInsets();

  if (isLoadingPets || isLoadingPlan) {
    return <LoadingIndicator label="Carregando evolução..." />;
  }

  if (isPetsError || isPlanError || !plan || !petId) {
    return (
      <ErrorState
        type="500"
        message="Não foi possível carregar o histórico."
        onRetry={() => navigation.goBack()}
        retryLabel="Voltar"
      />
    );
  }

  const tasks = plan.tasks || [];
  const doneCount = tasks.filter((task) => task.completed).length;
  const pointsToday = tasks.reduce((sum, task) => (task.completed ? sum + task.points : sum), 0);

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
      <LogoHeader size="large" />
      <View style={styles.header}>
        <Text style={styles.weekLabel}>{plan.weekLabel}</Text>
        <Text style={styles.title}>Evolução</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 140 }]}
      >
        <ProgressBarCard doneCount={doneCount} totalCount={tasks.length} pointsToday={pointsToday} />

        <Text style={styles.sectionLabel}>Histórico do Tratamento</Text>

        {!plan.history || plan.history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhuma tarefa de cuidado registrada ainda.</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {plan.history.map((item) => (
              <View key={item.id} style={styles.historyRow}>
                <View style={styles.historyDateCol}>
                  <Text style={styles.historyDay}>{item.dayLabel}</Text>
                  <Text style={styles.historyDate}>{item.dateLabel}</Text>
                </View>
                <View style={styles.timelineDotCol}>
                  <View style={[styles.timelineDot, item.completed && styles.timelineDotDone]} />
                  <View style={styles.timelineLine} />
                </View>
                <View style={[styles.timelineCard, item.completed && styles.timelineCardDone]}>
                  <Text style={[styles.timelineTitle, item.completed && styles.timelineTitleDone]}>
                    {item.title}
                  </Text>
                  <Text style={item.completed ? styles.timelineBodyDone : styles.timelineBody}>
                    {item.completed ? 'Check-in realizado ✓' : 'Pendente'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { gap: 2, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  weekLabel: { fontSize: 15, fontWeight: '600', color: colors.success },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -0.5, color: colors.textPrimary },
  content: { padding: spacing.lg, gap: spacing.md },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: spacing.xs,
    marginTop: spacing.md,
  },
  emptyCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: { color: colors.textSecondary, textAlign: 'center' },
  timeline: { gap: 0, marginTop: spacing.xs },
  historyRow: { flexDirection: 'row', gap: spacing.sm },
  historyDateCol: { width: 44, alignItems: 'flex-end', paddingTop: 12 },
  historyDay: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  historyDate: { fontSize: 12, color: colors.textSecondary },
  timelineDotCol: { alignItems: 'center', width: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: radii.pill, backgroundColor: colors.borderStrong, marginTop: 14, borderWidth: 2, borderColor: colors.background },
  timelineDotDone: { backgroundColor: colors.success },
  timelineLine: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 4, marginBottom: 4 },
  timelineCard: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md, gap: 4 },
  timelineCardDone: { backgroundColor: 'transparent', borderColor: 'transparent', paddingHorizontal: 0 },
  timelineTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  timelineTitleDone: { color: colors.textSecondary },
  timelineBody: { fontSize: 13, color: colors.warning, fontWeight: '600' },
  timelineBodyDone: { fontSize: 13, color: colors.success, fontWeight: '600' },
});
