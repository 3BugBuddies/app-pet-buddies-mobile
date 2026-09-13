import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useContext, useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ClinicCard } from '../../component/home/ClinicCard';
import { GreetingHeader } from '../../component/home/GreetingHeader';
import { HeroPetCard } from '../../component/home/HeroPetCard';
import { PlanProgressCard } from '../../component/home/PlanProgressCard';
import { TodayTasksCard } from '../../component/home/TodayTasksCard';
import { Button } from '../../component/ui/Button';
import { ErrorState } from '../../component/ui/ErrorState';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { AuthContext } from '../../context/authContext';
import { useAppointments } from '../../control/useAppointmentsControl';
import { useCarePlan, useToggleCareTask } from '../../control/useCarePlanControl';
import { usePets } from '../../control/usePetsControl';
import type { HomeTabParamList, TutorTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';
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
  const { data: appointments, isLoading: isLoadingAppointments } = useAppointments(pet?.id ?? undefined);
  const { data: plan, isLoading: isLoadingPlan, isError: isPlanError, refetch: refetchPlan } = useCarePlan(pet?.id ?? '');
  const toggleTask = useToggleCareTask(pet?.id ?? '');

  const nextAppointment = useMemo(() => {
    if (!appointments || !pet) return undefined;

    const hoje = new Date().toISOString().slice(0, 10);

    return appointments
      .filter(
        (appointment) =>
          appointment.petId === String(pet.id) &&
          appointment.date?.slice(0, 10) >= hoje &&
          appointment.status !== 'CANCELED' &&
          appointment.status !== 'COMPLETED'
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, [appointments, pet]);

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
  if (isLoadingAppointments || isLoadingPlan) {
    return <LoadingIndicator label="Carregando sua home..." />;
  }

  if (isPetsError || !pet) {
    return (
      <ErrorState
        type="500"
        title="Ops, algo deu errado"
        message="Não foi possível carregar os dados principais do seu pet."
        onRetry={() => refetchPlan()}
        retryLabel="Tentar novamente"
      />
    );
  }

  // Degradação graciosa: se não há plano (404 ou vazio), a Home renderiza normalmente
  const hasPlan = !isPlanError && plan && plan.tasks && plan.tasks.length > 0;
  const doneCount = hasPlan ? plan.tasks.filter((task) => task.completed).length : 0;
  const totalCount = hasPlan ? plan.tasks.length : 0;
  const tasks = hasPlan ? plan.tasks : [];

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

          {hasPlan ? (
            <>
              <Pressable
                onPress={() =>
                  navigation.navigate('PlanoTab', { screen: 'CarePlan', params: { petId: pet.id! } })
                }
              >
                <PlanProgressCard
                  weekLabel={plan.weekLabel}
                  doneCount={doneCount}
                  totalCount={totalCount}
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
            </>
          ) : (
            <>
              {/* UX/PO: Upsell / Prevenção */}
              <Pressable
                onPress={() => navigation.navigate('AgendaTab', { screen: 'AgendamentoTutor' })}
              >
                <View style={[styles.fallbackCard, { backgroundColor: colors.cardChia }]}>
                  <View style={styles.fallbackHeader}>
                    <Text style={styles.fallbackTitle}>Saúde em dia! ✨</Text>
                    <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.fallbackSub}>
                    Nenhum tratamento médico prescrito no momento. A prevenção é o melhor cuidado para uma vida longa.
                  </Text>
                  <Text style={styles.fallbackAction}>Agendar check-up preventivo {'>'}</Text>
                </View>
              </Pressable>

              {/* UX/PO: Engajamento / Dica de Ouro */}
              <View style={[styles.fallbackCard, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
                <View style={styles.fallbackHeader}>
                  <Text style={styles.fallbackTitle}>Dica de ouro</Text>
                  <Ionicons name="water" size={20} color={colors.primary} />
                </View>
                <Text style={styles.fallbackSub}>
                  A hidratação é fundamental! Mantenha os potes de água sempre limpos e frescos, espalhados pela casa para incentivar {pet.nome} a beber mais.
                </Text>
              </View>
            </>
          )}

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
              {/* Painted Door — Pata Segura chega na próxima Sprint */}
              <Pressable
                style={styles.half}
                onPress={() => navigation.navigate('Score', { petId: pet.id! })}
              >
                <View style={[styles.fallbackCard, { backgroundColor: colors.cardMax, flex: 1, minHeight: 160 }]}>
                  <View style={styles.fallbackHeader}>
                    <Text style={styles.fallbackTitle}>Pata Segura</Text>
                    <Ionicons name="star" size={20} color={colors.accent} />
                  </View>
                  <Text style={[styles.fallbackSub, { marginTop: 'auto' }]}>
                    O programa de recompensas do seu pet está chegando!
                  </Text>
                  <Text style={styles.fallbackAction}>Saiba mais {'>'}</Text>
                </View>
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
  fallbackCard: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  fallbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  fallbackTitle: {
    fontFamily: 'Sora',
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  fallbackSub: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  fallbackAction: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginTop: spacing.sm,
  },
});
