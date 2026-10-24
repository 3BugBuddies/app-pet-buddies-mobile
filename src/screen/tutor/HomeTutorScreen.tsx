import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useContext, useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClinicCard } from '../../component/home/ClinicCard';
import { PataSeguraCard } from '../../component/home/PataSeguraCard';
import { GreetingHeader } from '../../component/home/GreetingHeader';
import { HeroPetCard } from '../../component/home/HeroPetCard';
import { PreventiveCard } from '../../component/care-plan/PreventiveCard';
import { SuspendedTreatmentCard } from '../../component/care-plan/SuspendedTreatmentCard';
import { TodayAtHomeCard } from '../../component/care-plan/TodayAtHomeCard';
import { FreeWeekCard, TreatmentWeekCard } from '../../component/care-plan/TreatmentWeekCard';
import { Button } from '../../component/ui/Button';
import { ErrorState } from '../../component/ui/ErrorState';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { AuthContext } from '../../context/authContext';
import { useAppointments, useWeekFreeDates } from '../../control/useAppointmentsControl';
import { useLogoutControl } from '../../control/authControl';
import { useCarePlan } from '../../control/useCarePlanControl';
import { useActivePetId, usePets } from '../../control/usePetsControl';
import type { HomeTabParamList, TutorTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';
import { formatAppointmentDate, greetingForNow } from '../../model/formatDate';
import { treatmentsOf } from '../../model/care';
import {
  activeTreatmentWeek,
  freeWeek,
  openPreventiveItems,
  planStateLabel,
  suspendedTreatmentWeek,
  todayIso,
  todayTreatmentItems,
  upcomingVisit,
  weekEndIso,
  type WeekDayCell,
} from '../../model/careHome';
import { formatDateBR } from '../../model/formatDate';
import { breedLabel, sexLabel, type Pet } from '../../model/pet';
import { useTabBarSpace } from '../navigation/useTabBarSpace';

function petDetails(pet: Pet): string {
  const weight = pet.peso ? `${String(pet.peso).replace('.', ',')} kg` : null;
  const birth = !weight && pet.dataNascimento ? `nasceu em ${formatDateBR(pet.dataNascimento)}` : null;
  return [breedLabel(pet.raca), sexLabel(pet.sexo).toLowerCase(), weight, birth].filter(Boolean).join(' · ');
}

type HomeTutorNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeTabParamList, 'HomeTutor'>,
  BottomTabNavigationProp<TutorTabParamList>
>;

export function HomeTutorScreen() {
  const navigation = useNavigation<HomeTutorNavigationProp>();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const { session } = useContext(AuthContext);
  const { sair } = useLogoutControl();
  const { data: pets, isLoading: isLoadingPets, isError: isPetsError } = usePets();

  // UX: Context Selector — pet ativo sincronizado globalmente entre as abas
  const { activePetId, setActivePetId } = useActivePetId();

  const activePet = useMemo(
    () => pets?.find((p) => String(p.id) === activePetId) ?? pets?.[0],
    [pets, activePetId],
  );

  // Hooks reativos ao pet selecionado — sempre no topo, sem condicionais
  const { data: appointments, isLoading: isLoadingAppointments } = useAppointments(activePet?.id ?? undefined);
  const { data: plan, isLoading: isLoadingPlan, isError: isPlanError, refetch: refetchPlan } = useCarePlan(activePet?.id ?? '');

  const openCheckIn = () => {
    if (!activePet?.id) return;
    navigation.navigate('PlanoTab', { screen: 'CheckInEntry', params: { petId: activePet.id } });
  };

  const openScheduling = () => {
    if (!activePet?.id) return;
    navigation.navigate('AgendaTab', {
      screen: 'AgendamentoTutor',
      params: { petId: String(activePet.id), reason: 'Vacinação' },
    });
  };

  const weekStart = todayIso();
  const nextAppointment = useMemo(
    () => upcomingVisit(appointments, activePet?.id ? String(activePet.id) : undefined, weekStart),
    [appointments, activePet, weekStart],
  );
  const { data: weekFreeDates } = useWeekFreeDates(weekStart, weekEndIso(weekStart), !!activePet);

  const openWeekDay = (day: WeekDayCell) => {
    if (!activePet?.id) return;
    navigation.navigate('AgendaTab', {
      screen: 'AgendamentoTutor',
      params: day.dot === 'APPOINTMENT' ? undefined : { petId: String(activePet.id), date: day.iso },
    });
  };

  // 1. Aguarda lista de pets
  if (isLoadingPets) {
    return <LoadingIndicator label="Carregando sua home..." />;
  }

  // 2. Tutor recém-cadastrado sem pets
  const temPets = pets && pets.length > 0;
  if (!temPets) {
    return (
      <View style={[styles.screen, styles.emptyStateContainer, { paddingTop: Math.max(insets.top, 20) }]}>
        <GreetingHeader
          greeting={greetingForNow()}
          userName={session?.nome?.split(' ')[0] ?? 'responsável'}
          onAvatarPress={() => navigation.navigate('HomeTab', { screen: 'MinhaConta' })}
          onLogout={sair}
        />
        <View style={styles.emptyStateContent}>
          <Image
            source={require('../../../assets/images/amigos-tranparentes.png')}
            style={styles.emptyStateImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyStateTitle}>Cadastre o primeiro pet para a clínica montar o plano.</Text>
          <Text style={styles.emptyStateBody}>
            Com o pet cadastrado, o plano preventivo aparece aqui.
          </Text>
          <Button
            label="Cadastrar pet"
            backgroundColor={colors.action}
            onPress={() => navigation.navigate('PetTab', { screen: 'NovoPet' })}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </View>
    );
  }

  // 3. Aguarda hooks dependentes
  if (isLoadingAppointments || isLoadingPlan) {
    return <LoadingIndicator label="Carregando sua home..." />;
  }

  if (isPetsError || !activePet) {
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

  const carePlan = !isPlanError && plan ? plan : null;
  const today = todayIso();
  const treatmentWeek = carePlan ? activeTreatmentWeek(carePlan, today) : null;
  const suspendedWeek = carePlan ? suspendedTreatmentWeek(carePlan, today) : null;
  const todayItems = carePlan && treatmentWeek ? todayTreatmentItems(carePlan, today) : [];
  const preventive = carePlan ? openPreventiveItems(carePlan) : [];
  const onlyPreventive = !!carePlan && !treatmentWeek && !carePlan.suspended;

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 20) }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}
        showsVerticalScrollIndicator={false}
      >
        <GreetingHeader
          greeting={greetingForNow()}
          petName={activePet.nome}
          userName={session?.nome?.split(' ')[0] ?? 'responsável'}
          onAvatarPress={() => navigation.navigate('HomeTab', { screen: 'MinhaConta' })}
          onLogout={sair}
        />

        {/* Context Selector: carrossel só aparece quando há mais de 1 pet */}
        {pets.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.petSelectorRow}
          >
            {pets.map((p) => {
              const isSelected = String(p.id) === activePetId;
              return (
                <Pressable
                  key={p.id}
                  style={[styles.petSelectorChip, isSelected && styles.petSelectorChipActive]}
                  onPress={() => setActivePetId(String(p.id))}
                >
                  <View style={[styles.petSelectorAvatar, isSelected && styles.petSelectorAvatarActive]}>
                    <Text style={[styles.petSelectorAvatarText, isSelected && styles.petSelectorAvatarTextActive]}>
                      {p.nome.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.petSelectorName, isSelected && styles.petSelectorNameActive]}>
                    {p.nome}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.bento}>
          <HeroPetCard
            petNames={activePet.nome}
            stateLabel={planStateLabel(carePlan, today)}
            details={petDetails(activePet)}
          />

          {carePlan?.suspended ? (
            <SuspendedTreatmentCard
              medications={carePlan.suspended.medications}
              suspendedAt={carePlan.suspended.at}
              week={suspendedWeek}
              clinic={carePlan.clinic}
            />
          ) : null}

          {todayItems.length > 0 ? (
            <TodayAtHomeCard
              items={todayItems}
              treatments={carePlan ? treatmentsOf(carePlan) : []}
              petName={activePet.nome}
              petSex={activePet.sexo}
              onPress={openCheckIn}
            />
          ) : null}

          {treatmentWeek ? (
            <TreatmentWeekCard
              week={treatmentWeek}
              onSeeCare={() =>
                navigation.navigate('PlanoTab', { screen: 'CarePlan', params: { petId: activePet.id! } })
              }
            />
          ) : null}

          {onlyPreventive ? (
            <FreeWeekCard week={freeWeek(today, nextAppointment, weekFreeDates ?? [])} onPressDay={openWeekDay} />
          ) : null}

          {!treatmentWeek && preventive.length > 0 ? (
            <PreventiveCard
              title="Próximos cuidados"
              items={preventive}
              highlightNext={onlyPreventive}
              footnote={onlyPreventive ? 'Vacinas anteriores ao cadastro: registre na consulta.' : undefined}
              onPressItem={openScheduling}
            />
          ) : null}

          <View style={styles.row}>
            <View style={styles.half}>
              <Pressable
                style={styles.half}
                onPress={() => navigation.navigate('AgendaTab', { screen: 'AgendamentoTutor' })}
              >
                {nextAppointment ? (
                  <ClinicCard
                    title={nextAppointment.reason}
                    dayLabel={formatAppointmentDate(nextAppointment.date).dayLabel}
                    timeLabel={formatAppointmentDate(nextAppointment.date).timeLabel}
                  />
                ) : (
                  <ClinicCard
                    title="Sem consulta"
                    hint={preventive.length > 0 ? 'toque num cuidado para agendar' : 'toque para agendar'}
                  />
                )}
              </Pressable>
            </View>
            <View style={styles.half}>
              <Pressable
                style={styles.half}
                accessibilityRole="button"
                onPress={() => navigation.navigate('HomeTab', { screen: 'PataSegura' })}
              >
                <PataSeguraCard />
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
  // Context Selector styles
  petSelectorRow: {
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  petSelectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  petSelectorChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  petSelectorAvatar: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    backgroundColor: colors.cardChia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petSelectorAvatarActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  petSelectorAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  petSelectorAvatarTextActive: {
    color: colors.textLight,
  },
  petSelectorName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  petSelectorNameActive: {
    color: colors.textLight,
  },
});
