import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { Button } from '../../component/ui/Button';
import { AuthContext } from '../../context/authContext';
import { useAssinarPrescricaoControl } from '../../control/usePrescriptionControl';
import { usePet } from '../../control/usePetsControl';
import type { PacientesTabParamList } from '../navigation/types';
import type { VetTabParamList } from '../navigation/types';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, radii, spacing } from '../../styles/theme';

type Props = NativeStackScreenProps<PacientesTabParamList, 'AssinarPrescricao'>;
type AssinarNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<PacientesTabParamList, 'AssinarPrescricao'>,
  BottomTabNavigationProp<VetTabParamList>
>;

export function AssinarPrescricaoScreen({ route }: Props) {
  const { draft } = route.params;
  const navigation = useNavigation<AssinarNavigationProp>();
  const { session } = useContext(AuthContext);
  const { data: pet } = usePet(draft.animalId);
  const { assinar, isAssinando, erro } = useAssinarPrescricaoControl(draft);

  const handleSign = async () => {
    try {
      await assinar();
      navigation.navigate('HojeTab', { screen: 'AgendaClinica' });
    } catch {
      // erro ja fica visivel via `erro` (estado da mutation), nao precisa de Alert aqui.
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <CheckInTopBar title="Assinar prescrição" subtitle={pet?.nome} />

      <View style={styles.headline}>
        <Text style={styles.title}>
          {draft.medicamento} · {draft.doseMin}–{draft.doseMax} {draft.unidade}
        </Text>
        <Text style={styles.subtitle}>
          {draft.frequenciaDia}×/dia · {draft.duracaoDias} dias · {draft.regras.length} regra(s) condicional(is)
        </Text>
      </View>

      {draft.orientacao ? (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Orientação</Text>
          <Text style={styles.orientacaoText}>{draft.orientacao}</Text>
        </View>
      ) : null}

      {draft.regras.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Regras condicionais</Text>
          {draft.regras.map((regra, index) => (
            <View key={`${regra.condicaoClinicaId}-${index}`}>
              <View style={styles.ruleRow}>
                <View style={styles.ruleDot} />
                <Text style={styles.ruleText}>
                  {regra.rotuloCongelado.toLowerCase()} → {regra.acao.replace(/_/g, ' ').toLowerCase()}
                </Text>
              </View>
              {index < draft.regras.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.footNote}>
        <View style={styles.footNoteDot} />
        <Text style={styles.footNoteText}>
          Relato sem regra correspondente cai em <Text style={styles.bold}>«confirmar com a clínica»</Text>, nunca em dose.
        </Text>
      </View>

      <View style={styles.signCard}>
        <View style={styles.signRow}>
          <View style={styles.signAvatar}>
            <Text style={styles.signAvatarText}>{(session?.nome ?? 'V').charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.signInfo}>
            <Text style={styles.signName}>{session?.nome ? `Dra. ${session.nome}` : 'Veterinário(a)'}</Text>
          </View>
        </View>
        <Text style={styles.signBody}>
          Ao assinar, a faixa e as regras passam a valer no app da tutora. Cada dose do dia carrega
          esta assinatura.
        </Text>
        {erro ? <Text style={styles.errorText}>{erro}</Text> : null}
        <Button label="Assinar e publicar" loading={isAssinando} onPress={handleSign} />
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
  footNote: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  footNoteDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.warning,
    marginTop: 6,
  },
  footNoteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  bold: {
    color: colors.textPrimary,
    fontWeight: '700',
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
    color: colors.primary,
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
  errorText: {
    fontSize: 13,
    color: colors.error,
  },
});
