import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { FieldError } from '../../component/forms/FieldError';
import { Button } from '../../component/ui/Button';
import { Input } from '../../component/ui/Input';
import useMedicalRecordControl from '../../control/useMedicalRecordControl';
import type { PacientesTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';

type RecordType = 'VACINA' | 'CONSULTA' | 'EXAME' | 'PROCEDIMENTO';

const RECORD_TYPES: { key: RecordType; label: string }[] = [
  { key: 'VACINA', label: 'Vacina' },
  { key: 'CONSULTA', label: 'Consulta' },
  { key: 'EXAME', label: 'Exame' },
  { key: 'PROCEDIMENTO', label: 'Procedimento' },
];

// Atalhos pra ganhar agilidade no atendimento (Fase 4) — 1 toque preenche a
// anamnese com o texto mais comum, sem precisar digitar do zero.
const ANAMNESE_CHIPS = [
  'Sem alterações',
  'Consulta de rotina',
  'Tutor relata melhora',
  'Retorno de acompanhamento',
];

type Props = NativeStackScreenProps<PacientesTabParamList, 'ProntuarioForm'>;

export function ProntuarioFormScreen({ route }: Props) {
  const { petId } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList>>();
  const [recordType, setRecordType] = useState<RecordType>('CONSULTA');

  const {
    anamnese,
    setAnamnese,
    diagnostico,
    setDiagnostico,
    tratamento,
    setTratamento,
    observacao,
    setObservacao,
    weight,
    setWeight,
    homeInstructionOn,
    setHomeInstructionOn,
    homeInstructionText,
    setHomeInstructionText,
    diagnosticoErro,
    tratamentoErro,
    isSaving,
    salvar,
  } = useMedicalRecordControl(petId, (registro) =>
    navigation.navigate('Prescricao', { animalId: petId, registroAtendimentoId: registro.id! })
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>O que aconteceu?</Text>

      <View style={styles.typeGrid}>
        {RECORD_TYPES.map((type) => {
          const active = type.key === recordType;
          return (
            <Pressable
              key={type.key}
              onPress={() => setRecordType(type.key)}
              style={[styles.typeButton, active && styles.typeButtonActive]}
            >
              <Text style={[styles.typeButtonText, active && styles.typeButtonTextActive]}>
                {type.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Input
        label="Anamnese (opcional)"
        placeholder="ex.: Tutora relata coceira no ouvido há 3 dias"
        value={anamnese}
        onChangeText={setAnamnese}
        multiline
        numberOfLines={3}
        style={styles.notesInput}
      />
      <View style={styles.chipsRow}>
        {ANAMNESE_CHIPS.map((chip) => (
          <Pressable key={chip} onPress={() => setAnamnese(chip)} style={styles.anamneseChip}>
            <Text style={styles.anamneseChipText}>{chip}</Text>
          </Pressable>
        ))}
      </View>

      <Input
        label="Diagnóstico"
        placeholder="ex.: Otite leve no ouvido direito"
        value={diagnostico}
        onChangeText={setDiagnostico}
        hasError={!!diagnosticoErro}
      />
      <FieldError message={diagnosticoErro ?? undefined} />

      <Input
        label="Tratamento"
        placeholder="ex.: Gotas antibióticas por 7 dias"
        value={tratamento}
        onChangeText={setTratamento}
        hasError={!!tratamentoErro}
      />
      <FieldError message={tratamentoErro ?? undefined} />

      <Input
        label="Peso (kg)"
        placeholder="ex.: 17,2"
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
      />

      <Input
        label="Observações (opcional)"
        placeholder="ex.: Retorno em 10 dias"
        value={observacao}
        onChangeText={setObservacao}
        multiline
        numberOfLines={4}
        style={styles.notesInput}
      />

      <View style={styles.homeCard}>
        <View style={styles.homeHeader}>
          <Text style={styles.homeLabel}>Orientação para casa</Text>
          <Switch
            value={homeInstructionOn}
            onValueChange={setHomeInstructionOn}
            trackColor={{ true: colors.warning, false: colors.borderStrong }}
          />
        </View>
        {homeInstructionOn ? (
          <Input
            label="O que a tutora deve fazer"
            placeholder="ex.: Observar reação no local por 48h"
            value={homeInstructionText}
            onChangeText={setHomeInstructionText}
          />
        ) : null}
      </View>

      <Button label="Avançar para Prescrição" loading={isSaving} onPress={salvar} />
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
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  typeButton: {
    flexBasis: '47%',
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  typeButtonTextActive: {
    color: colors.textLight,
  },
  notesInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: -spacing.xs,
  },
  anamneseChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.cardChia,
  },
  anamneseChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  homeCard: {
    backgroundColor: colors.cardMax,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  homeLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textPrimary,
  },
});
