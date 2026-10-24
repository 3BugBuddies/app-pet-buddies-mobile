import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AccordionRow, type ClosingIconName } from '../../component/closing/AccordionRow';
import { DoneGrid } from '../../component/closing/DoneGrid';
import { ProcedureCard } from '../../component/closing/ProcedureCard';
import { FieldError } from '../../component/forms/FieldError';
import { Button } from '../../component/ui/Button';
import { Input } from '../../component/ui/Input';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useClosingForm } from '../../control/useClosingControl';
import type { ProcedureSection } from '../../model/closing';
import type { ItemReceitaDraft } from '../../model/prescription';
import { formatHourShort } from '../../model/closingSummary';
import { formatDateBR, formatShortDate } from '../../model/formatDate';
import type { PacientesTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';
import { useTabBarSpace } from '../navigation/useTabBarSpace';

type OpenKey = 'consulta' | ProcedureSection | 'receita';

const SECTIONS: { section: ProcedureSection; tile: string; title: string; hint: string; icon: ClosingIconName; addLabel: string }[] = [
  { section: 'VACINA_VERMIFUGO', tile: 'Vacina ou vermífugo', title: 'Vacina e vermífugo', hint: 'Item do plano, nome e lote', icon: 'needle', addLabel: 'Adicionar outra vacina ou vermífugo' },
  { section: 'EXAME', tile: 'Exame', title: 'Exames', hint: 'Nome e observações', icon: 'flask-outline', addLabel: 'Adicionar outro exame' },
  { section: 'PROCEDIMENTO', tile: 'Procedimento', title: 'Procedimentos', hint: 'Nome e observações', icon: 'bandage', addLabel: 'Adicionar outro procedimento' },
];

type Props = NativeStackScreenProps<PacientesTabParamList, 'ProntuarioForm'>;

export function ProntuarioFormScreen({ route }: Props) {
  const { petId, consultaId, prescricao } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList>>();
  const tabBarSpace = useTabBarSpace();
  const [openKey, setOpenKey] = useState<OpenKey | null>(null);

  const form = useClosingForm(petId, consultaId, prescricao ?? null);
  const receitaMarked = form.receitaOn || !!prescricao;

  // Tocar a aba ativa volta a pilha ao topo e descartava o atendimento preenchido sem aviso.
  // Só pergunta com a tela em foco: o reset depois de assinar acontece com a assinatura na frente.
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        if (!form.dirty || !navigation.isFocused()) return;
        e.preventDefault();
        Alert.alert('Descartar o atendimento?', 'O que você preencheu será perdido.', [
          { text: 'Continuar atendimento', style: 'cancel' },
          { text: 'Descartar', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
        ]);
      }),
    [navigation, form.dirty]
  );

  if (form.loadingAppointment) {
    return <LoadingIndicator label="Carregando o atendimento..." />;
  }

  const toggle = (key: OpenKey) => setOpenKey((current) => (current === key ? null : key));
  const responsavel = form.pet?.responsavelNome?.trim();
  const petLine = [form.pet?.nome ?? 'Atendimento', responsavel].filter(Boolean).join(' · ');
  const appointment = form.appointment;
  const isToday = appointment ? appointment.date.slice(0, 10) === todayIso() : false;
  const bannerTitle = appointment
    ? [
        isToday ? 'Consulta de hoje' : `Consulta de ${formatShortDate(appointment.date)}`,
        formatHourShort(appointment.date),
        appointment.reason.trim(),
      ]
        .filter(Boolean)
        .join(' · ')
    : 'Atendimento imediato';

  const weightText = form.weight ? `${form.weight} kg` : null;
  const consultaSummary = [form.reason.trim() || 'sem motivo', weightText, form.notes.trim() || 'sem observação']
    .filter(Boolean)
    .join(' · ');

  const onTile = (key: string) => {
    if (key === 'receita') {
      if (receitaMarked) {
        form.setReceitaOn(false);
        navigation.setParams({ prescricao: undefined });
        if (openKey === 'receita') setOpenKey(null);
      } else {
        form.setReceitaOn(true);
      }
      return;
    }
    const section = key as ProcedureSection;
    const wasOn = form.hasSection(section);
    form.toggleSection(section);
    if (wasOn) {
      if (openKey === section) setOpenKey(null);
    } else {
      setOpenKey(section);
    }
  };

  const review = () => {
    if (receitaMarked && !prescricao) {
      setOpenKey(null);
      Alert.alert('Receita sem preenchimento', 'Preencha a receita ou desmarque «Receita» para concluir.');
      return;
    }
    const closing = form.build();
    if (closing) {
      navigation.navigate('AssinarPrescricao', { closing });
      return;
    }
    const invalid = form.firstInvalid();
    if (invalid) setOpenKey(invalid as OpenKey);
  };

  const sectionSummary = (section: ProcedureSection) => {
    const drafts = form.procedures.filter((p) => p.section === section);
    const names = drafts.map((p) => p.nome.trim()).filter(Boolean);
    if (names.length === 0) return SECTIONS.find((s) => s.section === section)?.hint ?? '';
    const linked = drafts.find((p) => p.section === 'VACINA_VERMIFUGO' && p.itemPlanoId != null);
    const alvo = linked ? form.availableItems(linked).find((i) => i.id === linked.itemPlanoId)?.dataAlvo : null;
    const tail = section === 'VACINA_VERMIFUGO' ? (alvo ? ` · baixa o item de ${formatDateBR(alvo)}` : ' · avulsa') : '';
    return `${names.join(', ')}${tail}`;
  };

  const prescricaoSummary = prescricao
    ? prescricao.itens.length === 1
      ? medicationLine(prescricao.itens[0])
      : prescricao.itens.map((i) => medicationLine(i)).join('\n')
    : 'Toque para preencher a receita';

  return (
    <View style={[styles.root, { paddingTop: spacing.md }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.banner}>
            <Ionicons name="time-outline" size={22} color={colors.primary} />
            <View style={styles.flex}>
              <Text style={styles.bannerTitle}>{bannerTitle}</Text>
              <Text style={styles.bannerSub}>{petLine}</Text>
            </View>
          </View>

          <Text style={styles.section}>O que trouxe o pet</Text>
          <AccordionRow
            icon="stethoscope"
            title="Consulta"
            summary={consultaSummary}
            done={!!form.reason.trim() && !form.errors.weight}
            open={openKey === 'consulta'}
            onPress={() => toggle('consulta')}
          >
            <View style={styles.pair}>
              <View style={styles.flex2}>
                <Input
                  label="Motivo"
                  placeholder="ex.: coceira no ouvido há 3 dias"
                  value={form.reason}
                  onChangeText={form.setReason}
                  multiline
                  style={styles.notes}
                />
              </View>
              <View style={styles.flex1}>
                <Input
                  label="Peso (kg)"
                  placeholder="ex.: 17,2"
                  value={form.weight}
                  onChangeText={form.handleWeightChange}
                  keyboardType="decimal-pad"
                  hasError={!!form.errors.weight}
                />
              </View>
            </View>
            <FieldError message={form.errors.weight} />
            <Input
              label="Observações (opcional)"
              placeholder="ex.: Retorno em 10 dias"
              value={form.notes}
              onChangeText={form.setNotes}
              multiline
              style={styles.notes}
            />
          </AccordionRow>

          <Text style={styles.section}>O que foi feito</Text>
          <DoneGrid
            onToggle={onTile}
            options={[
              ...SECTIONS.map((s) => ({ key: s.section, label: s.tile, icon: s.icon, selected: form.hasSection(s.section) })),
              { key: 'receita', label: 'Receita', icon: 'file-document-outline' as ClosingIconName, selected: receitaMarked },
            ]}
          />

          {SECTIONS.filter((s) => form.hasSection(s.section)).map(({ section, title, icon, addLabel }) => {
            const drafts = form.procedures.filter((p) => p.section === section);
            const done = drafts.length > 0 && drafts.every((p) => p.nome.trim());
            return (
              <AccordionRow
                key={section}
                icon={icon}
                title={title}
                summary={sectionSummary(section)}
                done={done}
                open={openKey === section}
                onPress={() => toggle(section)}
              >
                {drafts.map((p) => (
                  <ProcedureCard
                    key={p.key}
                    draft={p}
                    items={form.availableItems(p)}
                    error={form.errors[p.key]}
                    onChange={(patch) => form.update(p.key, patch)}
                    onRemove={drafts.length > 1 ? () => form.remove(p.key) : undefined}
                  />
                ))}
                <Pressable accessibilityRole="button" onPress={() => form.add(section)} style={styles.addButton}>
                  <Text style={styles.addText}>+ {addLabel}</Text>
                </Pressable>
              </AccordionRow>
            );
          })}

          {receitaMarked ? (
            <AccordionRow
              icon="file-document-outline"
              title={prescricao && prescricao.itens.length > 1 ? `Receita · ${prescricao.itens.length} medicamentos` : 'Receita'}
              summary={prescricaoSummary}
              done={!!prescricao}
              forward
              onPress={() => navigation.navigate('Prescricao', { animalId: petId, receita: prescricao })}
            />
          ) : null}

          <Button
            label={prescricao ? 'Assinar e concluir' : 'Concluir atendimento'}
            backgroundColor={colors.action}
            onPress={review}
            style={styles.primary}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const medicationLine = (i: ItemReceitaDraft) =>
  `${i.medicamento} · ${i.doseMin}–${i.doseMax} ${i.unidade} · ${i.frequenciaDia}×/dia · ${i.duracaoDias} dias`;

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  content: { padding: spacing.lg, gap: spacing.sm },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cardChia,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  bannerSub: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  section: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  pair: { flexDirection: 'row', gap: spacing.sm },
  notes: { minHeight: 64, textAlignVertical: 'top' },
  addButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  addText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  primary: { marginTop: spacing.md },
});
