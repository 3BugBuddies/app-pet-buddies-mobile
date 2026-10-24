import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NoPlanState } from '../../component/care-plan/NoPlanState';
import { PreventiveCard } from '../../component/care-plan/PreventiveCard';
import { SuspendedTreatmentCard } from '../../component/care-plan/SuspendedTreatmentCard';
import { TodayAtHomeCard } from '../../component/care-plan/TodayAtHomeCard';
import { TreatmentWeekCard } from '../../component/care-plan/TreatmentWeekCard';
import { NoPetState } from '../../component/pet/NoPetState';
import { BrandMark } from '../../component/ui/BrandMark';
import { ErrorState } from '../../component/ui/ErrorState';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useCarePlan } from '../../control/useCarePlanControl';
import { useActivePetId, usePet, usePets } from '../../control/usePetsControl';
import { activePlansLabel, type CareItem } from '../../model/care';
import {
  activeTreatmentWeek,
  openPreventiveItems,
  suspendedTreatmentWeek,
  todayIso,
  todayTreatmentItems,
} from '../../model/careHome';
import { petArticle, speciesLabel } from '../../model/pet';
import type { PlanoTabParamList } from '../navigation/types';
import { colors, spacing } from '../../styles/theme';
import { useTabBarSpace } from '../navigation/useTabBarSpace';

type Props = NativeStackScreenProps<PlanoTabParamList, 'CarePlan'>;

export function CarePlanScreen({ route }: Props) {
  const { data: pets, isLoading: isLoadingPets, isError: isPetsError } = usePets();
  const { activePetId } = useActivePetId();
  const petId = route.params?.petId ?? activePetId ?? '';
  const navigation = useNavigation<NativeStackNavigationProp<PlanoTabParamList>>();

  const { data: plan, isLoading: isLoadingPlan, isError: isPlanError } = useCarePlan(petId);

  const { data: pet } = usePet(petId);

  const insets = useSafeAreaInsets();

  const tabBarSpace = useTabBarSpace();

  if (isLoadingPets || isLoadingPlan) {
    return <LoadingIndicator label="Carregando evolução..." />;
  }

  if (isPetsError || isPlanError) {
    return (
      <ErrorState
        type="500"
        message="Não foi possível carregar o histórico."
        onRetry={() => navigation.goBack()}
        retryLabel="Voltar"
      />
    );
  }

  if (!petId) {
    return (
      <View style={[styles.screen, styles.noPet, { paddingTop: Math.max(insets.top, 16) }]}>
        <NoPetState onRegister={() => navigation.getParent()?.navigate('PetTab', { screen: 'NovoPet' })} />
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
        <BrandMark style={styles.noPlanMark} />
        <NoPlanState
          petName={pet?.nome ?? 'pet'}
          petSex={pet?.sexo}
          onSchedule={() => navigation.getParent()?.navigate('AgendaTab', { screen: 'AgendamentoTutor' })}
        />
      </View>
    );
  }

  const today = todayIso();
  const treatmentWeek = activeTreatmentWeek(plan, today);
  const suspendedWeek = suspendedTreatmentWeek(plan, today);
  const todayItems = treatmentWeek ? todayTreatmentItems(plan, today) : [];
  const preventive = openPreventiveItems(plan);
  const modelLabel = pet?.especie ? `modelo de plano · ${speciesLabel(pet.especie).toLowerCase()}` : undefined;
  const petName = pet?.nome ?? 'pet';

  const openCheckIn = (item: CareItem) => {
    const itemId = Number(item.id);
    navigation.navigate('CheckInEntry', {
      petId,
      itemPlanoCuidadoId: Number.isFinite(itemId) ? itemId : undefined,
    });
  };

  const openScheduling = () => {
    navigation.getParent()?.navigate('AgendaTab', {
      screen: 'AgendamentoTutor',
      params: { petId, reason: 'Vacinação' },
    });
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}
      >
        <View style={styles.header}>
          <BrandMark />
          <View style={styles.headerTexts}>
            <Text style={styles.headerTitle}>{`Cuidados ${petArticle(pet?.sexo)} ${petName}`}</Text>
            <Text style={styles.headerSubtitle}>{activePlansLabel(plan)}</Text>
          </View>
        </View>

        {plan.suspended ? (
          <SuspendedTreatmentCard
            medication={plan.suspended.medication}
            suspendedAt={plan.suspended.at}
            week={suspendedWeek}
            clinic={plan.clinic}
          />
        ) : null}

        {treatmentWeek ? <TreatmentWeekCard week={treatmentWeek} showLegend /> : null}

        {todayItems.length > 0 ? (
          <TodayAtHomeCard
            items={todayItems}
            unit={plan.treatment?.unit}
            petName={petName}
            petSex={pet?.sexo}
            onPressItem={openCheckIn}
          />
        ) : null}

        <PreventiveCard
          title="Preventivo"
          items={preventive}
          emptyText="Nenhum cuidado preventivo agendado."
          idleLabel={modelLabel}
          onPressItem={openScheduling}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  noPet: { padding: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTexts: { flex: 1, gap: 2 },
  noPlanMark: { marginLeft: spacing.lg },
  headerTitle: { fontFamily: 'Sora', fontSize: 24, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 },
  headerSubtitle: { fontFamily: 'Inter', fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  content: { padding: spacing.lg, gap: spacing.md },
});
