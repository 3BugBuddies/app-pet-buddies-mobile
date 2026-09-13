import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { HomeTabParamList } from '../navigation/types';
import { colors, spacing } from '../../styles/theme';
import { Button } from '../../component/ui/Button';

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
      showsVerticalScrollIndicator={false}
    >
      {/* HERO BANNER SUPERIOR */}
      <Image
        source={require('../../../assets/images/banner-pata-segura.png')}
        style={styles.topBanner}
        resizeMode="contain"
      />

      <Text style={styles.sectionTitle}>Como funciona?</Text>

      {/* BENTO GRID DE FEATURES */}
      <View style={styles.bentoGrid}>

        {/* Feature 1: Selos por Visita */}
        <View style={styles.bentoCard}>
          <View style={[styles.iconBox, { backgroundColor: `${colors.primary}15` }]}>
            <Feather name="check-circle" size={24} color={colors.primary} />
          </View>
          <Text style={styles.featureTitle}>1 Cuidado = 1 Selo</Text>
          <Text style={styles.featureDesc}>
            Consultas, vacinas e exames de rotina na clínica geram selos automáticos no seu cartão virtual.
          </Text>
        </View>

        {/* Feature 2: Bônus de Pontualidade */}
        <View style={styles.bentoCard}>
          <View style={[styles.iconBox, { backgroundColor: `${colors.warning}15` }]}>
            <Feather name="clock" size={24} color={colors.warning} />
          </View>
          <Text style={styles.featureTitle}>Bônus de Pontualidade</Text>
          <Text style={styles.featureDesc}>
            Manteve o reforço da vacina na data certa recomendada pela IA? Você ganha selos extras pelo compromisso!
          </Text>
        </View>

        {/* Feature 3: Recompensas Reais */}
        <View style={styles.bentoCard}>
          <View style={[styles.iconBox, { backgroundColor: `${colors.success}15` }]}>
            <Feather name="gift" size={24} color={colors.success} />
          </View>
          <Text style={styles.featureTitle}>Recompensas Reais</Text>
          <Text style={styles.featureDesc}>
            Complete a cartela de 10 selos e desbloqueie serviços de saúde preventiva por nossa conta, como check-ups.
          </Text>
        </View>

      </View>

      {/* BANNER INFERIOR */}
      <Image
        source={require('../../../assets/images/banner-pata-segura-bottom.png')}
        style={styles.bottomBanner}
        resizeMode="contain"
      />

      <Button
        label="Voltar para a Home"
        onPress={() => navigation.goBack()}
        style={{ marginTop: spacing.sm }}
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
  },
  topBanner: {
    width: '100%',
    height: 180,
    borderRadius: 24,
    marginBottom: spacing.xl,
  },
  bottomBanner: {
    width: '100%',
    height: 140,
    borderRadius: 24,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  bentoGrid: {
    gap: spacing.md,
  },
  bentoCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  featureDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
