import { useNavigation } from '@react-navigation/native';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccountTopBar } from '../../component/account/AccountTopBar';
import { FieldError } from '../../component/forms/FieldError';
import { Button } from '../../component/ui/Button';
import { Card } from '../../component/ui/Card';
import { Input } from '../../component/ui/Input';
import { usePasswordControl } from '../../control/useAccountControl';
import { colors, spacing, typography } from '../../styles/theme';
import { useTabBarSpace } from '../navigation/useTabBarSpace';

export function TrocarSenhaScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const {
    senhaAtual, setSenhaAtual,
    senhaNova, setSenhaNova,
    confirmarSenha, setConfirmarSenha,
    erros, trocar, isTrocando,
  } = usePasswordControl(() =>
    Alert.alert('Senha alterada', 'Use a nova senha no próximo login.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]),
  );

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.topBar}>
        <AccountTopBar title="Trocar senha" />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}
        >
          <Card>
            <Input
              label="Senha atual"
              placeholder="••••••••"
              secureTextEntry
              value={senhaAtual}
              onChangeText={setSenhaAtual}
              hasError={!!erros.senhaAtual}
            />
            <FieldError message={erros.senhaAtual} />

            <Input
              label="Nova senha"
              placeholder="••••••••"
              secureTextEntry
              value={senhaNova}
              onChangeText={setSenhaNova}
              hasError={!!erros.senhaNova}
            />
            <FieldError message={erros.senhaNova} />

            <Input
              label="Confirmar nova senha"
              placeholder="••••••••"
              secureTextEntry
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              hasError={!!erros.confirmarSenha}
            />
            <FieldError message={erros.confirmarSenha} />

            {erros.geral ? <Text style={styles.apiError}>{erros.geral}</Text> : null}

            <View style={styles.buttonSpacing}>
              <Button label="Trocar senha" backgroundColor={colors.primary} loading={isTrocando} onPress={trocar} />
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  topBar: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  content: { paddingHorizontal: spacing.lg },
  apiError: { ...typography.caption, color: colors.error, marginBottom: spacing.sm },
  buttonSpacing: { marginTop: spacing.sm },
});
