import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const ANAMNESE_CHIPS = [
  'Sem alterações',
  'Consulta de rotina',
  'Tutor relata melhora',
  'Retorno de acompanhamento',
];

const DIAGNOSTICO_CHIPS = ['Saudável', 'Otite', 'Dermatite', 'Gastroenterite'];

type Props = NativeStackScreenProps<PacientesTabParamList, 'ProntuarioForm'>;

export function ProntuarioFormScreen({ route }: Props) {
  const { petId } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList>>();
  const insets = useSafeAreaInsets();
  const [recordType, setRecordType] = useState<RecordType>('CONSULTA');

  const {
    anamnese, setAnamnese,
    diagnostico, setDiagnostico,
    observacao, setObservacao,
    weight, handleWeightChange,
    diagnosticoErro,
    isSaving,
    salvar,
  } = useMedicalRecordControl(
    petId,
    (registro) => navigation.navigate('Prescricao', { animalId: petId, registroAtendimentoId: registro.id! }),
    () => navigation.goBack(),
  );

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
      <Text style={styles.title}>O que aconteceu?</Text>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]} showsVerticalScrollIndicator={false}>

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
              <Pressable key={chip} onPress={() => setAnamnese(chip)} style={styles.chip}>
                <Text style={styles.chipText}>{chip}</Text>
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
          <View style={styles.chipsRow}>
            {DIAGNOSTICO_CHIPS.map((chip) => (
              <Pressable key={chip} onPress={() => setDiagnostico(chip)} style={styles.chip}>
                <Text style={styles.chipText}>{chip}</Text>
              </Pressable>
            ))}
          </View>
          <FieldError message={diagnosticoErro ?? undefined} />

          <Input
            label="Peso (kg)"
            placeholder="ex.: 17,2"
            value={weight}
            onChangeText={handleWeightChange}
            keyboardType="decimal-pad"
          />

          <Input
            label="Observações (opcional)"
            placeholder="ex.: Retorno em 10 dias"
            value={observacao}
            onChangeText={setObservacao}
            multiline
            numberOfLines={3}
            style={styles.notesInput}
          />

          <View style={styles.actionRow}>
            <View style={styles.actionHalf}>
              <Button
                variant="secondary"
                label="Apenas Salvar"
                loading={isSaving}
                onPress={() => salvar(false)}
              />
            </View>
            <View style={styles.actionHalf}>
              <Button
                label="Salvar e Prescrever"
                loading={isSaving}
                onPress={() => salvar(true)}
              />
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: -spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.cardChia,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionHalf: {
    flex: 1,
  },
});
