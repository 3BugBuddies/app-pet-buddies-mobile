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
import useMedicalRecordControl from '../../control/useMedicalRecordControl';
import type { PlanoTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';

type Props = NativeStackScreenProps<PlanoTabParamList, 'CarePlan'>;

export function CarePlanScreen({ route }: Props) {
  const { data: pets, isLoading: isLoadingPets, isError: isPetsError } = usePets();
  const petId = route.params?.petId ?? pets?.[0]?.id ?? '';
  const navigation = useNavigation<NativeStackNavigationProp<PlanoTabParamList>>();

  const { data: plan, isLoading: isLoadingPlan, isError: isPlanError } = useCarePlan(petId);
  const { registros, carregandoRegistros } = useMedicalRecordControl(petId);

  const insets = useSafeAreaInsets();

  if (isLoadingPets || isLoadingPlan || carregandoRegistros) {
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

        <Text style={styles.sectionLabel}>Histórico Clínico</Text>

        {!registros || registros.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhum prontuário registrado ainda.</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {registros.map((record) => (
              <View key={record.id} style={styles.timelineRow}>
                <View style={styles.timelineDotCol}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineLine} />
                </View>
                <View style={styles.timelineCard}>
                  <Text style={styles.timelineDate}>{record.dataAtendimento}</Text>
                  <Text style={styles.timelineTitle}>{record.diagnostico}</Text>
                  <Text style={styles.timelineBody}>{record.tratamento}</Text>
                  {record.observacao ? <Text style={styles.timelineBody}>{record.observacao}</Text> : null}
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
  timeline: { gap: 0 },
  timelineRow: { flexDirection: 'row', gap: spacing.md },
  timelineDotCol: { alignItems: 'center', width: 12 },
  timelineDot: { width: 12, height: 12, borderRadius: radii.pill, backgroundColor: colors.primary },
  timelineLine: { flex: 1, width: 2, backgroundColor: colors.borderStrong },
  timelineCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 4,
  },
  timelineDate: { fontSize: 13, fontWeight: '600', color: colors.primary },
  timelineTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  timelineBody: { fontSize: 14, color: colors.textSecondary },
});
