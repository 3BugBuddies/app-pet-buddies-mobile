import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppointments, useDeleteAppointment } from '../../control/useAppointmentsControl';
import { formatAppointmentDate } from '../../model/formatDate';
import { VaccineListCard } from '../../component/pet-profile/VaccineListCard';
import { Button } from '../../component/ui/Button';
import { ErrorState } from '../../component/ui/ErrorState';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import useMedicalRecordControl from '../../control/useMedicalRecordControl';
import { usePet, usePetProfileDetails } from '../../control/usePetsControl';
import { usePatients } from '../../control/usePatientsControl';
import { useProcedures } from '../../control/useProcedureControl';
import type { PetVaccine } from '../../model/care';
import type { PacientesTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';

type Props = NativeStackScreenProps<PacientesTabParamList, 'DetalhesPet'>;

type TabKey = 'HISTORICO' | 'AGENDAMENTOS' | 'VACINAS' | 'EXAMES' | 'PLANO';

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Realizado',
  CANCELED: 'Cancelado',
};

const TABS: { key: TabKey; label: string }[] = [
  { key: 'HISTORICO', label: 'Histórico' },
  { key: 'AGENDAMENTOS', label: 'Agenda' },
  { key: 'VACINAS', label: 'Vacinas' },
  { key: 'EXAMES', label: 'Exames' },
  { key: 'PLANO', label: 'Plano' },
];

function formatDataBR(dataISO?: string | null): string {
  if (!dataISO) return '—';
  const [ano, mes, dia] = dataISO.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

function calcIdadeLabel(dataNascimento?: string | null): string {
  if (!dataNascimento) return 'Idade desconhecida';
  const nascimento = new Date(dataNascimento);
  if (isNaN(nascimento.getTime())) return 'Idade desconhecida';
  const hoje = new Date();
  const anos = hoje.getFullYear() - nascimento.getFullYear();
  const ajuste = hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate()) ? 1 : 0;
  const idadeAnos = anos - ajuste;
  if (idadeAnos < 1) {
    const meses = (hoje.getFullYear() - nascimento.getFullYear()) * 12 +
      (hoje.getMonth() - nascimento.getMonth());
    return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  }
  return `${idadeAnos} ${idadeAnos === 1 ? 'ano' : 'anos'}`;
}

export function DetalhesPetScreen({ route }: Props) {
  const { petId, consultaId } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList>>();
  const insets = useSafeAreaInsets();
  const { data: pet, isLoading: isLoadingPet, isError: isPetError } = usePet(petId);
  const { data: profile } = usePetProfileDetails(petId);
  const { data: patients } = usePatients();
  const patientData = patients?.find((p) => p.petId === petId);
  const tutorName = patientData?.tutorName || 'N/A';
  const tutorAddress = patientData?.endereco;
  const tutorPhone = patientData?.telefone;

  const { data: procedimentos, isLoading: isLoadingProcedimentos } = useProcedures(petId);
  const { registros: records, carregandoRegistros: isLoadingRecords } = useMedicalRecordControl(petId);
  const { data: appointments, isLoading: isLoadingAppts } = useAppointments(petId);
  const deleteAppointment = useDeleteAppointment();
  const [activeTab, setActiveTab] = useState<TabKey>('HISTORICO');

  const handleCancelAppt = (id: string) => {
    Alert.alert(
      'Cancelar Consulta',
      'Tem certeza que deseja cancelar esta consulta? O horário será liberado na sua agenda.',
      [
        { text: 'Voltar', style: 'cancel' },
        { text: 'Sim, Cancelar', style: 'destructive', onPress: () => deleteAppointment.mutate(id) },
      ]
    );
  };

  const handleRescheduleAppt = (id: string) => {
    Alert.alert(
      'Reagendar Consulta',
      'Isso irá cancelar o horário atual e liberar a agenda. O tutor deverá marcar uma nova data pelo aplicativo dele. Deseja prosseguir?',
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Cancelar e Avisar Tutor',
          style: 'default',
          onPress: () => deleteAppointment.mutate(id),
        },
      ]
    );
  };

  const handleOpenMaps = () => {
    if (!tutorAddress) return;
    import('react-native').then(({ Linking, Platform }) => {
      const url = Platform.select({
        ios: `maps://app?daddr=${encodeURIComponent(tutorAddress)}`,
        android: `google.navigation:q=${encodeURIComponent(tutorAddress)}`,
        default: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tutorAddress)}`,
      });
      Linking.openURL(url as string);
    });
  };

  const vaccinesList = useMemo((): PetVaccine[] => {
    if (!procedimentos) return [];
    return procedimentos
      .filter((p) => p.tipo === 'VACINACAO')
      .map((p) => {
        const aplicada = p.status === 'REALIZADO';
        const dataFormatada = formatDataBR(p.dataPrevistaInicio);
        return {
          id: p.id.toString(),
          name: p.nome,
          status: aplicada ? 'APPLIED' : 'SCHEDULED',
          dateLabel: `${dataFormatada} · ${aplicada ? 'aplicada' : 'agendada'}`,
        };
      });
  }, [procedimentos]);

  if (isLoadingPet || isLoadingProcedimentos) {
    return <LoadingIndicator label="Carregando o pet..." />;
  }

  if (isPetError || !pet) {
    return (
      <ErrorState
        type="500"
        message="Não foi possível carregar as informações do pet."
        onRetry={() => navigation.goBack()}
        retryLabel="Voltar"
      />
    );
  }

  const pesoLabel = pet.peso ? `${pet.peso.toString().replace('.', ',')} kg` : null;
  const idadeLabel = calcIdadeLabel(pet.dataNascimento);
  const castradoLabel = pet.castrado ? 'Sim' : 'Não';
  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{pet.nome.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.heroText}>
            <Text style={styles.name}>{pet.nome}</Text>
            <Text style={styles.detail}>
              {`${pet.raca || pet.especie} · ${pet.sexo}`}
            </Text>
            <Text style={styles.detail}>
              {`Tutor: ${tutorName} ${tutorPhone ? `· ${tutorPhone}` : ''}`}
            </Text>
          </View>
        </View>

        {tutorAddress ? (
          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>📍 Endereço do Tutor</Text>
            <Text style={styles.addressText}>{tutorAddress}</Text>
            <Button
              variant="secondary"
              label="Abrir Rota (Maps / Waze)"
              onPress={handleOpenMaps}
              style={styles.mapsButton}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.flashContainer}>
        <View style={styles.flashHeader}>
          <Text style={styles.flashIcon}>⚡</Text>
          <Text style={styles.flashTitle}>Resumo Rápido (Flash Histórico)</Text>
        </View>
        
        <View style={styles.flashRow}>
          <View style={styles.flashTile}>
            <Text style={styles.flashTileLabel} numberOfLines={1}>⚖️ Peso Atual</Text>
            <Text style={styles.flashTileValue} numberOfLines={1} adjustsFontSizeToFit>{pesoLabel || '—'}</Text>
            <Text style={styles.flashTileSub} numberOfLines={1}>há 2 meses</Text>
          </View>
          
          <View style={styles.flashTile}>
            <Text style={styles.flashTileLabel} numberOfLines={1}>💉 Vacina</Text>
            <Text style={[styles.flashTileValue, { color: '#B91C1C' }]} numberOfLines={1} adjustsFontSizeToFit>V10 Vence</Text>
            <Text style={[styles.flashTileSub, { color: '#B91C1C', fontWeight: '600' }]} numberOfLines={1}>em 15 dias!</Text>
          </View>

          <View style={styles.flashTile}>
            <Text style={styles.flashTileLabel} numberOfLines={1}>🩺 Último Atend.</Text>
            <Text style={styles.flashTileValue} numberOfLines={1} adjustsFontSizeToFit>
              {records && records.length > 0 ? records[0].diagnostico : 'Consulta'}
            </Text>
            <Text style={styles.flashTileSub} numberOfLines={1}>há 3 meses</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tabChip, active && styles.tabChipActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === 'HISTORICO' ? (
        isLoadingRecords ? (
          <LoadingIndicator label="Carregando histórico..." />
        ) : !records || records.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum registro no prontuário ainda.</Text>
        ) : (
          <View style={styles.timeline}>
            {records.map((record) => (
              <View key={record.id} style={styles.timelineRow}>
                <View style={styles.timelineDotCol}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineLine} />
                </View>
                <View style={styles.timelineCard}>
                  <Text style={styles.timelineDate}>{record.dataAtendimento} · consulta</Text>
                  <Text style={styles.timelineTitle}>{record.diagnostico}</Text>
                  <Text style={styles.timelineBody}>{record.tratamento}</Text>
                  {record.observacao ? <Text style={styles.timelineBody}>{record.observacao}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        )
      ) : null}

      {activeTab === 'AGENDAMENTOS' ? (
        isLoadingAppts ? (
          <LoadingIndicator label="Carregando agenda..." />
        ) : !appointments || appointments.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum agendamento encontrado para este pet.</Text>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {appointments.map((appt) => (
              <View key={appt.id} style={styles.timelineCard}>
                <Text style={styles.timelineDate}>
                  {formatAppointmentDate(appt.date).dayLabel} às {formatAppointmentDate(appt.date).timeLabel}
                </Text>
                <Text style={styles.timelineTitle}>{appt.reason}</Text>
                <Text style={styles.timelineBody}>Status: {STATUS_LABEL[appt.status] || appt.status}</Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                  <Button
                    label="Reagendar"
                    variant="secondary"
                    onPress={() => handleRescheduleAppt(appt.id)}
                    style={{ flex: 1, minHeight: 40 }}
                  />
                  <Button
                    label="Cancelar"
                    variant="secondary"
                    textColor={colors.error}
                    onPress={() => handleCancelAppt(appt.id)}
                    style={{ flex: 1, minHeight: 40 }}
                  />
                </View>
              </View>
            ))}
          </View>
        )
      ) : null}

      {activeTab === 'VACINAS' ? (
        vaccinesList.length > 0 ? (
          <VaccineListCard vaccines={vaccinesList} />
        ) : (
          <Text style={styles.emptyText}>Nenhuma vacina registrada.</Text>
        )
      ) : null}

      {activeTab === 'EXAMES' ? <Text style={styles.emptyText}>Nenhum exame registrado.</Text> : null}

      {activeTab === 'PLANO' ? (
        <View style={styles.planoCard}>
          <Text style={styles.planoText}>
            {profile?.homeInstruction ?? 'Sem orientação de plano registrada.'}
          </Text>
          <Button
            label="Ver plano completo"
            variant="secondary"
            onPress={() => navigation.navigate('PlanoPaciente', { petId })}
          />
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
        <Button
          label="Ver Plano"
          variant="secondary"
          onPress={() => navigation.navigate('PlanoPaciente', { petId })}
          style={{ flex: 1 }}
        />
        <Button
          label="Atendimento"
          onPress={() => navigation.navigate('ProntuarioForm', { petId, consultaId })}
          style={{ flex: 1 }}
        />
      </View>
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
  hero: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    backgroundColor: colors.cardMax,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  heroText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  detail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addressBox: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  addressText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  mapsButton: {
    minHeight: 40,
  },
  weekTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: `${colors.success}1F`,
  },
  weekTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  flashContainer: {
    backgroundColor: '#FEF9C3', // light yellow background
    borderWidth: 1,
    borderColor: '#FDE047',
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  flashHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  flashIcon: {
    fontSize: 16,
  },
  flashTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#854D0E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  flashRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flashTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FEF08A',
    borderRadius: radii.sm,
    padding: spacing.sm,
    gap: 2,
  },
  flashTileLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  flashTileValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  flashTileSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tabChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textLight,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  timeline: {
    gap: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineDotCol: {
    alignItems: 'center',
    width: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.borderStrong,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 4,
  },
  timelineDate: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timelineBody: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  planoCard: {
    gap: spacing.sm,
  },
  planoText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});
