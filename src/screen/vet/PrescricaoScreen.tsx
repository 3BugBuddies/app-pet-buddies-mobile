import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { NarrativeInput } from '../../component/checkin/NarrativeInput';
import { DoseStepper } from '../../component/prescricao/DoseStepper';
import { Button } from '../../component/ui/Button';
import { FieldError } from '../../component/forms/FieldError';
import { Input } from '../../component/ui/Input';
import { usePrescricaoDraftControl, useDraftPrescription } from '../../control/usePrescriptionControl';
import { usePet } from '../../control/usePetsControl';
import { usePatients } from '../../control/usePatientsControl';
import type { PacientesTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';

const ACAO_LABEL: Record<string, string> = {
  DOSE_MIN: 'dose mínima',
  DOSE_MAX: 'dose máxima',
  DOSE_PADRAO: 'dose padrão',
  ACIONAR_CLINICA: 'acionar clínica',
};

type Props = NativeStackScreenProps<PacientesTabParamList, 'Prescricao'>;

export function PrescricaoScreen({ route }: Props) {
  const { animalId, registroAtendimentoId } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList>>();
  const { data: pet } = usePet(animalId);
  const { data: patients } = usePatients();
  const tutorName = patients?.find((p) => p.petId === animalId)?.tutorName;

  const [narrativaIA, setNarrativaIA] = useState('');
  const draftPrescription = useDraftPrescription();

  const {
    medicamento, setMedicamento,
    doseMin, setDoseMin,
    doseMax, setDoseMax,
    unidade, setUnidade,
    frequenciaDia, setFrequenciaDia,
    duracaoDias, setDuracaoDias,
    orientacao, setOrientacao,
    regras, setRegras, removerRegra,
    erros,
    validar,
  } = usePrescricaoDraftControl({ animalId, registroAtendimentoId });

  // Envia narrativa para a IA, preenche campos e carrega regras propostas
  const handleGerarIA = async () => {
    const rascunho = await draftPrescription.mutateAsync({
      animalId,
      registroAtendimentoId,
      narrativa: narrativaIA,
    });
    // Prescrição agora vem no objeto aninhado rascunho.prescricao
    const { prescricao } = rascunho;
    setMedicamento(prescricao.medicamento);
    setDoseMin(prescricao.doseMin);
    setDoseMax(prescricao.doseMax);
    setUnidade(prescricao.unidade);
    setFrequenciaDia(prescricao.frequenciaDia);
    setDuracaoDias(prescricao.duracaoDias);
    if (prescricao.orientacao) setOrientacao(prescricao.orientacao);
    // Mapeia regrasPropostas (contrato) → RegraDraft (estado local)
    setRegras(
      rascunho.regrasPropostas.map((r) => ({
        condicaoClinicaId: r.condicaoClinicaId,
        rotuloCongelado: r.rotuloCongelado,
        acao: r.acao,
      }))
    );
  };

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

      {/* Bloco de IA: o veterinário dita a conduta e a IA preenche o formulário */}
      <View style={styles.iaSection}>
        <Text style={styles.iaSectionLabel}>Ditar ou digitar conduta (IA)</Text>
        <NarrativeInput
          value={narrativaIA}
          onChangeText={setNarrativaIA}
          placeholder="ex.: amoxicilina 500mg 2x ao dia por 7 dias, administrar com alimento"
        />
        <Button
          label="Gerar prescrição com IA"
          variant="secondary"
          disabled={!narrativaIA.trim()}
          loading={draftPrescription.isPending}
          onPress={handleGerarIA}
        />
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerLabel}>ou preencha manualmente</Text>
        <View style={styles.divider} />
      </View>

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

      {/* Seção de regras condicionais — SE → ENTÃO */}
      <View style={styles.regrasSection}>
        <Text style={styles.sectionLabel}>Regras — SE → ENTÃO</Text>

        {regras.length === 0 ? (
          <Text style={styles.regrasVazias}>Nenhuma regra adicionada</Text>
        ) : (
          regras.map((regra, index) => (
            <View key={index} style={styles.regraRow}>
              <View style={styles.regraDot} />
              <Text style={styles.regraText} numberOfLines={2}>
                {regra.rotuloCongelado}{' '}
                <Text style={styles.regraArrow}>→</Text>{' '}
                {ACAO_LABEL[regra.acao] ?? regra.acao.toLowerCase()}
              </Text>
              <Pressable
                onPress={() => removerRegra(index)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remover regra ${regra.rotuloCongelado}`}
              >
                <Text style={styles.removerText}>remover</Text>
              </Pressable>
            </View>
          ))
        )}

        <Button label="Adicionar regra condicional" variant="secondary" onPress={irParaRegra} />
      </View>

      <Button label="Assinar prescrição" onPress={irParaAssinatura} />
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
  regrasSection: {
    gap: spacing.sm,
  },
  regrasVazias: {
    fontSize: 14,
    color: colors.textMuted,
    paddingLeft: spacing.sm,
    fontStyle: 'italic',
  },
  regraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  regraDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    flexShrink: 0,
  },
  regraText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  regraArrow: {
    color: colors.primary,
    fontWeight: '700',
  },
  removerText: {
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'underline',
    flexShrink: 0,
  },
  iaSection: {
    gap: spacing.sm,
  },
  iaSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: spacing.xs,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
