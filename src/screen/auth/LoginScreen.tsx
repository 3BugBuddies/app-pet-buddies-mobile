import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FieldError } from '../../component/forms/FieldError';
import { Button } from '../../component/ui/Button';
import { Card } from '../../component/ui/Card';
import { Input } from '../../component/ui/Input';
import { LogoHeader } from '../../component/ui/LogoHeader';
import { useLoginControl } from '../../control/authControl';
import type { AuthStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../../styles/theme';

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { email, setEmail, senha, setSenha, erros, entrar, isEntrando } = useLoginControl();
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Logo fixo no topo — fica fora do scroll para não sumir com o teclado */}
      <View style={styles.logoArea}>
        <LogoHeader size="large" />
        <Text style={styles.subtitle}>Entre para cuidar dos seus pets</Text>
      </View>

      {/* KeyboardAvoidingView só envolve o formulário */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.card}>
            <Input
              label="E-mail"
              placeholder="voce@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              hasError={!!erros.email}
              returnKeyType="next"
            />
            <FieldError message={erros.email} />

            <Input
              label="Senha"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              value={senha}
              onChangeText={setSenha}
              hasError={!!erros.senha}
              returnKeyType="done"
              onSubmitEditing={entrar}
              rightElement={
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
                </Pressable>
              }
            />
            <FieldError message={erros.senha} />

            {erros.geral ? <Text style={styles.apiError}>{erros.geral}</Text> : null}

            <View style={styles.buttonSpacing}>
              <Button label="Entrar" loading={isEntrando} onPress={entrar} />
            </View>
          </Card>

          <Pressable onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
            <Text style={styles.registerText}>Ainda não tem conta? Cadastre-se</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  logoArea: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    gap: 0,
  },
  buttonSpacing: {
    marginTop: spacing.sm,
  },
  apiError: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  registerLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  registerText: {
    ...typography.body,
    color: colors.primary,
  },
  eyeIcon: {
    fontSize: 18,
    lineHeight: 22,
  },
});
