import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { usePet } from '../../control/usePetsControl';
import { Button } from '../../component/ui/Button';
import type { PlanoTabParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';

import { useTabBarSpace } from '../navigation/useTabBarSpace';
type Props = NativeStackScreenProps<PlanoTabParamList, 'CheckInResult'>;

export function CheckInResultScreen({ route }: Props) {
  const { petId, result } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PlanoTabParamList>>();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const { data: pet } = usePet(petId);

  const safeDoseLabel = result.doseLabel || 'Dose recomendada';
  const ruleApplied = result.ruleApplied !== false;
  const suspended = result.suspended === true;
  const lines = result.lines && result.lines.length > 1 ? result.lines : null;

  const handleFinish = () => {
    // Limpa o stack do PlanoTab para a aba Cuidados não reter as telas do check-in.
    navigation.popToTop();
    navigation.getParent()?.navigate('HomeTab');
  };

  const ruleHeader = [
    result.vetName ? `Regra de ${result.vetName}` : 'Regra da prescrição',
    result.vetCrmv ? `CRMV ${result.vetCrmv.replace(/^CRMV[\s-]*/i, '')}` : '',
    result.prescriptionDateLabel ? `prescrita em ${result.prescriptionDateLabel}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  const dosedFor = [result.medicationLabel, pet?.nome, suspended ? 'a regra suspendeu a dose de hoje' : ruleApplied ? 'a dose vem da regra' : 'dose padrão da receita']
    .filter(Boolean)
    .join(' · ');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: tabBarSpace }]}>
      <CheckInTopBar title="Check-in" stepLabel="3 de 3" />

      {lines ? (
        <View style={styles.doseCard}>
          <Text style={styles.doseLabel}>Doses de hoje</Text>
          {lines.map((line) => (
            <View key={line.medication} style={styles.doseLine}>
              <View style={styles.doseLineHead}>
                <Text style={styles.doseLineName}>{line.medication}</Text>
                <Text style={styles.doseLineValue}>{line.doseLabel}</Text>
              </View>
              <Text style={styles.doseRange}>{[pet?.nome, line.ruleLabel].filter(Boolean).join(' · ')}</Text>
            </View>
          ))}
        </View>
      ) : (
      <View style={styles.doseCard}>
        <Text style={styles.doseLabel}>Dose de hoje</Text>
        <Text style={[styles.doseValue, safeDoseLabel.length > 8 && styles.doseValueLong]} numberOfLines={2}>
          {safeDoseLabel}
        </Text>
        <Text style={styles.doseRange}>{dosedFor}</Text>

        {!ruleApplied && !suspended ? (
          <View style={styles.normalStatusBox}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.textPrimary} />
            <Text style={styles.normalStatusText}>Orientação padrão mantida. Tudo sob controle!</Text>
          </View>
        ) : null}
      </View>
      )}

      <View style={styles.ruleCard}>
        <Text style={styles.ruleLabel}>{ruleHeader}</Text>
        {lines ? null : (
          <Text style={styles.ruleCode}>{result.ruleDescription || 'Orientação padrão sem alteração de dosagem'}</Text>
        )}
      </View>

      {result.itemClosed ? (
        <View style={styles.recordRow}>
          <View style={styles.recordCheck}>
            <Ionicons name="checkmark" size={14} color={colors.textPrimary} />
          </View>
          <Text style={styles.recordText}>{lines ? 'Itens do plano' : 'Item do plano'}</Text>
          <View style={styles.recordPill}>
            <Text style={styles.recordPillText}>{suspended ? 'Sem dose' : lines?.some((line) => line.suspended) ? 'Doses dadas' : 'Dose dada'}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button
          backgroundColor={colors.action}
          label="Concluir · voltar ao início"
          onPress={handleFinish}
          textColor={colors.textLight}
        />
      </View>

      <Text style={styles.disclaimer}>O acompanhamento não substitui a consulta. Em dúvida, fale com a clínica.</Text>
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
  doseCard: {
    backgroundColor: colors.cardAlert,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  doseLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  doseValue: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1,
    color: colors.textPrimary,
  },
  doseValueLong: {
    fontSize: 26,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  doseLine: { gap: 2 },
  doseLineHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: spacing.sm },
  doseLineName: { flexShrink: 1, fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  doseLineValue: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  doseRange: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  normalStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.md,
    marginTop: spacing.xs,
  },
  normalStatusText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  ruleCard: {
    backgroundColor: colors.cardChia,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  ruleLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  ruleCode: {
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  recordCheck: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  recordPill: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  recordPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
});
