import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { buildApiErrorMessage } from '../../control/apiErrorHelper';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { QuickChips } from '../../component/checkin/QuickChips';
import { Button } from '../../component/ui/Button';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useAllPetsAppointments, useCreateAppointment, useFreeDates, useFreeWindows, useVeterinarians } from '../../control/useAppointmentsControl';
import { formatAppointmentDate } from '../../model/formatDate';
import { useActivePetId, usePets } from '../../control/usePetsControl';
import type { AgendaTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../../styles/theme';

import { useTabBarSpace } from '../navigation/useTabBarSpace';
type Props = NativeStackScreenProps<AgendaTabParamList, 'AgendamentoTutor'>;

const MOTIVOS = ['Consulta de rotina', 'Vacinação', 'Exames', 'Pet doente', 'Retorno'];

// Data local AAAA-MM-DD (toISOString usaria UTC e adiantaria o dia à noite no Brasil).
function isoLocal(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function shortDayLabel(iso: string): string {
  const [ano, mes, dia] = iso.split('-').map(Number);
  const nomes = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const d = new Date(ano, mes - 1, dia);
  return `${nomes[d.getDay()]} ${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`;
}

function gerarProximosDias(quantidade: number) {
  const dias: { iso: string; diaSemana: string; numeroDia: string }[] = [];
  const nomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const hoje = new Date();
  for (let i = 0; i < quantidade; i++) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    dias.push({
      iso: isoLocal(d),
      diaSemana: nomes[d.getDay()],
      numeroDia: String(d.getDate()).padStart(2, '0'),
    });
  }
  return dias;
}

export function AgendamentoTutorScreen({ route }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<AgendaTabParamList>>();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const { data: pets, isLoading } = usePets();
  const createAppointment = useCreateAppointment();
  const { activePetId, setActivePetId } = useActivePetId();
  const petIdAtivo = activePetId ?? '';

  const DIAS = useMemo(() => gerarProximosDias(14), []);
  const [reason, setReason] = useState('');
  const routePetId = route.params?.petId;
  const routeReason = route.params?.reason;

  useEffect(() => {
    if (!routePetId && !routeReason) return;
    if (routePetId) setActivePetId(routePetId);
    if (routeReason) setReason(routeReason);
    navigation.setParams({ petId: undefined, reason: undefined });
  }, [routePetId, routeReason, navigation, setActivePetId]);
  const todas = useAllPetsAppointments((pets ?? []).map((p) => String(p.id)));
  const proxima = useMemo(() => {
    const agora = Date.now();
    return todas
      .filter((a) => (a.status === 'SCHEDULED' || a.status === 'CONFIRMED') && new Date(a.date).getTime() >= agora)
      .sort((a, b) => a.date.localeCompare(b.date))[0];
  }, [todas]);
  const [escolhida, setEscolhida] = useState<string | null>(null);
  const [selectedJanelaId, setSelectedJanelaId] = useState<number | null>(null);

  // A API só lista janelas de um veterinário específico: usa-se o primeiro da clínica.
  const { data: veterinarios, isLoading: isLoadingVets } = useVeterinarians();
  const veterinarioId = veterinarios?.[0]?.id;
  const { data: diasLivres } = useFreeDates(veterinarioId, DIAS[0].iso, DIAS[DIAS.length - 1].iso);
  const livres = useMemo(() => new Set(diasLivres ?? []), [diasLivres]);
  const selectedDate = escolhida && livres.has(escolhida) ? escolhida : (diasLivres?.[0] ?? '');
  const { data: janelasLivres, isLoading: isLoadingJanelas } = useFreeWindows(veterinarioId, selectedDate);

  useEffect(() => {
    setSelectedJanelaId(null);
  }, [selectedDate, veterinarioId]);

  const selectedJanela = janelasLivres?.find((j) => j.id === selectedJanelaId);
  const confirmLabel = selectedJanela
    ? `Confirmar · ${shortDayLabel(selectedDate)} às ${selectedJanela.horaInicio.substring(0, 5)}`
    : 'Escolha dia e horário';

  const handleSave = async () => {
    if (!petIdAtivo || !reason || !selectedDate || !selectedJanelaId) return;
    try {
      await createAppointment.mutateAsync({
        petId: petIdAtivo,
        date: selectedDate,
        reason,
        janelaId: selectedJanelaId,
      });
      Alert.alert('Agendado!', 'Sua consulta foi marcada com sucesso.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Não foi possível agendar', buildApiErrorMessage(error, 'Tente novamente ou entre em contato com a clínica.'));
    }
  };

  if (isLoading || !pets) {
    return <LoadingIndicator label="Carregando..." />;
  }

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.topBar}>
        <CheckInTopBar title="Agendar consulta" />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]} showsVerticalScrollIndicator={false}>

        {proxima ? (
          <View style={styles.proximaCard}>
            <Text style={styles.proximaLabel}>Sua próxima consulta</Text>
            <Text style={styles.proximaText}>
              {`${proxima.reason || 'Consulta'} · ${formatAppointmentDate(proxima.date).dayLabel} · ${formatAppointmentDate(proxima.date).timeLabel} · ${pets.find((p) => p.id === proxima.petId)?.nome ?? ''}`}
            </Text>
          </View>
        ) : null}

        {/* Seção 1: Qual pet? */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Qual pet?</Text>
          <View style={styles.petsRow}>
            {pets.map((pet) => {
              const active = (petIdAtivo) === pet.id;
              return (
                <Pressable
                  key={pet.id}
                  onPress={() => setActivePetId(String(pet.id!))}
                  style={[styles.petChip, active && styles.petChipActive]}
                >
                  <View style={[styles.petAvatar, active && styles.petAvatarActive]}>
                    <Text style={[styles.petAvatarText, active && styles.petAvatarTextActive]}>
                      {pet.nome.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.petName, active && styles.petNameActive]} numberOfLines={1}>
                    {pet.nome}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Seção 2: Motivo */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Motivo</Text>
          <QuickChips options={MOTIVOS} onSelect={setReason} selected={reason} hideLabel />
        </View>

        {/* Seção 3: Dia */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Dia</Text>
          <View style={styles.diasGrid}>
            {DIAS.slice(0, 7).map((dia) => (
              <Text key={dia.iso} style={styles.diaCabecalho}>{dia.diaSemana}</Text>
            ))}
            {DIAS.map((dia) => {
              const active = dia.iso === selectedDate;
              const livre = livres.has(dia.iso);
              return (
                <Pressable
                  key={dia.iso}
                  disabled={!livre}
                  onPress={() => setEscolhida(dia.iso)}
                  style={[styles.diaBlock, active && styles.diaBlockActive, !livre && styles.horarioBlockDisabled]}
                >
                  <Text style={[styles.diaNúmero, active && styles.diaTextActive]}>{dia.numeroDia}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Seção 4: Horário */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {selectedDate ? `Horários de ${formatAppointmentDate(`${selectedDate}T12:00:00`).dayLabel}` : 'Horário'}
          </Text>
          {isLoadingVets || isLoadingJanelas ? (
            <LoadingIndicator label="Buscando horários..." />
          ) : !veterinarioId ? (
            <Text style={styles.emptyText}>
              Nenhum veterinário disponível na clínica no momento.
            </Text>
          ) : !selectedDate || !janelasLivres || janelasLivres.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhum horário disponível nos próximos dias.
            </Text>
          ) : (
            <View style={styles.horariosGrid}>
              {janelasLivres.map((janela) => {
                const active = janela.id === selectedJanelaId;
                const horaFormatada = janela.horaInicio.substring(0, 5); // ex: "08:00"
                return (
                  <Pressable
                    key={janela.id}
                    onPress={() => setSelectedJanelaId(janela.id)}
                    style={[styles.horarioBlock, active && styles.horarioBlockActive]}
                  >
                    <Text style={[styles.horarioText, active && styles.horarioTextActive]}>{horaFormatada}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <Button
          label={confirmLabel}
          onPress={handleSave}
          backgroundColor={selectedJanela ? colors.action : undefined}
          disabled={!petIdAtivo || !reason || !selectedDate || !selectedJanelaId}
          loading={createAppointment.isPending}
        />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  petsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  petChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  petChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  petAvatar: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.cardChia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petAvatarActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  petAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  petAvatarTextActive: {
    color: colors.textLight,
  },
  petName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  petNameActive: {
    color: colors.textLight,
  },
  diasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.sm,
  },
  diaCabecalho: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'lowercase',
  },
  proximaCard: {
    backgroundColor: colors.cardChia,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  proximaLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  proximaText: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  diaBlock: {
    width: `${100 / 7 - 1}%`,
    marginHorizontal: `${0.5}%`,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  diaBlockActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  diaSemana: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  diaNúmero: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  diaTextActive: {
    color: colors.textLight,
  },
  horariosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  horarioBlock: {
    width: 72,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horarioBlockActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  horarioText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  horarioTextActive: {
    color: colors.textLight,
  },
  horarioBlockDisabled: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    opacity: 0.4,
  },
  horarioTextDisabled: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },
});
