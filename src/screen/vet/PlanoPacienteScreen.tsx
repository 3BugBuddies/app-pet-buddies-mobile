import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CareItemsSection } from '../../component/care-plan/CareItemsSection';
import { NoPlanState } from '../../component/care-plan/NoPlanState';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useCarePlan } from '../../control/useCarePlanControl';
import { treatmentOverview } from '../../model/treatmentSummary';
import { usePet } from '../../control/usePetsControl';
import type { PacientesTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';

import { useTabBarSpace } from '../navigation/useTabBarSpace';
type Props = NativeStackScreenProps<PacientesTabParamList, 'PlanoPaciente'>;

export function PlanoPacienteScreen({ route }: Props) {
  const { petId } = route.params;
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
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

  const treatmentItems = plan.items.filter((item) => item.treatment);
  const overview = treatmentOverview(treatmentItems, todayIso());
  // Com um medicamento a tela é a de sempre; o bloco e o agrupamento entram a partir de dois.
  const multi = (overview?.names.length ?? 0) > 1;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: tabBarSpace }]}
    >
      <Text style={styles.title}>Cuidados de {pet.nome}</Text>
      <CareItemsSection
        title="Preventivo"
        items={plan.items.filter((item) => !item.treatment)}
        emptyText="Nenhum cuidado preventivo agendado."
      />
      {multi && overview ? (
        <View style={styles.overview}>
          <Text style={styles.overviewLabel}>Tratamento</Text>
          <Text style={styles.overviewTitle}>{overview.names.join(' + ')}</Text>
          <Text style={styles.overviewSub}>
            {overview.finished ? 'encerrado' : `dia ${overview.day} de ${overview.totalDays}`}
          </Text>
        </View>
      ) : null}
      <CareItemsSection
        title="Tratamento"
        items={treatmentItems}
        emptyText="Nenhum tratamento em andamento."
        grouped={multi}
      />
    </ScrollView>
  );
}

const todayIso = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  overview: { backgroundColor: colors.cardAlert, borderRadius: radii.lg, padding: spacing.md, gap: spacing.xs },
  overviewLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  overviewTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  overviewSub: { fontSize: 14, color: colors.textSecondary },
  title: {
    fontFamily: 'Sora',
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
