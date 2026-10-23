import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { DoseTrack } from '../../component/checkin/DoseTrack';
import { Button } from '../../component/ui/Button';
import type { PlanoTabParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';
import { parseDoseRange } from '../../model/careRules';

type Props = NativeStackScreenProps<PlanoTabParamList, 'CheckInResult'>;

export function CheckInResultScreen({ route }: Props) {
  const { petId, result } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PlanoTabParamList>>();
  const insets = useSafeAreaInsets();

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
    // Limpa todo o stack do PlanoTab para que a aba Evolução
    // não retenha as telas do check-in na pilha de navegação.
    navigation.popToTop();
    navigation.getParent()?.navigate('HomeTab');
  };

  const isLongText = safeDoseLabel.length > 8;
  const hasRange = range.max > range.min && range.min > 0;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 80 }]}>
      <CheckInTopBar title="Resultado do Check-in" subtitle={safeDoseRangeLabel} stepLabel="3 / 3" />

      {/* Card de Dose / Orientação */}
      <View style={styles.doseCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.doseLabel}>DOSE DE HOJE</Text>
          {safePoints > 0 && (
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeText}>+{safePoints} pts 🏆</Text>
            </View>
          )}
        </View>

        <View style={styles.doseRow}>
          <Text style={[styles.doseValue, isLongText && styles.doseValueLong]} numberOfLines={2}>
            {safeDoseLabel}
          </Text>
        </View>

        {hasRange ? (
          <>
            <Text style={styles.doseRange}>Faixa recomendada: {safeDoseRangeLabel}</Text>
            <DoseTrack
              minLabel={`${range.min} ${range.unit} (Mínima)`}
              maxLabel={`${range.max} ${range.unit} (Máxima)`}
              fillPct={Math.max(0, Math.min(100, fillPct))}
            />
          </>
        ) : result.regraAplicada === false ? (
          <View style={styles.normalStatusBox}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
            <Text style={styles.normalStatusText}>Orientação padrão Mantida. Tudo sob controle!</Text>
          </View>
        ) : null}
      </View>

      {/* Card da Regra da Prescrição */}
      <View style={styles.ruleCard}>
        <Text style={styles.ruleLabel}>Regra da prescrição ativa</Text>
        <Text style={styles.ruleCode}>{result.ruleDescription || 'Orientação padrão sem alteração de dosagem'}</Text>
        {result.ruleConfirmedAtLabel ? <Text style={styles.ruleMeta}>{result.ruleConfirmedAtLabel}</Text> : null}
        
        <View style={styles.ruleDivider} />
        
        <View style={styles.vetRow}>
          <View style={styles.vetAvatar}>
            <Text style={styles.vetAvatarText}>{vetInitial}</Text>
          </View>
          <View style={styles.vetInfo}>
            <Text style={styles.vetName}>{safeVetName}</Text>
            <Text style={styles.vetCrmv}>
              {[
                result.vetCrmv ? `CRMV ${result.vetCrmv.replace(/^CRMV[\s-]*/i, '')}` : '',
                result.prescriptionDateLabel ? `prescrita em ${result.prescriptionDateLabel}` : '',
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          backgroundColor={colors.action}
          label="Concluir Check-in e Ir para Home"
          onPress={handleFinish}
          textColor={colors.textLight}
        />
      </View>

      <Text style={styles.disclaimer}>
        Isto não é uma consulta veterinária: a orientação segue a regra que a veterinária aprovou e
        não substitui exame, diagnóstico nem prescrição. Em caso de sinal de alarme, procure a
        clínica. Teleorientação com aviso prévio ao responsável (Res. CFMV 1.465/2022, art. 8º).
      </Text>
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
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointsBadge: {
    backgroundColor: `${colors.action}1A`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  pointsBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.action,
  },
  doseLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.action,
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  doseValue: {
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: -1,
    color: colors.textPrimary,
  },
  doseValueLong: {
    fontSize: 26,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  doseRange: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  normalStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.success}15`,
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
  vetInfo: {
    flex: 1,
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
    color: colors.textPrimary,
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
    color: colors.textPrimary,
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
  disclaimer: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});
