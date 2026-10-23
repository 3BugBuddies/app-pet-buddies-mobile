import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { Button } from '../../component/ui/Button';
import { useCompleteAppointment, composeNotes } from '../../control/useClosingControl';
import { descreverCondicao } from '../../model/prescriptionRule';
import type { PacientesTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';

type Props = NativeStackScreenProps<PacientesTabParamList, 'AssinarPrescricao'>;

export function AssinarPrescricaoScreen({ route }: Props) {
  const { closing } = route.params;
  const draft = closing.prescription;
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList, 'AssinarPrescricao'>>();
  const insets = useSafeAreaInsets();
  const { complete, completing } = useCompleteAppointment();

  const handleSign = async () => {
    try {
      await complete(closing);
    } catch {
      return; // o erro já foi mostrado pelo onError da mutation
    }
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: 'Pacientes' },
          { name: 'CheckoutAtendimento', params: { petName: closing.petName } },
        ],
      })
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 80 }]}>
      <CheckInTopBar title="Assinar e concluir" subtitle={closing.petName} />

      {closing.reason.trim() || closing.notes.trim() || closing.weight ? (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Registro</Text>
          {closing.reason.trim() ? <Text style={styles.orientacaoText}>{closing.reason.trim()}</Text> : null}
          {closing.notes.trim() ? <Text style={styles.orientacaoText}>{closing.notes.trim()}</Text> : null}
          {closing.weight ? <Text style={styles.orientacaoText}>Peso: {closing.weight} kg</Text> : null}
        </View>
      ) : null}

      {closing.procedures.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Procedimentos</Text>
          {closing.procedures.map((p) => (
            <View key={p.key}>
              <Text style={styles.orientacaoText}>{p.nome.trim()}</Text>
              {composeNotes(p) ? <Text style={styles.subtitle}>{composeNotes(p)}</Text> : null}
              {p.itemPlanoId != null ? <Text style={styles.subtitle}>Baixa o item do plano</Text> : null}
            </View>
          ))}
        </View>
      ) : null}

      {draft ? (
        <>
          <View style={styles.headline}>
            <Text style={styles.title}>
              {draft.medicamento} · {draft.doseMin}–{draft.doseMax} {draft.unidade}
            </Text>
            <Text style={styles.subtitle}>
              {draft.frequenciaDia}×/dia · {draft.duracaoDias} dias · {draft.regras.length} regra(s) condicional(is)
            </Text>
          </View>

          {draft.regras.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Regras condicionais</Text>
              {draft.regras.map((regra, index) => (
                <View key={`${regra.condicaoClinicaId}-${index}`}>
                  <View style={styles.ruleRow}>
                    <View style={styles.ruleDot} />
                    <Text style={styles.ruleText}>
                      {descreverCondicao(regra)} → {regra.acao.replace(/_/g, ' ').toLowerCase()}
                    </Text>
                  </View>
                  {index < draft.regras.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : null}

      <View style={styles.signatureSection}>
        <View style={styles.preSignContainer}>
          <Button
            label="Assinar e concluir"
            backgroundColor={colors.action}
            loading={completing}
            onPress={handleSign}
            style={{ width: '100%' }}
          />
        </View>
      </View>
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
  headline: {
    gap: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  orientacaoText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 40,
  },
  ruleDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  ruleText: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  signCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  signRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  signAvatar: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.cardChia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signAvatarText: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  signInfo: {
    flex: 1,
  },
  signName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  signBody: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  signatureSection: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  preSignContainer: {
    alignItems: 'center',
  },
  postSignContainer: {
    alignItems: 'center',
  },
  successAlert: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 12,
  },
  subSuccessText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  pdfThumbnail: {
    width: 80,
    height: 100,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  pdfSeal: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#D1FAE5',
    padding: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFF',
  },
});
