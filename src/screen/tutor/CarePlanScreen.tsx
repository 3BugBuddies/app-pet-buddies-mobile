import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CareItemsSection } from '../../component/care-plan/CareItemsSection';
import { NoPlanState } from '../../component/care-plan/NoPlanState';
import { ErrorState } from '../../component/ui/ErrorState';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useCarePlan } from '../../control/useCarePlanControl';
import { useActivePetId, usePet, usePets } from '../../control/usePetsControl';
import type { PlanoTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';

type Props = NativeStackScreenProps<PlanoTabParamList, 'CarePlan'>;

export function CarePlanScreen({ route }: Props) {
  const { data: pets, isLoading: isLoadingPets, isError: isPetsError } = usePets();
  const { activePetId } = useActivePetId();
  const petId = route.params?.petId ?? activePetId ?? '';
  const navigation = useNavigation<NativeStackNavigationProp<PlanoTabParamList>>();

  const { data: plan, isLoading: isLoadingPlan, isError: isPlanError } = useCarePlan(petId);

  const { data: pet } = usePet(petId);

  const insets = useSafeAreaInsets();

  if (isLoadingPets || isLoadingPlan) {
    return <LoadingIndicator label="Carregando evolução..." />;
  }

  if (isPetsError || isPlanError || plan === undefined || !petId) {
    return (
      <ErrorState
        type="500"
        message="Não foi possível carregar o histórico."
        onRetry={() => navigation.goBack()}
        retryLabel="Voltar"
      />
    );
  }

  if (plan === null) {
    return (
      <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
        <NoPlanState
          petName={pet?.nome ?? 'pet'}
          onSchedule={() => navigation.getParent()?.navigate('AgendaTab', { screen: 'AgendamentoTutor' })}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.headerCard}>
        <View style={styles.headerTexts}>
          <Text style={styles.headerTitle}>Cuidados</Text>
          <Text style={styles.headerSubtitle}>{plan.weekLabel}</Text>
        </View>
        <Image
          source={require('../../../assets/images/logo-header-principal-trasparente.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 140 }]}
      >
        <CareItemsSection
          title="Preventivo"
          items={plan.items.filter((item) => !item.tratamento)}
          emptyText="Nenhum cuidado preventivo agendado."
        />
        <CareItemsSection
          title="Tratamento"
          items={plan.items.filter((item) => item.tratamento)}
          emptyText="Nenhum tratamento em andamento."
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.xs,
    marginHorizontal: spacing.lg,
    shadowColor: colors.surfaceDark,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  headerTexts: { flex: 1 },
  headerTitle: { fontFamily: 'Sora', fontSize: 24, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 },
  headerSubtitle: { fontFamily: 'Inter', fontSize: 13, fontWeight: '600', color: colors.success, marginTop: 2 },
  headerLogo: { width: 80, height: 40 },
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
