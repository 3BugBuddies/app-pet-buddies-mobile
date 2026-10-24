import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ComponentProps } from 'react';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { Button } from '../../component/ui/Button';
import { useAppointment, useVetCrmv } from '../../control/useAppointmentsControl';
import { useCompleteAppointment, composeNotes, useOpenPlanItems } from '../../control/useClosingControl';
import { usePet } from '../../control/usePetsControl';
import type { ClosingDoneSummary, ProcedureDraft } from '../../model/closing';
import { firstName, formatHourShort, localIsoNow } from '../../model/closingSummary';
import { formatDateBR, formatShortDate } from '../../model/formatDate';
import { descreverCondicao, rotuloAcao } from '../../model/prescriptionRule';
import type { PacientesTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';
import { useTabBarSpace } from '../navigation/useTabBarSpace';

type Props = NativeStackScreenProps<PacientesTabParamList, 'AssinarPrescricao'>;
type IconName = ComponentProps<typeof Ionicons>['name'];

const procedureLabel = (p: ProcedureDraft) =>
  p.section === 'EXAME' ? 'Exame' : p.section === 'PROCEDIMENTO' ? 'Procedimento' : p.tipo === 'VERMIFUGACAO' ? 'Vermífugo' : 'Vacina';

export function AssinarPrescricaoScreen({ route }: Props) {
  const { closing } = route.params;
  const draft = closing.prescription;
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList, 'AssinarPrescricao'>>();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const { complete, completing } = useCompleteAppointment();
  const crmv = useVetCrmv();
  const { data: pet } = usePet(closing.petId);
  const { data: appointment } = useAppointment(closing.appointmentId ?? '');
  const { data: planItems = [] } = useOpenPlanItems(closing.petId);

  const whenIso = appointment?.date ?? localIsoNow();
  const header = [
    closing.petName,
    appointment ? `consulta de ${formatShortDate(appointment.date)}, ${formatHourShort(appointment.date)}` : 'atendimento imediato',
  ].join(' · ');
  const responsavel = firstName(pet?.responsavelNome);
  const seesInApp = responsavel ? `A ${responsavel} vê no app` : 'O responsável vê no app';
  const targetDate = (itemId: number | null) => {
    const alvo = itemId == null ? null : planItems.find((i) => i.id === itemId)?.dataAlvo;
    return alvo ? formatDateBR(alvo) : null;
  };

  const registroSub = [closing.weight ? `${closing.weight} kg` : null, closing.notes.trim() || 'sem observação']
    .filter(Boolean)
    .join(' · ');
  const rules = draft?.regras.map((r) => `${descreverCondicao(r).toLowerCase()} → ${rotuloAcao(r.acao).toLowerCase()}`) ?? [];
  const receitaSub = draft
    ? [
        `${draft.doseMin}–${draft.doseMax} ${draft.unidade}`,
        `${draft.frequenciaDia}×/dia`,
        `${draft.duracaoDias} dias`,
        rules.length > 0 ? `${rules.length === 1 ? 'regra' : 'regras'}: ${rules.join('; ')}` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  const handleSign = async () => {
    try {
      await complete(closing);
    } catch {
      return; // o erro já foi mostrado pelo onError da mutation
    }
    const summary: ClosingDoneSummary = {
      petName: closing.petName,
      reason: closing.reason.trim(),
      whenIso,
      responsavel,
      vaccines: closing.procedures
        .filter((p) => p.section === 'VACINA_VERMIFUGO')
        .map((p) => ({ nome: p.nome.trim(), alvo: p.itemPlanoId != null ? targetDate(p.itemPlanoId) : null })),
      others: closing.procedures
        .filter((p) => p.section !== 'VACINA_VERMIFUGO')
        .map((p) => ({ label: procedureLabel(p), nome: p.nome.trim() })),
      medicamento: draft?.medicamento ?? null,
    };
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: 'Pacientes' }, { name: 'CheckoutAtendimento', params: { summary } }],
      })
    );
  };

  const signItems: { icon: IconName; title: string; sub?: string }[] = draft
    ? [
        { icon: 'document-text-outline', title: 'A receita fica assinada', sub: `com seu nome e CRMV${crmv ? ` ${crmv}` : ''}` },
        { icon: 'lock-closed-outline', title: 'Ela não muda mais' },
        { icon: 'phone-portrait-outline', title: seesInApp },
      ]
    : [
        { icon: 'document-text-outline', title: 'O atendimento fica registrado', sub: 'no histórico do pet' },
        { icon: 'phone-portrait-outline', title: seesInApp },
      ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: tabBarSpace }]}>
      <CheckInTopBar title={draft ? 'Assinar e concluir' : 'Concluir atendimento'} />

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{header}</Text>

        <Block label="Registro" title={closing.reason.trim() || 'Atendimento'} sub={registroSub} />
        {closing.procedures.map((p) => {
          const alvo = p.itemPlanoId != null ? targetDate(p.itemPlanoId) : null;
          const sub =
            p.section === 'VACINA_VERMIFUGO'
              ? p.itemPlanoId == null
                ? 'avulsa, não baixa item do plano'
                : alvo
                  ? `baixa o item previsto para ${alvo}`
                  : 'baixa o item previsto do plano'
              : undefined;
          return <Block key={p.key} label={procedureLabel(p)} title={p.nome.trim()} sub={sub} extra={composeNotes(p)} />;
        })}
        {draft ? <Block label="Receita" title={draft.medicamento} sub={receitaSub} /> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Ao assinar</Text>
        {signItems.map((item) => (
          <View key={item.title} style={styles.signRow}>
            <View style={styles.signIcon}>
              <Ionicons name={item.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.signTitle}>{item.title}</Text>
              {item.sub ? <Text style={styles.sub}>{item.sub}</Text> : null}
            </View>
          </View>
        ))}
      </View>

      <Button
        label={!draft ? 'Concluir atendimento' : crmv ? `Assinar e concluir · CRMV ${crmv}` : 'Assinar e concluir'}
        backgroundColor={colors.action}
        loading={completing}
        onPress={handleSign}
        style={styles.sign}
      />
    </ScrollView>
  );
}

function Block({ label, title, sub, extra }: { label: string; title: string; sub?: string; extra?: string }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockLabel}>{label}</Text>
      <Text style={styles.blockTitle}>{title}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      {extra ? <Text style={styles.sub}>{extra}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  flex: { flex: 1 },
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md },
  cardLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: colors.textSecondary },
  block: { gap: 2 },
  blockLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: colors.textSecondary },
  blockTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 15, lineHeight: 21, color: colors.textSecondary },
  signRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  signIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.cardChia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  sign: { marginTop: spacing.sm },
});
