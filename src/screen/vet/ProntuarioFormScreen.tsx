import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProcedimentoCard } from '../../component/fechamento/ProcedimentoCard';
import { FieldError } from '../../component/forms/FieldError';
import { Button } from '../../component/ui/Button';
import { Input } from '../../component/ui/Input';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useFechamentoForm } from '../../control/useFechamentoControl';
import type { SecaoProcedimento } from '../../model/fechamento';
import { formatAppointmentDate } from '../../model/formatDate';
import type { PacientesTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';

const SECOES: { secao: SecaoProcedimento; titulo: string; adicionar: string }[] = [
  { secao: 'VACINA_VERMIFUGO', titulo: 'Vacina e vermífugo', adicionar: 'Adicionar vacina ou vermífugo' },
  { secao: 'EXAME', titulo: 'Exames', adicionar: 'Adicionar exame' },
  { secao: 'PROCEDIMENTO', titulo: 'Procedimentos', adicionar: 'Adicionar procedimento' },
];

type Props = NativeStackScreenProps<PacientesTabParamList, 'ProntuarioForm'>;

export function ProntuarioFormScreen({ route }: Props) {
  const { petId, consultaId, prescricao } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList>>();
  const insets = useSafeAreaInsets();

  const form = useFechamentoForm(petId, consultaId, prescricao ?? null);

  if (form.carregandoConsulta) {
    return <LoadingIndicator label="Carregando o atendimento..." />;
  }

  const contexto = form.consulta
    ? `Esta consulta · ${formatAppointmentDate(form.consulta.date).timeLabel}`
    : 'Atendimento imediato';

  const revisar = () => {
    const fechamento = form.montar();
    if (fechamento) navigation.navigate('AssinarPrescricao', { fechamento });
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
            <Text style={styles.context}>{contexto}</Text>
          </View>

          <Text style={styles.section}>Registro</Text>
          <Input
            label="Motivo do atendimento"
            placeholder="ex.: Responsável relata coceira no ouvido há 3 dias"
            value={form.motivo}
            onChangeText={form.setMotivo}
            multiline
            style={styles.notes}
          />
          <Input
            label="Observações (opcional)"
            placeholder="ex.: Retorno em 10 dias"
            value={form.observacao}
            onChangeText={form.setObservacao}
            multiline
            style={styles.notes}
          />
          <Input
            label="Peso (kg)"
            placeholder="ex.: 17,2"
            value={form.peso}
            onChangeText={form.handlePesoChange}
            keyboardType="decimal-pad"
            hasError={!!form.erros.peso}
          />
          <FieldError message={form.erros.peso} />

          {SECOES.map(({ secao, titulo, adicionar }) => (
            <View key={secao} style={styles.group}>
              <Text style={styles.section}>{titulo}</Text>
              {form.procedimentos
                .filter((p) => p.secao === secao)
                .map((p) => (
                  <ProcedimentoCard
                    key={p.chave}
                    draft={p}
                    itens={form.itensDisponiveis(p)}
                    erro={form.erros[p.chave]}
                    onChange={(patch) => form.atualizar(p.chave, patch)}
                    onRemove={() => form.remover(p.chave)}
                  />
                ))}
              <Pressable accessibilityRole="button" onPress={() => form.adicionar(secao)} style={styles.addButton}>
                <Text style={styles.addText}>+ {adicionar}</Text>
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

          <Button label="Assinar e concluir" backgroundColor={colors.action} onPress={revisar} style={styles.primary} />
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
