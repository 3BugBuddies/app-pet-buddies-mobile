import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../component/ui/Button';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { usePet } from '../../control/usePetsControl';
import type { PlanoTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';

import { useTabBarSpace } from '../navigation/useTabBarSpace';
type Props = NativeStackScreenProps<PlanoTabParamList, 'CheckInEscalation'>;

export function CheckInEscalationScreen({ route }: Props) {
  const { petId, result } = route.params;
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const { data: pet } = usePet(petId);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: tabBarSpace }]}>
      <CheckInTopBar title="Check-in" />

      <View style={styles.alertBlock}>
        <Text style={styles.badgeText}>Sinal de alarme</Text>
        <Text style={styles.title}>
          Hoje não tem dose em casa. {pet?.nome ?? 'Seu pet'} precisa da clínica.
        </Text>
        <Text style={styles.body}>
          {result.reasonFromConditions ? 'Você confirmou ' : 'Você relatou '}
          <Text style={styles.bodyStrong}>{result.reasonLabel}</Text>. A regra de {result.vetName} suspende o
          tratamento e pede avaliação presencial. A clínica vê o seu relato.
        </Text>
      </View>

      <View style={styles.ruleCard}>
        <Text style={styles.ruleLabel}>
          {['Regra de ' + result.vetName, result.vetCrmv ? `CRMV ${result.vetCrmv.replace(/^CRMV[\s-]*/i, '')}` : '']
            .filter(Boolean)
            .join(' · ')}
        </Text>
        <Text style={styles.ruleCode}>{result.ruleDescription}</Text>
      </View>

      {result.clinicPhone ? (
        <>
          <Text style={styles.clinic}>
            {result.clinicName ? `${result.clinicName} · ` : ''}
            <Text style={styles.clinicPhone}>{result.clinicPhone}</Text>
          </Text>
          <Button
            label="Ligar para a clínica"
            onPress={() => Linking.openURL(`tel:${result.clinicPhone?.replace(/\D/g, '')}`)}
          />
        </>
      ) : null}
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
  alertBlock: {
    backgroundColor: '#FFF0E0',
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textPrimary,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 33,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 16,
    lineHeight: 23,
    color: colors.textSecondary,
  },
  bodyStrong: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  clinic: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  clinicPhone: {
    fontWeight: '700',
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
});
