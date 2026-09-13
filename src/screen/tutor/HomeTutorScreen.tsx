import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useContext, useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClinicCard } from '../../component/home/ClinicCard';
import { GreetingHeader } from '../../component/home/GreetingHeader';
import { HeroPetCard } from '../../component/home/HeroPetCard';
import { PlanProgressCard } from '../../component/home/PlanProgressCard';
import { PointsCard } from '../../component/home/PointsCard';
import { TodayTasksCard } from '../../component/home/TodayTasksCard';
import { Button } from '../../component/ui/Button';
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

  // Hooks dependentes devem ficar no topo — regra do React, nunca dentro de if
  const { data: appointments, isLoading: isLoadingAppointments } = useAppointments(pet?.id);
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

  // 1. Aguarda lista de pets
  if (isLoadingPets) {
    return <LoadingIndicator label="Carregando sua home..." />;
  }

  // 2. Tutor recém-cadastrado sem pets — guia para o onboarding
  const temPets = pets && pets.length > 0;
  if (!temPets) {
    return (
      <View style={[styles.screen, styles.emptyStateContainer, { paddingTop: Math.max(insets.top, 20) }]}>
        <GreetingHeader
          greeting={`${greetingForNow()},`}
          userName={session?.nome?.split(' ')[0] ?? 'Tutor'}
        />
        <View style={styles.emptyStateContent}>
          <Image
            source={require('../../../assets/images/amigos-tranparentes.png')}
            style={styles.emptyStateImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyStateTitle}>Bem-vindo ao Pet Buddies!</Text>
          <Text style={styles.emptyStateBody}>
            Seu app de cuidado inteligente. Para começar a acompanhar a saúde e ganhar pontos,
            adicione seu primeiro companheiro.
          </Text>
          <Button
            label="Cadastrar meu primeiro Pet"
            onPress={() => navigation.navigate('PetTab', { screen: 'NovoPet' })}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </View>
    );
  }

  // 3. Aguarda hooks dependentes (só roda quando há pelo menos 1 pet)
  if (isLoadingAppointments || isLoadingPlan || isLoadingScore) {
    return <LoadingIndicator label="Carregando sua home..." />;
  }

  if (isPetsError || !pet || !plan || !score) {
    return <LoadingIndicator label="Não foi possível carregar seus dados." />;
  }

  const doneCount = tasks.filter((task) => task.completed).length;

  const petNames =
    pets.length > 1 ? pets.map((p) => p.nome).join(' & ') : pet.nome;

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 20) }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 140 }]}
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
  emptyStateContainer: {
    paddingHorizontal: spacing.lg,
  },
  emptyStateContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: 60,
  },
  emptyStateImage: {
    width: 220,
    height: 180,
    marginBottom: spacing.sm,
  },
  emptyStateTitle: {
    fontFamily: 'Sora',
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptyStateBody: {
    fontFamily: 'Inter',
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
});
