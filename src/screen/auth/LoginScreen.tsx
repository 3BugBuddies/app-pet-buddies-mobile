import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FieldError } from '../../component/forms/FieldError';
import { Button } from '../../component/ui/Button';
import { Card } from '../../component/ui/Card';
import { Input } from '../../component/ui/Input';
import { useLoginControl } from '../../control/authControl';
import type { AuthStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../../styles/theme';

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { email, setEmail, senha, setSenha, erros, entrar, isEntrando } = useLoginControl();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Pet Buddies</Text>
        <Text style={styles.subtitle}>Entre para cuidar dos seus pets</Text>

        <Card style={styles.card}>
          <Input
            label="E-mail"
            placeholder="voce@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            hasError={!!erros.email}
          />
          <FieldError message={erros.email} />

          <Input
            label="Senha"
            placeholder="••••••••"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            hasError={!!erros.senha}
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
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
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
});
