import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useContext, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActivePlansCard } from '../../component/vet-agenda/ActivePlansCard';
import { AgendaHeroCard } from '../../component/vet-agenda/AgendaHeroCard';
import { HomePendingCard } from '../../component/vet-agenda/HomePendingCard';
import { NextPatientsCard, type NextPatientItem } from '../../component/vet-agenda/NextPatientsCard';
import { BrandMark } from '../../component/ui/BrandMark';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useAppointments, useVetCrmv } from '../../control/useAppointmentsControl';
import { AuthContext } from '../../context/authContext';
import { useLogoutControl } from '../../control/authControl';
import { useClinicPets } from '../../control/usePetsControl';
import { openClosing } from '../navigation/openClosing';
import type { HojeTabParamList, VetTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../../styles/theme';
import { formatAppointmentDate } from '../../model/formatDate';

import { useTabBarSpace } from '../navigation/useTabBarSpace';
type AgendaClinicaNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HojeTabParamList, 'AgendaClinica'>,
  BottomTabNavigationProp<VetTabParamList>
>;

export function AgendaClinicaScreen() {
  const navigation = useNavigation<AgendaClinicaNavigationProp>();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const { session } = useContext(AuthContext);
  const { sair } = useLogoutControl();
  const crmv = useVetCrmv();
  const { data: appointments, isLoading: isLoadingAppts, isError: isApptsError } = useAppointments();
  const { data: pets, isLoading: isLoadingPets } = useClinicPets();

  const items: NextPatientItem[] = useMemo(() => {
    if (!appointments || !pets) return [];
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return appointments
      .slice()
      .filter((a) => a.status !== 'CANCELED' && a.date?.slice(0, 10) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((appointment) => {
        const pet = pets.find((p) => p.id === appointment.petId);
        return {
          id: appointment.id,
          petId: appointment.petId,
          dateLabel: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(appointment.date)),
          time: formatAppointmentDate(appointment.date).timeLabel,
          petName: appointment.animalNome ?? pet?.nome ?? 'Paciente',
          reason: appointment.reason,
          seen: appointment.status === 'COMPLETED',
          isToday: appointment.date.slice(0, 10) === today,
        };
      });
  }, [appointments, pets]);

  if (isLoadingAppts || isLoadingPets) {
    return <LoadingIndicator label="Carregando a agenda..." />;
  }

  if (isApptsError || !appointments) {
    return <LoadingIndicator label="Não foi possível carregar a agenda." />;
  }

  // O resumo do card conta só as consultas de hoje; a lista abaixo segue mostrando as futuras.
  const todayItems = items.filter((item) => item.isToday);
  const seenCount = todayItems.filter((item) => item.seen).length;
  const totalCount = todayItems.length;
  const remaining = totalCount - seenCount;
  const nextItem = todayItems.find((item) => !item.seen);

  const startClosing = (params: { petId: string; consultaId?: string }) => {
    const tabs = navigation.getParent<BottomTabNavigationProp<VetTabParamList>>();
    if (tabs) openClosing(tabs, params);
  };

  const dateLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: tabBarSpace }]}>
        <View style={styles.header}>
          <View style={styles.identity}>
            <BrandMark />
            <View>
              <Text style={styles.dateLabel}>{dateLabel}</Text>
              <Text style={styles.vetName}>Dra. {session?.nome ?? 'vet'}</Text>
              {crmv ? <Text style={styles.crmv}>CRMV {crmv}</Text> : null}
            </View>
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

        <AgendaHeroCard
          remaining={remaining}
          seenCount={seenCount}
          totalCount={totalCount}
          nextTime={nextItem?.time}
        />

        <Pressable
          accessibilityRole="button"
          style={styles.walkInButton}
          onPress={() => navigation.navigate('AtenderAgora')}
        >
          <Ionicons name="flash-outline" size={22} color={colors.textLight} />
          <Text style={styles.walkInText}>Atender agora · sem agenda</Text>
        </Pressable>

        <NextPatientsCard
          items={items}
          onOpenPatient={(petId, consultaId) => navigation.navigate('PacientesTab', { screen: 'DetalhesPet', params: { petId, consultaId } })}
          onAttend={(petId, consultaId) => startClosing({ petId, consultaId })}
        />

      </ScrollView>

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
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  crmv: {
    fontSize: 14,
    color: colors.textSecondary,
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
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  walkInButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  walkInText: {
    color: colors.textLight,
    fontWeight: '700',
    fontSize: 17,
  }
});
