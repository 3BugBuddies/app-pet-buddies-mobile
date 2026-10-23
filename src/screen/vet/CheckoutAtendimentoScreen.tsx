import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../component/ui/Button';
import type { PacientesTabParamList, VetTabParamList } from '../navigation/types';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<PacientesTabParamList, 'CheckoutAtendimento'>;
type CheckoutNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<PacientesTabParamList, 'CheckoutAtendimento'>,
  BottomTabNavigationProp<VetTabParamList>
>;

export function CheckoutAtendimentoScreen({ route }: Props) {
  const { petName } = route.params;
  const navigation = useNavigation<CheckoutNavigationProp>();
  const insets = useSafeAreaInsets();

  const handleFinish = () => {
    navigation.popToTop();
    navigation.navigate('HojeTab', { screen: 'AgendaClinica' });
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 40), paddingBottom: Math.max(insets.bottom, 40) }]}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={80} color={colors.success} />
        </View>

        <Text style={styles.title}>Atendimento concluído</Text>
        <Text style={styles.subtitle}>
          O atendimento de <Text style={styles.bold}>{petName}</Text> foi salvo no histórico médico.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button 
          label="Voltar para a agenda"
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
    marginBottom: spacing.md,
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
  footer: {
    paddingHorizontal: spacing.lg,
  },
});
