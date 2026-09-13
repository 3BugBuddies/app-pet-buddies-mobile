import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { QuickChips } from '../../component/checkin/QuickChips';
import { Button } from '../../component/ui/Button';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useAppointments, useCreateAppointment } from '../../control/useAppointmentsControl';
import { usePets } from '../../control/usePetsControl';
import type { AgendaTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../../styles/theme';

type Props = NativeStackScreenProps<AgendaTabParamList, 'AgendamentoTutor'>;

const MOTIVOS = ['Consulta de Rotina', 'Vacinação', 'Exames', 'Pet Doente', 'Retorno'];

const HORARIOS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

function gerarProximosDias(quantidade: number) {
  const dias: { iso: string; diaSemana: string; numeroDia: string }[] = [];
  const nomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const hoje = new Date();
  for (let i = 0; i < quantidade; i++) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    dias.push({
      iso: d.toISOString().slice(0, 10),
      diaSemana: nomes[d.getDay()],
      numeroDia: String(d.getDate()).padStart(2, '0'),
    });
  }
  return dias;
}

const DIAS = gerarProximosDias(14);

export function AgendamentoTutorScreen({ route }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<AgendaTabParamList>>();
  const insets = useSafeAreaInsets();
  const { data: pets, isLoading } = usePets();
  const createAppointment = useCreateAppointment();
  const { data: consultas } = useAppointments();

  const primeiroId = useMemo(() => pets?.[0]?.id ?? '', [pets]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [reason, setReason] = useState('');
  const [selectedDate, setSelectedDate] = useState(DIAS[0].iso);
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    setSelectedTime('');
  }, [selectedDate]);

  const horariosDisponiveis = useMemo(() => {
    if (!consultas) return HORARIOS;
    return HORARIOS.filter((h) => {
      const dataHora = `${selectedDate}T${h}:00`;
      const ocupado = consultas.some((c) => c.date === dataHora && c.status !== 'CANCELED');
      return !ocupado;
    });
  }, [consultas, selectedDate]);

  const petIdAtivo = selectedPetId || primeiroId;

  const handleSave = async () => {
    if (!petIdAtivo || !reason || !selectedDate || !selectedTime) return;
    try {
      // Janelas 41-207 criadas para os 14 dias exibidos na UI (2026-09-13 a 2026-09-26).
      // Sept 20 às 08:00 usa a janela original #1 (ocupada — UI já filtra esse slot).
      // Dias 0-6: base 41 sem offset; dias 7-13: -1 pelo gap do #1.
      const dayIndex = DIAS.findIndex((d) => d.iso === selectedDate);
      const timeIndex = HORARIOS.indexOf(selectedTime);
      const slotOffset = dayIndex >= 7 ? dayIndex * 12 + timeIndex - 1 : dayIndex * 12 + timeIndex;
      const fakeJanelaId = 41 + slotOffset;

      await createAppointment.mutateAsync({
        petId: petIdAtivo,
        date: `${selectedDate}T${selectedTime}:00`,
        reason,
        janelaId: fakeJanelaId,
      });
      Alert.alert('Agendado!', 'Sua consulta foi marcada com sucesso.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        'Erro desconhecido';
      Alert.alert(
        'Não foi possível agendar',
        `Tente novamente ou entre em contato com a clínica.\n\n${apiMessage}`
      );
    }
  };

  if (isLoading || !pets) {
    return <LoadingIndicator label="Carregando..." />;
  }

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.topBar}>
        <CheckInTopBar title="Nova Consulta" />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>

        {/* Seção 1: Qual pet? */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Qual pet?</Text>
          <View style={styles.petsRow}>
            {pets.map((pet) => {
              const active = (petIdAtivo) === pet.id;
              return (
                <Pressable
                  key={pet.id}
                  onPress={() => setSelectedPetId(pet.id!)}
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
          <QuickChips options={MOTIVOS} onSelect={setReason} />
          {reason ? (
            <View style={styles.motivoTag}>
              <Text style={styles.motivoTagText}>{reason}</Text>
            </View>
          ) : null}
        </View>

        {/* Seção 3: Dia */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Dia</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.diasRow}>
            {DIAS.map((dia) => {
              const active = dia.iso === selectedDate;
              return (
                <Pressable
                  key={dia.iso}
                  onPress={() => setSelectedDate(dia.iso)}
                  style={[styles.diaBlock, active && styles.diaBlockActive]}
                >
                  <Text style={[styles.diaSemana, active && styles.diaTextActive]}>{dia.diaSemana}</Text>
                  <Text style={[styles.diaNúmero, active && styles.diaTextActive]}>{dia.numeroDia}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Seção 4: Horário */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Horário</Text>
          {horariosDisponiveis.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum horário disponível para esta data.</Text>
          ) : (
            <View style={styles.horariosGrid}>
              {horariosDisponiveis.map((h) => {
                const active = h === selectedTime;
                return (
                  <Pressable
                    key={h}
                    onPress={() => setSelectedTime(h)}
                    style={[styles.horarioBlock, active && styles.horarioBlockActive]}
                  >
                    <Text style={[styles.horarioText, active && styles.horarioTextActive]}>{h}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <Button
          label="Confirmar Agendamento"
          onPress={handleSave}
          disabled={!petIdAtivo || !reason || !selectedDate || !selectedTime}
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
    color: colors.primary,
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
  motivoTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: `${colors.primary}1A`,
  },
  motivoTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  diasRow: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  diaBlock: {
    width: 56,
    height: 64,
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
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },
});
