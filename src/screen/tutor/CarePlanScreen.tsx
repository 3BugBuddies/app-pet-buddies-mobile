import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClinicRow } from '../../component/care-plan/ClinicRow';
import { ProgressBarCard } from '../../component/care-plan/ProgressBarCard';
import { TaskListCard } from '../../component/care-plan/TaskListCard';
import { WeekStrip } from '../../component/care-plan/WeekStrip';
import { Button } from '../../component/ui/Button';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useAppointments } from '../../control/useAppointmentsControl';
import { useCarePlan, useToggleCareTask } from '../../control/useCarePlanControl';
import { usePets } from '../../control/usePetsControl';
import type { PlanoTabParamList } from '../navigation/types';
import { colors, spacing } from '../../styles/theme';
import { formatAppointmentDate } from '../../model/formatDate';
import { LogoHeader } from '../../component/ui/LogoHeader';

type Props = NativeStackScreenProps<PlanoTabParamList, 'CarePlan'>;

export function CarePlanScreen({ route }: Props) {
  const { data: pets, isLoading: isLoadingPets, isError: isPetsError } = usePets();
  const petId = route.params?.petId ?? pets?.[0]?.id ?? '';
  const navigation = useNavigation<NativeStackNavigationProp<PlanoTabParamList>>();
  const { data: plan, isLoading: isLoadingPlan, isError: isPlanError } = useCarePlan(petId);
  const { data: appointments, isLoading: isLoadingAppointments } = useAppointments();
  const toggleTask = useToggleCareTask(petId);
  const insets = useSafeAreaInsets();

  const nextAppointment = useMemo(() => {
    if (!appointments) return undefined;
    return appointments
      .filter((appointment) => appointment.petId === petId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, [appointments, petId]);

  if (isLoadingPets || isLoadingPlan || isLoadingAppointments) {
    return <LoadingIndicator label="Carregando o plano de cuidado..." />;
  }

  if (isPetsError || isPlanError || !plan || !petId) {
    return <LoadingIndicator label="Não foi possível carregar o plano." />;
  }

  const doneCount = plan.tasks.filter((task) => task.completed).length;
  const pointsToday = plan.tasks.reduce(
    (sum, task) => (task.completed ? sum + task.points : sum),
    0
  );

  const handleStartCheckIn = () => {
    navigation.navigate('CheckInEntry', { petId });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 140 }]}>
        <LogoHeader size="small" />
        <Text
          style={styles.assistantLink}
          onPress={() => navigation.navigate('AssistantNotice', { petId })}
        >
          Tirar dúvidas
        </Text>

        <View style={styles.header}>
          <Text style={styles.weekLabel}>{plan.weekLabel}</Text>
          <Text style={styles.title}>Cuidado</Text>
        </View>

        <WeekStrip days={plan.weekDays} />

        <ProgressBarCard doneCount={doneCount} totalCount={plan.tasks.length} pointsToday={pointsToday} />

        <Text style={styles.sectionLabel}>Cuidados de hoje</Text>
        <TaskListCard tasks={plan.tasks} onToggle={(id) => toggleTask.mutate(id)}>
          <Button
            label="Check-in do cuidado"
            backgroundColor={colors.warning}
            textColor={colors.textLight}
            onPress={handleStartCheckIn}
          />
        </TaskListCard>


        <Text style={styles.sectionLabel}>Clínica</Text>
        {nextAppointment ? (
          <ClinicRow
            dayNumber={new Date(nextAppointment.date).getDate().toString()}
            title={nextAppointment.reason}
            whenLabel={`${formatAppointmentDate(nextAppointment.date).dayLabel} · ${formatAppointmentDate(nextAppointment.date).timeLabel}`}
            tagLabel="agendada"
          />
        ) : (
          <ClinicRow dayNumber="–" title="Sem consultas" whenLabel="Nada agendado" tagLabel="" />
        )}
      </ScrollView>


    </View>
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
  assistantLink: {
    alignSelf: 'flex-end',
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  header: {
    gap: 2,
  },
  weekLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.success,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    // TutorTabs.tsx tem a tab bar flutuante com bottom:24 + height:64 (=88px)
    // sobre o conteúdo (tabBarStyle é position:absolute, então a tela não
    // ganha esse respiro de graça). Sem isso o botão fica atrás da tab bar.
    paddingBottom: 88 + spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
