import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { usePet } from '../../control/usePetsControl';
import type { PlanoTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';

type Props = NativeStackScreenProps<PlanoTabParamList, 'CheckInEscalation'>;

export function CheckInEscalationScreen({ route }: Props) {
  const { petId, result } = route.params;
  const { data: pet } = usePet(petId);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <CheckInTopBar title="Check-in" dark />

      <View style={styles.alertBlock}>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>SINAL DE ALARME</Text>
        </View>
        <Text style={styles.title}>
          Hoje não tem dose em casa. {pet?.nome ?? 'Seu pet'} precisa da clínica.
        </Text>
        <Text style={styles.body}>
          Você relatou <Text style={styles.bodyStrong}>{result.reasonLabel}</Text>. A regra da{' '}
          {result.vetName} interrompe o tratamento e pede avaliação presencial.
        </Text>
      </View>

      <View style={styles.ruleCard}>
        <Text style={styles.ruleLabel}>Regra da prescrição</Text>
        <Text style={styles.ruleCode}>{result.ruleDescription}</Text>
        <Text style={styles.ruleMeta}>
          {result.vetName} · {result.vetCrmv}
        </Text>
      </View>

      <Text style={styles.vetNotified}>A {result.vetName} já foi avisada deste check-in.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.textPrimary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  alertBlock: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.error,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.textLight,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: colors.textLight,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 34,
    color: colors.textLight,
  },
  body: {
    fontSize: 16,
    lineHeight: 23,
    color: 'rgba(255,255,255,0.72)',
  },
  bodyStrong: {
    color: colors.textLight,
    fontWeight: '700',
  },
  ruleCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  ruleLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.6)',
  },
  ruleCode: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textLight,
  },
  ruleMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  vetNotified: {
    marginTop: spacing.md,
    textAlign: 'center',
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
  },
});
