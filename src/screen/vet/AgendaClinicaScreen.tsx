import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useContext, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivePlansCard } from '../../component/vet-agenda/ActivePlansCard';
import { AgendaHeroCard } from '../../component/vet-agenda/AgendaHeroCard';
import { HomePendingCard } from '../../component/vet-agenda/HomePendingCard';
import { NextPatientsCard, type NextPatientItem } from '../../component/vet-agenda/NextPatientsCard';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useAppointments, useToggleAppointmentAttendance } from '../../control/useAppointmentsControl';
import { AuthContext } from '../../context/authContext';
import { useLogoutControl } from '../../control/authControl';
import { useClinicPets } from '../../control/usePetsControl';
// import { usePatients } from '../../control/usePatientsControl'; // Sprint 4: rota /pacientes-clinica não existe no Java v2.3.1
import type { HojeTabParamList, VetTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../styles/theme';
import { formatAppointmentDate } from '../../model/formatDate';

type AgendaClinicaNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HojeTabParamList, 'AgendaClinica'>,
  BottomTabNavigationProp<VetTabParamList>
>;

export function AgendaClinicaScreen() {
  const navigation = useNavigation<AgendaClinicaNavigationProp>();
  const insets = useSafeAreaInsets();
  const { session } = useContext(AuthContext);
  const { sair } = useLogoutControl();
  const { data: appointments, isLoading: isLoadingAppts, isError: isApptsError } = useAppointments();
  const { data: pets, isLoading: isLoadingPets } = useClinicPets();
  // const { data: patients, isLoading: isLoadingPatients } = usePatients(); // Sprint 4
  const toggleAttendance = useToggleAppointmentAttendance();

  const items: NextPatientItem[] = useMemo(() => {
    if (!appointments || !pets) return [];
    const hoje = new Date().toISOString().slice(0, 10);
    return appointments
      .slice()
      .filter((a) => a.date?.slice(0, 10) >= hoje)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((appointment) => {
        const pet = pets.find((p) => p.id === appointment.petId);
        return {
          id: appointment.id,
          petId: appointment.petId,
          dateLabel: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(appointment.date)),
          time: formatAppointmentDate(appointment.date).timeLabel,
          petName: pet?.nome ?? 'Paciente',
          reason: appointment.reason,
          seen: appointment.status === 'COMPLETED',
        };
      });
  }, [appointments, pets]);

  if (isLoadingAppts || isLoadingPets) {
    return <LoadingIndicator label="Carregando a agenda..." />;
  }

  if (isApptsError || !appointments) {
    return <LoadingIndicator label="Não foi possível carregar a agenda." />;
  }

  const seenCount = items.filter((item) => item.seen).length;
  const totalCount = items.length;
  const remaining = totalCount - seenCount;
  const nextItem = items.find((item) => !item.seen);

  // const pendingCount = patients.filter((patient) => patient.alert).length; // Sprint 4
  // const averageAdherence = patients.length > 0                             // Sprint 4
  //   ? Math.round(patients.reduce((sum, p) => sum + p.adherencePct, 0) / patients.length) : 0;

  const dateLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 130 }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
          <Text style={styles.vetName}>Dra. {session?.nome ?? 'vet'}</Text>
        </View>
        <Pressable onPress={sair}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(session?.nome ?? 'V').charAt(0).toUpperCase()}</Text>
          </View>
        </Pressable>
      </View>

      <AgendaHeroCard
        remaining={remaining}
        seenCount={seenCount}
        totalCount={totalCount}
        nextTime={nextItem?.time}
      />

      <NextPatientsCard
        items={items}
        onOpenPatient={(petId) => navigation.navigate('PacientesTab', { screen: 'DetalhesPet', params: { petId } })}
        onToggle={(id) => toggleAttendance.mutate(id)}
      />

      {/* Sprint 4: reativar quando /pacientes-clinica estiver disponível no Java
      <View style={styles.row}>
        <View style={styles.half}>
          <HomePendingCard count={pendingCount} />
        </View>
        <View style={styles.half}>
          <ActivePlansCard count={patients.length} adherencePct={averageAdherence} />
        </View>
      </View>
      */}

      <Text
        style={styles.patientsLink}
        onPress={() => navigation.navigate('PacientesTab', { screen: 'Pacientes' })}
      >
        Ver todos os pacientes
      </Text>
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
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  vetName: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.cardChia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '700',
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  patientsLink: {
    alignSelf: 'center',
    marginTop: spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
