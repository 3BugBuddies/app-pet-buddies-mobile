import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { DoseStepper } from '../../component/prescricao/DoseStepper';
import { Button } from '../../component/ui/Button';
import { FieldError } from '../../component/forms/FieldError';
import { Input } from '../../component/ui/Input';
import { usePrescricaoDraftControl } from '../../control/usePrescriptionControl';
import { usePet } from '../../control/usePetsControl';
import { usePatients } from '../../control/usePatientsControl';
import type { PacientesTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';

type Props = NativeStackScreenProps<PacientesTabParamList, 'Prescricao'>;

export function PrescricaoScreen({ route }: Props) {
  const { animalId, registroAtendimentoId } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList>>();
  const { data: pet } = usePet(animalId);
  const { data: patients } = usePatients();
  const tutorName = patients?.find((p) => p.petId === animalId)?.tutorName;

  const {
    medicamento, setMedicamento,
    doseMin, setDoseMin,
    doseMax, setDoseMax,
    unidade, setUnidade,
    frequenciaDia, setFrequenciaDia,
    duracaoDias, setDuracaoDias,
    orientacao, setOrientacao,
    erros,
    validar,
  } = usePrescricaoDraftControl({ animalId, registroAtendimentoId });

  const irParaRegra = async () => {
    const draft = await validar();
    if (draft) navigation.navigate('NovaRegra', { draft });
  };

  const irParaAssinatura = async () => {
    const draft = await validar();
    if (draft) navigation.navigate('AssinarPrescricao', { draft });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <CheckInTopBar
        title="Prescrição"
        subtitle={pet ? `${pet.nome}${tutorName ? ` · ${tutorName}` : ''}` : undefined}
        stepLabel="rascunho"
      />

      <View style={styles.medCard}>
        <Text style={styles.medLabel}>Medicamento</Text>
        <Input
          label=""
          placeholder="ex.: Amoxicilina"
          value={medicamento}
          onChangeText={setMedicamento}
          hasError={!!erros.medicamento}
          style={styles.medInput}
        />
        <FieldError message={erros.medicamento} />

        <View style={styles.row}>
          <Input
            label="Unidade"
            placeholder="ex.: mg, ml"
            value={unidade}
            onChangeText={setUnidade}
            hasError={!!erros.unidade}
            style={styles.narrowInput}
          />
          <Input
            label="Vezes ao dia"
            keyboardType="number-pad"
            value={String(frequenciaDia)}
            onChangeText={(v) => setFrequenciaDia(Number(v) || 0)}
            hasError={!!erros.frequenciaDia}
            style={styles.narrowInput}
          />
          <Input
            label="Dias de tratamento"
            keyboardType="number-pad"
            value={String(duracaoDias)}
            onChangeText={(v) => setDuracaoDias(Number(v) || 0)}
            hasError={!!erros.duracaoDias}
            style={styles.narrowInput}
          />
        </View>

        <View style={styles.stepperRow}>
          <DoseStepper
            label="Mínima"
            value={doseMin}
            unit={unidade}
            max={doseMax - 0.5}
            onChange={setDoseMin}
          />
          <DoseStepper
            label="Máxima"
            value={doseMax}
            unit={unidade}
            min={doseMin + 0.5}
            onChange={setDoseMax}
          />
        </View>
        <FieldError message={erros.doseMax} />
      </View>

      <Input
        label="Orientação (opcional)"
        placeholder="ex.: Administrar junto com a refeição"
        value={orientacao}
        onChangeText={setOrientacao}
        multiline
        numberOfLines={3}
        style={styles.notesInput}
      />

      <View style={styles.noteRow}>
        <View style={styles.noteDot} />
        <Text style={styles.noteText}>
          A IA só interpreta o relato do tutor. Toda dose vem desta faixa e destas regras —
          assinadas por você.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Regras especiais?</Text>
      <Button label="Sim, adicionar regra condicional" variant="secondary" onPress={irParaRegra} />
      <Button label="Não, seguir com dose fixa" onPress={irParaAssinatura} />
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
  medCard: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  medLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textLight,
    opacity: 0.85,
  },
  medInput: {
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  narrowInput: {
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  stepperRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.16)',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  noteRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  noteDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: spacing.xs,
  },
});
