import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../component/ui/Button';
import { LogoHeader } from '../../component/ui/LogoHeader';
import { colors, radii, spacing, typography } from '../../styles/theme';
import type { AuthStackParamList } from '../navigation/types';

// Asset: add `onboarding-transperent.png` to assets/images/ before shipping
const heroImage = require('../../../assets/images/onboarding-transperent.png');

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <LogoHeader size="large" style={styles.logo} />
        <Pressable
          onPress={() => navigation.navigate('Login')}
          accessibilityRole="button"
          accessibilityLabel="Pular onboarding"
          hitSlop={12}
        >
          <Text style={styles.skip}>Pular</Text>
        </Pressable>
      </View>

      {/* Hero blob */}
      <View style={styles.heroBlob}>
        <Image source={heroImage} style={styles.heroImage} resizeMode="contain" />
      </View>

      {/* Copy */}
      <View style={styles.copy}>
        <Text style={styles.headline}>
          Um cuidado que conecta você, sua clínica e seus pets.
        </Text>
        <Text style={styles.body}>
          Acompanhe a rotina de saúde com mais clareza, carinho e prevenção.
        </Text>
      </View>

      {/* CTAs */}
      <View style={styles.actions}>
        <Button
          label="Cadastrar Tutor"
          backgroundColor={colors.action}
          textColor={colors.textLight}
          onPress={() => navigation.navigate('Register')}
        />
        <Button
          label="Cadastrar Clínica/Vet"
          variant="secondary"
          onPress={() => navigation.navigate('Register')}
        />
        <Pressable
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
          accessibilityRole="button"
        >
          <Text style={styles.loginText}>Já tenho conta? Entrar</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>PET BUDDIES • SEMPRE POR PERTO ♥</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  logo: {
    marginBottom: 0,
  },
  skip: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  heroBlob: {
    backgroundColor: colors.cardChia,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    overflow: 'hidden',
    minHeight: 280,
  },
  heroImage: {
    width: '90%',
    height: 260,
  },
  copy: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  headline: {
    ...typography.title,
    fontSize: 28,
    color: colors.textPrimary,
    lineHeight: 36,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  loginText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  footer: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 'auto',
  },
});
