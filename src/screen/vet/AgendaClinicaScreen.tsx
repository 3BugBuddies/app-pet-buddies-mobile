import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useContext, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActivePlansCard } from '../../component/vet-agenda/ActivePlansCard';
import { AgendaHeroCard } from '../../component/vet-agenda/AgendaHeroCard';
import { HomePendingCard } from '../../component/vet-agenda/HomePendingCard';
import { NextPatientsCard, type NextPatientItem } from '../../component/vet-agenda/NextPatientsCard';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useAppointments } from '../../control/useAppointmentsControl';
import { AuthContext } from '../../context/authContext';
import { useLogoutControl } from '../../control/authControl';
import { useClinicPets } from '../../control/usePetsControl';
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

  const [walkInModalVisible, setWalkInModalVisible] = useState(false);
  const [busca, setBusca] = useState('');

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

  const filteredPets = useMemo(() => {
    if (!pets) return [];
    const termo = busca.trim().toLowerCase();
    if (!termo) return pets;
    return pets.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        (p.raca ?? '').toLowerCase().includes(termo)
    );
  }, [pets, busca]);

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

  const handleStartWalkIn = (petId: string) => {
    setWalkInModalVisible(false);
    navigation.navigate('PacientesTab', { screen: 'ProntuarioForm', params: { petId } });
  };

  const dateLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 130 }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.dateLabel}>{dateLabel}</Text>
            <Text style={styles.vetName}>Dra. {session?.nome ?? 'vet'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(session?.nome ?? 'V').charAt(0).toUpperCase()}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={sair} style={{ padding: 4 }}>
              <Ionicons name="log-out-outline" size={28} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        <Pressable
          style={styles.walkInButton}
          onPress={() => setWalkInModalVisible(true)}
        >
          <Ionicons name="flash" size={24} color={colors.textLight} />
          <Text style={styles.walkInText}>ATENDIMENTO IMEDIATO</Text>
        </Pressable>

        <AgendaHeroCard
          remaining={remaining}
          seenCount={seenCount}
          totalCount={totalCount}
          nextTime={nextItem?.time}
        />

        <NextPatientsCard
          items={items}
          onOpenPatient={(petId, consultaId) => navigation.navigate('PacientesTab', { screen: 'DetalhesPet', params: { petId, consultaId } })}
          onToggle={() => {}}
        />

        <Text
          style={styles.patientsLink}
          onPress={() => navigation.navigate('PacientesTab', { screen: 'Pacientes' })}
        >
          Ver todos os pacientes
        </Text>
      </ScrollView>

      {walkInModalVisible && (
        <View style={[styles.modalOverlay, { paddingTop: insets.top }]}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Encaixe Rápido</Text>
              <Pressable onPress={() => setWalkInModalVisible(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </Pressable>
            </View>
            <Text style={styles.modalSubtitle}>Selecione o paciente para iniciar o prontuário imediatamente.</Text>
            
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar pet por nome..."
                placeholderTextColor={colors.textMuted}
                value={busca}
                onChangeText={setBusca}
                autoFocus
              />
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}>
              {filteredPets.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum pet encontrado.</Text>
              ) : (
                filteredPets.map(pet => (
                  <Pressable key={pet.id} style={styles.petCard} onPress={() => handleStartWalkIn(pet.id!)}>
                    <Text style={styles.petCardName}>{pet.nome}</Text>
                    <Text style={styles.petCardDetail}>{pet.raca || pet.especie}</Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </>
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
  walkInButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: spacing.sm,
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  walkInText: {
    color: colors.textLight,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.lg,
    borderTopRightRadius: spacing.lg,
    height: '80%',
    paddingTop: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.textPrimary,
  },
  petCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  petCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  petCardDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.xl,
  }
});
