import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Share, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../component/ui/Button';
import type { PacientesTabParamList, VetTabParamList } from '../navigation/types';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<PacientesTabParamList, 'CheckoutAtendimento'>;
type CheckoutNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<PacientesTabParamList, 'CheckoutAtendimento'>,
  BottomTabNavigationProp<VetTabParamList>
>;

export function CheckoutAtendimentoScreen({ route }: Props) {
  const { petName, resumoPrescricao } = route.params;
  const navigation = useNavigation<CheckoutNavigationProp>();
  const insets = useSafeAreaInsets();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Receita Pet Buddies 🐾\nPaciente: ${petName}\n\nPrescrição:\n${resumoPrescricao}\n\nAcesse o App Pet Buddies para ver detalhes e dosagens exatas!`,
        title: `Receita - ${petName}`, // Usado em alguns dispositivos/emails
      });
    } catch (error: any) {
      // Ignorar erros de cancelamento do usuário
    }
  };

  const handleFinish = () => {
    navigation.navigate('HojeTab', { screen: 'AgendaClinica' });
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 40), paddingBottom: Math.max(insets.bottom, 40) }]}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={80} color={colors.success} />
        </View>

        <Text style={styles.title}>Atendimento Concluído!</Text>
        <Text style={styles.subtitle}>
          O prontuário e as prescrições de <Text style={styles.bold}>{petName}</Text> foram salvos com sucesso no histórico médico.
        </Text>

        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Entregar Prescrição</Text>
          <Text style={styles.actionBody}>
            Compartilhe a receita digital com o tutor via WhatsApp, E-mail ou Link.
          </Text>
          
          <Button 
            label="Compartilhar Receita (PDF)" 
            onPress={handleShare} 
            icon={<Ionicons name="share-outline" size={20} color={colors.textLight} style={{ marginRight: 8 }} />}
          />
        </View>

      </View>

      <View style={styles.footer}>
        <Button 
          variant="secondary" 
          label="Voltar para a Agenda" 
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
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  bold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionBody: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.lg,
  },
});
