import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FieldError } from '../../component/forms/FieldError';
import { Button } from '../../component/ui/Button';
import { Input } from '../../component/ui/Input';
import useMedicalRecordControl, { type RecordType } from '../../control/useMedicalRecordControl';
import type { PacientesTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';

const RECORD_TYPES: { key: RecordType; label: string }[] = [
  { key: 'CONSULTA', label: 'Consulta' },
  { key: 'VACINA', label: 'Vacina' },
  { key: 'EXAME', label: 'Exame' },
  { key: 'PROCEDIMENTO', label: 'Procedimento' },
];

const ANAMNESE_CHIPS = ['Sem alterações', 'Rotina', 'Retorno'];
const DIAGNOSTICO_CHIPS = ['Saudável', 'Otite', 'Dermatite', 'Gastroenterite'];
const VACINA_CHIPS = ['V10', 'Antirrábica', 'Gripe', 'Giárdia'];
const EXAME_CHIPS = ['Hemograma', 'Ultrassom', 'Raio-X', 'Fezes'];

type Props = NativeStackScreenProps<PacientesTabParamList, 'ProntuarioForm'>;

export function ProntuarioFormScreen({ route }: Props) {
  const { petId, consultaId } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList>>();
  const insets = useSafeAreaInsets();

  const {
    recordType, setRecordType,
    anamnese, setAnamnese,
    diagnostico, setDiagnostico,
    observacao, setObservacao,
    nomeVacina, setNomeVacina,
    loteVacina, setLoteVacina,
    nomeExame, setNomeExame,
    nomeProcedimento, setNomeProcedimento,
    weight, handleWeightChange,
    diagnosticoErro,
    isSaving,
    salvar,
  } = useMedicalRecordControl(
    petId,
    (registro, consultaIdResult) => navigation.navigate('Prescricao', { animalId: petId, consultaId: consultaIdResult || consultaId || '', prontuario: registro }),
    () => navigation.goBack(),
    consultaId,
  );

  const renderDynamicFields = () => {
    switch (recordType) {
      case 'VACINA':
        return (
          <>
            <Input
              label="Nome da Vacina *"
              placeholder="ex.: V10, Antirrábica"
              value={nomeVacina}
              onChangeText={setNomeVacina}
              hasError={!!diagnosticoErro}
            />
            <View style={styles.chipsRow}>
              {VACINA_CHIPS.map((chip) => (
                <Pressable key={chip} onPress={() => setNomeVacina(chip)} style={styles.chip}>
                  <Text style={styles.chipText}>{chip}</Text>
                </Pressable>
              ))}
            </View>
            <FieldError message={diagnosticoErro ?? undefined} />

            <Input
              label="Lote / Marca (opcional)"
              placeholder="ex.: Zoetis Lote 12345"
              value={loteVacina}
              onChangeText={setLoteVacina}
            />
          </>
        );

      case 'EXAME':
        return (
          <>
            <Input
              label="Qual exame foi realizado? *"
              placeholder="ex.: Coleta de Sangue"
              value={nomeExame}
              onChangeText={setNomeExame}
              hasError={!!diagnosticoErro}
            />
            <View style={styles.chipsRow}>
              {EXAME_CHIPS.map((chip) => (
                <Pressable key={chip} onPress={() => setNomeExame(chip)} style={styles.chip}>
                  <Text style={styles.chipText}>{chip}</Text>
                </Pressable>
              ))}
            </View>
            <FieldError message={diagnosticoErro ?? undefined} />

            <Input
              label="Suspeita Clínica / Motivo (opcional)"
              placeholder="ex.: Investigação de anemia"
              value={diagnostico}
              onChangeText={setDiagnostico}
            />
          </>
        );

      case 'PROCEDIMENTO':
        return (
          <>
            <Input
              label="Nome do Procedimento *"
              placeholder="ex.: Limpeza de Tártaro"
              value={nomeProcedimento}
              onChangeText={setNomeProcedimento}
              hasError={!!diagnosticoErro}
            />
            <FieldError message={diagnosticoErro ?? undefined} />
          </>
        );

      case 'CONSULTA':
      default:
        return (
          <>
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
              label="Diagnóstico *"
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
          </>
        );
    }
  };

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

          {renderDynamicFields()}

          <Input
            label="Peso (kg)"
            placeholder="ex.: 17,2"
            value={weight}
            onChangeText={handleWeightChange}
            keyboardType="decimal-pad"
          />

          <Input
            label={recordType === 'VACINA' ? 'Reações / Observações' : 'Observações (opcional)'}
            placeholder={recordType === 'VACINA' ? 'ex.: Animal agitado' : 'ex.: Retorno em 10 dias'}
            value={observacao}
            onChangeText={setObservacao}
            multiline
            numberOfLines={3}
            style={styles.notesInput}
          />

          <View style={styles.actionRow}>
            {recordType === 'VACINA' ? (
              <Button
                label="Registrar Vacina"
                loading={isSaving}
                onPress={() => salvar(false)}
              />
            ) : (
              <>
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
              </>
            )}
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
    marginBottom: spacing.md,
  },
  typeButton: {
    flexBasis: '47%',
    height: 48,
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
    fontSize: 14,
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
    marginBottom: spacing.sm,
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
    marginTop: spacing.md,
  },
  actionHalf: {
    flex: 1,
  },
});
