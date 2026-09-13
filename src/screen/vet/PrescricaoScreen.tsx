import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { Button } from '../../component/ui/Button';
import { FieldError } from '../../component/forms/FieldError';
import { Input } from '../../component/ui/Input';
import { usePrescricaoDraftControl, useDraftPrescription } from '../../control/usePrescriptionControl';
import { usePet } from '../../control/usePetsControl';
import { usePatients } from '../../control/usePatientsControl';
import type { PacientesTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  
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

  useEffect(() => {
    if (route.params?.novaRegra) {
      setRegras((prev) => [...prev, route.params.novaRegra!]);
      navigation.setParams({ novaRegra: undefined });
    }
  }, [route.params?.novaRegra]);

  const handleGerarIA = async () => {
    try {
      const rascunho = await draftPrescription.mutateAsync({
        animalId,
        registroAtendimentoId,
        narrativa: narrativaIA,
      });

      // Modelo de IA indisponível — orienta preenchimento manual
      if (!rascunho.extracaoDisponivel) {
        Alert.alert(
          'IA indisponível',
          rascunho.motivoDegradacao ?? 'Preencha a prescrição manualmente.',
        );
        return;
      }

      const prescricao = rascunho.prescricao;
      setMedicamento(prescricao.medicamento ?? '');
      setDoseMin(prescricao.doseMin ?? 0);
      setDoseMax(prescricao.doseMax ?? 0);
      setUnidade(prescricao.unidade ?? 'mg');
      setFrequenciaDia(prescricao.frequenciaDia ?? 1);
      setDuracaoDias(prescricao.duracaoDias ?? 7);
      if (prescricao.orientacao) setOrientacao(prescricao.orientacao);

      // Fallback de segurança HATEOAS
      const regrasSeguras = rascunho.regrasPropostas || [];
      setRegras(
        regrasSeguras.map((r: any) => ({
          condicaoClinicaId: Number(r.condicaoClinicaId),
          rotuloCongelado: r.rotuloCongelado,
          acao: r.acao,
        }))
      );
    } catch (error: any) {
      const status = error?.response?.status;
      const detalhe = error?.response?.data
        ? JSON.stringify(error.response.data, null, 2)
        : error?.message ?? 'Erro desconhecido';
      Alert.alert(`Erro ${status ?? ''} ao chamar IA`, detalhe);
    }
  };

  const irParaRegra = () => {
    navigation.navigate('NovaRegra', { animalId, registroAtendimentoId });
  };

  const irParaAssinatura = async () => {
    const draft = await validar();
    if (draft) navigation.navigate('AssinarPrescricao', { draft });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 80 }]} keyboardShouldPersistTaps="handled">
      <CheckInTopBar
        title="Prescrição"
        subtitle={pet ? `${pet.nome}${tutorName ? ` • ${tutorName}` : ''}` : undefined}
        stepLabel="rascunho"
      />

      {/* UX Otimizada: Bloco da IA como assistente de digitação (sem falsas promessas de áudio) */}
      <View style={styles.iaCard}>
        <View style={styles.iaHeader}>
          <Ionicons name="sparkles" size={20} color={colors.accent} />
          <Text style={styles.iaTitle}>Assistente de Prescrição</Text>
        </View>
        <Text style={styles.iaSub}>
          Digite a conduta médica de forma natural. A IA preencherá as doses e regras automaticamente.
        </Text>
        <TextInput
          value={narrativaIA}
          onChangeText={setNarrativaIA}
          placeholder="Ex: Amoxicilina 500mg 2x ao dia por 7 dias. Administrar com alimento."
          placeholderTextColor={colors.textMuted}
          multiline
          style={styles.iaInput}
        />
        <Button
          label="Preencher formulário mágico"
          variant="secondary"
          disabled={!narrativaIA.trim()}
          loading={draftPrescription.isPending}
          onPress={handleGerarIA}
        />
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerLabel}>ou digite os campos abaixo</Text>
        <View style={styles.divider} />
      </View>

      {/* UX Otimizada: Formulário Limpo, Agrupamento Lógico e Inputs Numéricos Livres */}
      <View style={styles.medCard}>
        <Text style={styles.sectionLabel}>Dados do Medicamento</Text>
        
        <Input
          label="Nome do Medicamento"
          placeholder="medicamento genérico ou comercial"
          value={medicamento}
          onChangeText={setMedicamento}
          hasError={!!erros.medicamento}
        />
        <FieldError message={erros.medicamento} />

        {/* Linha de Dosagem e Unidade agrupadas */}
        <View style={styles.row}>
          <View style={styles.flex2}>
            <Input
              label="Dose Mínima"
              keyboardType="decimal-pad"
              placeholder="0.0"
              value={doseMin ? String(doseMin) : ''}
              onChangeText={(v) => setDoseMin(Number(v.replace(',', '.')) || 0)}
              hasError={!!erros.doseMin}
            />
          </View>
          <View style={styles.flex2}>
            <Input
              label="Dose Máxima"
              keyboardType="decimal-pad"
              placeholder="0.0"
              value={doseMax ? String(doseMax) : ''}
              onChangeText={(v) => setDoseMax(Number(v.replace(',', '.')) || 0)}
              hasError={!!erros.doseMax}
            />
          </View>
          <View style={styles.flex1}>
            <Input
              label="Unid."
              placeholder="mg, ml, g..."
              value={unidade}
              onChangeText={setUnidade}
              hasError={!!erros.unidade}
            />
          </View>
        </View>
        <FieldError message={erros.doseMax} />

        {/* Linha de Posologia agrupada */}
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Input
              label="Vezes ao dia"
              keyboardType="number-pad"
              placeholder=""
              value={String(frequenciaDia || '')}
              onChangeText={(v) => setFrequenciaDia(Number(v) || 0)}
              hasError={!!erros.frequenciaDia}
            />
          </View>
          <View style={styles.flex1}>
            <Input
              label="Dias de tratamento"
              keyboardType="number-pad"
              placeholder=""
              value={String(duracaoDias || '')}
              onChangeText={(v) => setDuracaoDias(Number(v) || 0)}
              hasError={!!erros.duracaoDias}
            />
          </View>
        </View>

        <Input
          label="Orientação para o Tutor (opcional)"
          placeholder=""
          value={orientacao}
          onChangeText={setOrientacao}
          multiline
          numberOfLines={3}
          style={styles.notesInput}
        />
      </View>

      <View style={styles.regrasSection}>
        <Text style={styles.sectionLabel}>Regras Condicionais (SE • ENTÃO)</Text>
        <Text style={styles.noteText}>
          Opcional. Adicione regras para que o app adapte a dose conforme os sintomas relatados pelo tutor no check-in.
        </Text>

        {regras.length === 0 ? (
          <Text style={styles.regrasVazias}>Nenhuma regra adicionada</Text>
        ) : (
          regras.map((regra, index) => (
            <View key={index} style={styles.regraRow}>
              <View style={styles.regraDot} />
              <Text style={styles.regraText} numberOfLines={2}>
                Se <Text style={styles.regraBold}>{regra.rotuloCongelado.toLowerCase()}</Text>
                <Text style={styles.regraArrow}> → </Text>
                {ACAO_LABEL[regra.acao] ?? regra.acao.toLowerCase()}
              </Text>
              <Pressable
                onPress={() => removerRegra(index)}
                hitSlop={8}
                accessibilityRole="button"
              >
                <Text style={styles.removerText}>remover</Text>
              </Pressable>
            </View>
          ))
        )}
        <Button label="+ Adicionar regra condicional" variant="secondary" onPress={irParaRegra} />
      </View>

      <Button label="Revisar e Assinar Prescrição" onPress={irParaAssinatura} style={{ marginTop: spacing.md }} />
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
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  
  // UX: Clean IA Card
  iaCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  iaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  iaSub: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  iaInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderStrong,
  },
  dividerLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // UX: Clean Form Card
  medCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Rules Section
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  regrasSection: {
    gap: spacing.sm,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  regrasVazias: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  regraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
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
  regraBold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  regraArrow: {
    color: colors.primary,
    fontWeight: '700',
  },
  removerText: {
    fontSize: 12,
    color: colors.error,
    textDecorationLine: 'underline',
    flexShrink: 0,
  },
});