import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useContext, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClinicCard } from '../../component/home/ClinicCard';
import { GreetingHeader } from '../../component/home/GreetingHeader';
import { HeroPetCard } from '../../component/home/HeroPetCard';
import { PlanProgressCard } from '../../component/home/PlanProgressCard';
import { PointsCard } from '../../component/home/PointsCard';
import { TodayTasksCard } from '../../component/home/TodayTasksCard';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { AuthContext } from '../../context/authContext';
import { useAppointments } from '../../control/useAppointmentsControl';
import { useCarePlan, useToggleCareTask } from '../../control/useCarePlanControl';
import { usePets } from '../../control/usePetsControl';
import { useScore } from '../../control/useScoreControl';
import type { HomeTabParamList, TutorTabParamList } from '../navigation/types';
import { colors, spacing } from '../../styles/theme';
import { formatAppointmentDate, greetingForNow } from '../../model/formatDate';

type HomeTutorNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeTabParamList, 'HomeTutor'>,
  BottomTabNavigationProp<TutorTabParamList>
>;

export function HomeTutorScreen() {
  const navigation = useNavigation<HomeTutorNavigationProp>();
  const insets = useSafeAreaInsets();
  const { session } = useContext(AuthContext);
  const { data: pets, isLoading: isLoadingPets, isError: isPetsError } = usePets();
  const pet = pets?.[0];

  const { data: appointments, isLoading: isLoadingAppointments } = useAppointments();
  const { data: plan, isLoading: isLoadingPlan } = useCarePlan(pet?.id ?? '');
  const { data: score, isLoading: isLoadingScore } = useScore(pet?.id ?? '');
  const toggleTask = useToggleCareTask(pet?.id ?? '');

  const nextAppointment = useMemo(() => {
    if (!appointments || !pet) return undefined;
    return appointments
      .filter((appointment) => appointment.petId === pet.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, [appointments, pet]);

  const tasks = plan?.tasks ?? [];

  if (isLoadingPets || isLoadingAppointments || isLoadingPlan || isLoadingScore) {
    return <LoadingIndicator label="Carregando sua home..." />;
  }

  if (isPetsError || !pet || !plan || !score) {
    return <LoadingIndicator label="Não foi possível carregar seus pets." />;
  }

  const doneCount = tasks.filter((task) => task.completed).length;

  const petNames =
    pets && pets.length > 1
      ? pets.map((p) => p.nome).join(' & ')
      : pet.nome;

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 20) }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <GreetingHeader
          greeting={`${greetingForNow()},`}
          petName={pet.nome}
          userName={session?.nome?.split(' ')[0] ?? 'Tutor'}
          onAvatarPress={() =>
            navigation.navigate('PetTab', { screen: 'PetProfile', params: { petId: pet.id! } })
          }
        />

        <View style={styles.bento}>
          <HeroPetCard petNames={petNames} />

          <Pressable
            onPress={() =>
              navigation.navigate('PlanoTab', { screen: 'CarePlan', params: { petId: pet.id! } })
            }
          >
            <PlanProgressCard
              weekLabel={plan.weekLabel}
              doneCount={doneCount}
              totalCount={tasks.length}
            />
          </Pressable>

          <TodayTasksCard
            tasks={tasks.map((task) => ({
              id: task.id,
              title: task.title,
              time: task.time,
              done: task.completed,
            }))}
            onToggle={(id) => toggleTask.mutate(id)}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              {nextAppointment ? (
                <ClinicCard
                  title={nextAppointment.reason}
                  dayLabel={formatAppointmentDate(nextAppointment.date).dayLabel}
                  timeLabel={formatAppointmentDate(nextAppointment.date).timeLabel}
                />
              ) : (
                <ClinicCard title="Sem consultas agendadas" />
              )}
            </View>
            <View style={styles.half}>
              <Pressable
                style={styles.half}
                onPress={() => navigation.navigate('Score', { petId: pet.id! })}
              >
                <PointsCard
                  points={score.totalPoints}
                  tierLabel={`Tier ${score.tier} · ${score.pointsToNextTier} p/ ${score.nextTier}`}
                  filledDots={2}
                  totalDots={3}
                />
              </Pressable>
            </View>
          </View>
        </View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  bento: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
});
