import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProcedureCard } from '../../component/closing/ProcedureCard';
import { FieldError } from '../../component/forms/FieldError';
import { Button } from '../../component/ui/Button';
import { Input } from '../../component/ui/Input';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useClosingForm } from '../../control/useClosingControl';
import type { ProcedureSection } from '../../model/closing';
import { formatAppointmentDate } from '../../model/formatDate';
import type { PacientesTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';

const SECTIONS: { section: ProcedureSection; title: string; addLabel: string }[] = [
  { section: 'VACINA_VERMIFUGO', title: 'Vacina e vermífugo', addLabel: 'Adicionar vacina ou vermífugo' },
  { section: 'EXAME', title: 'Exames', addLabel: 'Adicionar exame' },
  { section: 'PROCEDIMENTO', title: 'Procedimentos', addLabel: 'Adicionar procedimento' },
];

type Props = NativeStackScreenProps<PacientesTabParamList, 'ProntuarioForm'>;

export function ProntuarioFormScreen({ route }: Props) {
  const { petId, consultaId, prescricao } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList>>();
  const insets = useSafeAreaInsets();

  const form = useClosingForm(petId, consultaId, prescricao ?? null);

  if (form.loadingAppointment) {
    return <LoadingIndicator label="Carregando o atendimento..." />;
  }

  const context = form.appointment
    ? `Esta consulta · ${formatAppointmentDate(form.appointment.date).timeLabel}`
    : 'Atendimento imediato';

  const review = () => {
    const closing = form.build();
    if (closing) navigation.navigate('AssinarPrescricao', { closing });
  };

  return (
    <View style={[styles.root, { paddingTop: spacing.md }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.banner}>
            <Text style={styles.title}>{form.pet?.nome ?? 'Atendimento'}</Text>
            <Text style={styles.context}>{context}</Text>
          </View>

          <Text style={styles.section}>Registro</Text>
          <Input
            label="Motivo do atendimento"
            placeholder="ex.: Responsável relata coceira no ouvido há 3 dias"
            value={form.reason}
            onChangeText={form.setReason}
            multiline
            style={styles.notes}
          />
          <Input
            label="Observações (opcional)"
            placeholder="ex.: Retorno em 10 dias"
            value={form.notes}
            onChangeText={form.setNotes}
            multiline
            style={styles.notes}
          />
          <Input
            label="Peso (kg)"
            placeholder="ex.: 17,2"
            value={form.weight}
            onChangeText={form.handleWeightChange}
            keyboardType="decimal-pad"
            hasError={!!form.errors.weight}
          />
          <FieldError message={form.errors.weight} />

          {SECTIONS.map(({ section, title, addLabel }) => (
            <View key={section} style={styles.group}>
              <Text style={styles.section}>{title}</Text>
              {form.procedures
                .filter((p) => p.section === section)
                .map((p) => (
                  <ProcedureCard
                    key={p.key}
                    draft={p}
                    items={form.availableItems(p)}
                    error={form.errors[p.key]}
                    onChange={(patch) => form.update(p.key, patch)}
                    onRemove={() => form.remove(p.key)}
                  />
                ))}
              <Pressable accessibilityRole="button" onPress={() => form.add(section)} style={styles.addButton}>
                <Text style={styles.addText}>+ {addLabel}</Text>
              </Pressable>
            </View>
          ))}

          <View style={styles.group}>
            <Text style={styles.section}>Prescrição</Text>
            {prescricao ? (
              <View style={styles.prescricaoCard}>
                <Text style={styles.prescricaoNome}>
                  {prescricao.medicamento} · {prescricao.doseMin}–{prescricao.doseMax} {prescricao.unidade}
                </Text>
                <Text style={styles.prescricaoSub}>
                  {prescricao.frequenciaDia}×/dia · {prescricao.duracaoDias} dias · {prescricao.regras.length} regra(s)
                </Text>
                <View style={styles.prescricaoActions}>
                  <Pressable onPress={() => navigation.navigate('Prescricao', { animalId: petId })}>
                    <Text style={styles.addText}>Trocar prescrição</Text>
                  </Pressable>
                  <Pressable onPress={() => navigation.setParams({ prescricao: undefined })}>
                    <Text style={styles.removeText}>Remover</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('Prescricao', { animalId: petId })}
                style={styles.addButton}
              >
                <Text style={styles.addText}>+ Adicionar prescrição</Text>
              </Pressable>
            )}
          </View>

          <Button label="Assinar e concluir" backgroundColor={colors.action} onPress={review} style={styles.primary} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.sm },
  banner: { backgroundColor: colors.cardChia, borderRadius: radii.lg, padding: spacing.md },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3, color: colors.textPrimary },
  context: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  section: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.sm },
  group: { gap: spacing.sm },
  notes: { minHeight: 80, textAlignVertical: 'top' },
  addButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  addText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  removeText: { fontSize: 14, fontWeight: '600', color: colors.error },
  prescricaoCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 2,
  },
  prescricaoNome: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  prescricaoSub: { fontSize: 13, color: colors.textSecondary },
  prescricaoActions: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  primary: { marginTop: spacing.md },
});
