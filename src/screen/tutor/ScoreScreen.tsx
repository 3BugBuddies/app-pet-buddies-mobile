import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../component/ui/Button';
import type { HomeTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';

type Props = NativeStackScreenProps<HomeTabParamList, 'Score'>;

export function ScoreScreen({ route }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<HomeTabParamList>>();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 80 },
      ]}
    >
      <View style={styles.hero}>
        <Ionicons name="trophy" size={64} color={colors.accent} style={{ marginBottom: spacing.md }} />
        <Text style={styles.heroTitle}>Programa Pata Segura</Text>
        <Text style={styles.heroSub}>
          Em breve, cuidar do seu pet vai render prêmios, descontos e muito mais exclusividade.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Como vai funcionar?</Text>

        <View style={styles.featureRow}>
          <View style={styles.iconBox}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Complete cuidados</Text>
            <Text style={styles.featureDesc}>
              Faça check-ins diários e dê os medicamentos no horário para ganhar pontos.
            </Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.iconBox}>
            <Ionicons name="medkit" size={24} color={colors.primary} />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Prevenção premiada</Text>
            <Text style={styles.featureDesc}>
              Consultas e vacinas em dia aumentam o multiplicador do seu score.
            </Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.iconBox}>
            <Ionicons name="gift" size={24} color={colors.action} />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Troque por benefícios</Text>
            <Text style={styles.featureDesc}>
              Suba de tier (Bronze, Prata, Ouro) e troque pontos por exames e serviços na clínica.
            </Text>
          </View>
        </View>
      </View>

      <Button
        label="Voltar para a Home"
        onPress={() => navigation.goBack()}
        style={{ marginTop: spacing.lg }}
      />
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
  },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroTitle: {
    fontFamily: 'Sora',
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSub: {
    fontFamily: 'Inter',
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.lg,
  },
  cardTitle: {
    fontFamily: 'Sora',
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  featureRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.cardChia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  featureDesc: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
