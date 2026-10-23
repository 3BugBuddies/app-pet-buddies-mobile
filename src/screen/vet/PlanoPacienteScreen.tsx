import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { CareItemsSection } from '../../component/care-plan/CareItemsSection';
import { NoPlanState } from '../../component/care-plan/NoPlanState';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useCarePlan } from '../../control/useCarePlanControl';
import { usePet } from '../../control/usePetsControl';
import type { PacientesTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../styles/theme';

type Props = NativeStackScreenProps<PacientesTabParamList, 'PlanoPaciente'>;

export function PlanoPacienteScreen({ route }: Props) {
  const { petId } = route.params;
  const insets = useSafeAreaInsets();
  const { data: pet, isLoading: isLoadingPet } = usePet(petId);
  const { data: plan, isLoading: isLoadingPlan, isError } = useCarePlan(petId);

  if (isLoadingPet || isLoadingPlan) {
    return <LoadingIndicator label="Carregando o plano..." />;
  }

  if (!isError && plan === null && pet) {
    return <NoPlanState petName={pet.nome} />;
  }

  if (isError || !plan || !pet) {
    return <LoadingIndicator label="Não foi possível carregar o plano." />;
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 80 }]}
    >
      <Text style={styles.title}>Cuidados de {pet.nome}</Text>
      <CareItemsSection
        title="Preventivo"
        items={plan.items.filter((item) => !item.treatment)}
        emptyText="Nenhum cuidado preventivo agendado."
      />
      <CareItemsSection
        title="Tratamento"
        items={plan.items.filter((item) => item.treatment)}
        emptyText="Nenhum tratamento em andamento."
      />
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
  },
  title: {
    fontFamily: 'Sora',
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
