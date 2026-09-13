import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { DoseTrack } from '../../component/checkin/DoseTrack';
import { Button } from '../../component/ui/Button';
import { useEscalationPreview } from '../../control/useCheckInControl';
import type { PlanoTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';
import { parseDoseRange } from '../../model/careRules';

type Props = NativeStackScreenProps<PlanoTabParamList, 'CheckInResult'>;

export function CheckInResultScreen({ route }: Props) {
  const { petId, result } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PlanoTabParamList>>();
  const insets = useSafeAreaInsets();
  const escalationPreview = useEscalationPreview();

  // Fallbacks de segurança absolutos para evitar "undefined" ou "NaN" quebrando a UI
  const safeVetName = result.vetName || 'Clínica Veterinária';
  const safeDoseRangeLabel = result.doseRangeLabel || 'Dose padrão';
  const safeDoseLabel = result.doseLabel || 'Dose recomendada';
  const safePoints = result.pointsEarned || 0;

  const vetInitial =
    safeVetName
      .split(' ')
      .find((part) => !/^(dr|dra)\.?$/i.test(part))
      ?.charAt(0)
      .toUpperCase() ?? safeVetName.charAt(0).toUpperCase();

  const range = parseDoseRange(safeDoseRangeLabel);
  // Previne divisão por zero ou NaN caso parseDoseRange retorne zeros
  const fillPct =
    range.max > range.min && range.min > 0
      ? ((Number.parseFloat(safeDoseLabel) - range.min) / (range.max - range.min)) * 100
      : 50;

  const handleFinish = () => {
    navigation.navigate('CarePlan', { petId }); // Home já está travada — apenas retorna
  };

  const handlePreviewEscalation = async () => {
    const preview = await escalationPreview.mutateAsync();
    navigation.navigate('CheckInEscalation', { petId, result: preview });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 80 }]}>
      <CheckInTopBar title="Dose de hoje" subtitle={safeDoseRangeLabel} stepLabel="3 / 3" />

      <View style={styles.doseCard}>
        <Text style={styles.doseLabel}>Dose de hoje</Text>
        <View style={styles.doseRow}>
          <Text style={styles.doseValue}>{safeDoseLabel}</Text>
          <Text style={styles.doseRange}>da faixa {safeDoseRangeLabel}</Text>
        </View>
        <DoseTrack
          minLabel={`${range.min} ${range.unit} · menor`}
          maxLabel={`${range.max} ${range.unit} · maior`}
          fillPct={Math.max(0, Math.min(100, fillPct))}
        />
      </View>

      <View style={styles.ruleCard}>
        <Text style={styles.ruleLabel}>Regra da prescrição</Text>
        <Text style={styles.ruleCode}>{result.ruleDescription}</Text>
        <Text style={styles.ruleMeta}>{result.ruleConfirmedAtLabel}</Text>
        <View style={styles.ruleDivider} />
        <View style={styles.vetRow}>
          <View style={styles.vetAvatar}>
            <Text style={styles.vetAvatarText}>{vetInitial}</Text>
          </View>
          <View>
            <Text style={styles.vetName}>{safeVetName}</Text>
            <Text style={styles.vetCrmv}>
              {result.vetCrmv} · prescrição de {result.prescriptionDateLabel}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.recordRow}>
        <View style={styles.recordDot} />
        <Text style={styles.recordText}>
          Registrado no prontuário · +{safePoints} pts
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          backgroundColor={colors.warning}
          label="Entendi, voltar para Home"
          onPress={handleFinish}
          textColor={colors.textLight}
        />
        <Button
          label="Ver o que muda se piorar"
          loading={escalationPreview.isPending}
          onPress={handlePreviewEscalation}
          variant="secondary"
        />
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
  doseCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  doseLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.warning,
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  doseValue: {
    fontSize: 56,
    fontWeight: '700',
    letterSpacing: -1.5,
    color: colors.textPrimary,
  },
  doseRange: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  ruleCard: {
    backgroundColor: colors.cardChia,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  ruleLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  ruleCode: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: colors.textPrimary,
  },
  ruleMeta: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  ruleDivider: {
    height: 1,
    backgroundColor: `${colors.primary}33`,
  },
  vetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  vetAvatar: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vetAvatarText: {
    fontWeight: '700',
    color: colors.primary,
  },
  vetName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  vetCrmv: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  recordDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.success,
  },
  recordText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});
