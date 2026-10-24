import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { BrandMark } from '../../component/ui/BrandMark';
import { Button } from '../../component/ui/Button';
import type { PacientesTabParamList, VetTabParamList } from '../navigation/types';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';

import { useTabBarSpace } from '../navigation/useTabBarSpace';
type Props = NativeStackScreenProps<PacientesTabParamList, 'CheckoutAtendimento'>;
type CheckoutNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<PacientesTabParamList, 'CheckoutAtendimento'>,
  BottomTabNavigationProp<VetTabParamList>
>;

export function CheckoutAtendimentoScreen({ route }: Props) {
  const { petName, procedures = [], prescription } = route.params;
  const navigation = useNavigation<CheckoutNavigationProp>();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();

  const handleFinish = () => {
    navigation.popToTop();
    navigation.navigate('HojeTab', { screen: 'AgendaClinica' });
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 40), paddingBottom: tabBarSpace }]}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <BrandMark style={styles.celebrationMark} />
        </View>

        <Text style={styles.title}>Atendimento concluído</Text>
        <Text style={styles.subtitle}>
          O atendimento de <Text style={styles.bold}>{petName}</Text> foi salvo no histórico médico.
        </Text>

        {procedures.length > 0 || prescription ? (
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>O que ficou registrado</Text>
            {procedures.map((nome, index) => (
              <Text key={`${nome}-${index}`} style={styles.summaryText}>{nome}</Text>
            ))}
            {prescription ? <Text style={styles.summaryText}>Receita · {prescription}</Text> : null}
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button 
          label="Voltar para Hoje"
          backgroundColor={colors.action}
          onPress={handleFinish} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  content: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: radii.pill,
    backgroundColor: '#FFF3D4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  celebrationMark: {
    width: 104,
    height: 104,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  bold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  summary: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  footer: {
    paddingHorizontal: spacing.lg,
  },
});
