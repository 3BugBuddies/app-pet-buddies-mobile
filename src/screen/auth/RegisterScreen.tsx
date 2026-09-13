import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FieldError } from '../../component/forms/FieldError';
import { Button } from '../../component/ui/Button';
import { Card } from '../../component/ui/Card';
import { Input } from '../../component/ui/Input';
import { useRegisterControl } from '../../control/authControl';
import type { AuthStackParamList } from '../navigation/types';
import { colors, radii, spacing, typography } from '../../styles/theme';

const PERFIL_LABEL: Record<string, string> = {
  TUTOR: 'Tutor',
  VET: 'Veterinário',
};

export function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const insets = useSafeAreaInsets();
  const {
    nome, setNome,
    email, setEmail,
    senha, setSenha,
    confirmarSenha, setConfirmarSenha,
    perfil, setPerfil,
    telefone, setTelefone,
    crmv, setCrmv,
    perfis,
    erros,
    cadastrar,
    isCadastrando,
  } = useRegisterControl();

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
      <Image
        source={require('../../../assets/images/logo-pb-bottom.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.card}>
            <Text style={styles.sectionLabel}>Eu sou</Text>

            <View style={styles.perfilRow}>
              {perfis.map((opcao) => (
                <Pressable
                  key={opcao}
                  onPress={() => setPerfil(opcao)}
                  style={[styles.perfilChip, perfil === opcao && styles.perfilChipAtivo]}
                >
                  <Text style={[styles.perfilChipText, perfil === opcao && styles.perfilChipTextAtivo]}>
                    {PERFIL_LABEL[opcao]}
                  </Text>
                </Pressable>
              ))}
            </View>
            <FieldError message={erros.perfil} />

            <Input label="Nome" placeholder="Seu nome completo" value={nome} onChangeText={setNome} hasError={!!erros.nome} />
            <FieldError message={erros.nome} />

            <Input label="E-mail" placeholder="voce@email.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} hasError={!!erros.email} />
            <FieldError message={erros.email} />

            {perfil === 'TUTOR' ? (
              <>
                <Input
                  label="Telefone"
                  placeholder="ex.: 11 98765-4321"
                  keyboardType="phone-pad"
                  value={telefone}
                  onChangeText={setTelefone}
                  hasError={!!erros.telefone}
                />
                <FieldError message={erros.telefone} />
              </>
            ) : (
              <>
                <Input
                  label="CRMV"
                  placeholder="ex.: CRMV-SP 12345"
                  autoCapitalize="characters"
                  value={crmv}
                  onChangeText={setCrmv}
                  hasError={!!erros.crmv}
                />
                <FieldError message={erros.crmv} />
              </>
            )}

            <Input label="Senha" placeholder="••••••••" secureTextEntry value={senha} onChangeText={setSenha} hasError={!!erros.senha} />
            <FieldError message={erros.senha} />

            <Input label="Confirmar senha" placeholder="••••••••" secureTextEntry value={confirmarSenha} onChangeText={setConfirmarSenha} hasError={!!erros.confirmarSenha} />
            <FieldError message={erros.confirmarSenha} />

            {erros.geral ? <Text style={styles.apiError}>{erros.geral}</Text> : null}

            <View style={styles.buttonSpacing}>
              <Button label="Cadastrar" loading={isCadastrando} onPress={cadastrar} />
            </View>
          </Card>

          <Pressable onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
            <Text style={styles.loginText}>Já tem conta? Entrar</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, paddingBottom: spacing.xl },
  logo: { width: 140, height: 56, alignSelf: 'center', marginBottom: spacing.lg },
  card: { gap: 0 },
  sectionLabel: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xs },
  perfilRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  perfilChip: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingVertical: spacing.sm, alignItems: 'center' },
  perfilChipAtivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  perfilChipText: { ...typography.body, color: colors.textSecondary },
  perfilChipTextAtivo: { color: colors.textLight, fontWeight: 'bold' },
  buttonSpacing: { marginTop: spacing.sm },
  apiError: { ...typography.caption, color: colors.error, marginBottom: spacing.sm },
  loginLink: { marginTop: spacing.lg, alignItems: 'center' },
  loginText: { ...typography.body, color: colors.primary, fontWeight: 'bold' },
});
