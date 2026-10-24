import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccountTopBar } from '../../component/account/AccountTopBar';
import { FieldError } from '../../component/forms/FieldError';
import { Button } from '../../component/ui/Button';
import { Card } from '../../component/ui/Card';
import { ErrorState } from '../../component/ui/ErrorState';
import { Input } from '../../component/ui/Input';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useLogoutControl } from '../../control/authControl';
import { useAccountControl } from '../../control/useAccountControl';
import { colors, radii, spacing, typography } from '../../styles/theme';
import type { HomeTabParamList } from '../navigation/types';
import { useTabBarSpace } from '../navigation/useTabBarSpace';

export function MinhaContaScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeTabParamList>>();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const { sair } = useLogoutControl();
  const {
    nome, email, form, setNome, setTelefone, setEndereco,
    erros, salvar, isSalvando, isLoading, isError, refetch,
  } = useAccountControl(() => navigation.goBack());

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.topBar}>
        <AccountTopBar title="Minha conta" />
      </View>

      {isLoading ? (
        <LoadingIndicator />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}
          >
            <View style={styles.profile}>
              <View style={styles.avatar}>
                <Text style={styles.avatarLetter}>{nome.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.name} numberOfLines={1}>{nome}</Text>
                <Text style={styles.role} numberOfLines={1}>Responsável · {email}</Text>
              </View>
            </View>

            <Card style={styles.card}>
              <Input label="Nome" value={form.nome} onChangeText={setNome} hasError={!!erros.nome} />
              <FieldError message={erros.nome} />

              <Input
                label="Telefone"
                keyboardType="phone-pad"
                value={form.telefone}
                onChangeText={setTelefone}
                hasError={!!erros.telefone}
              />
              <FieldError message={erros.telefone} />
              <Text style={styles.hint}>A clínica liga neste número quando precisa.</Text>

              <Input
                label="Endereço · opcional"
                value={form.endereco}
                onChangeText={setEndereco}
                hasError={!!erros.endereco}
              />
              <FieldError message={erros.endereco} />
              <Text style={styles.hint}>A clínica usa para traçar a rota até você.</Text>

              <Text style={styles.label}>E-mail</Text>
              <View style={styles.readOnly}>
                <Text style={styles.readOnlyText} numberOfLines={1}>{email}</Text>
              </View>
              <Text style={[styles.hint, styles.hintLast]}>É o seu login e não muda por aqui.</Text>
            </Card>

            {erros.geral ? <Text style={styles.apiError}>{erros.geral}</Text> : null}

            <Button label="Salvar alterações" backgroundColor={colors.action} loading={isSalvando} onPress={salvar} />

            <Card style={styles.list}>
              <ListRow label="Trocar senha" onPress={() => navigation.navigate('TrocarSenha')} />
              <View style={styles.divider} />
              <ListRow label="Sair da conta" onPress={sair} />
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

function ListRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.listRow}>
      <Text style={styles.listLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  topBar: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  content: { paddingHorizontal: spacing.lg, gap: spacing.md },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.cardAlert,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { ...typography.title, color: colors.textPrimary },
  name: { ...typography.subtitle, fontSize: 20, color: colors.textPrimary },
  role: { ...typography.body, color: colors.textSecondary },
  card: { gap: 0 },
  label: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xs },
  hint: { ...typography.caption, color: colors.textSecondary, marginTop: -spacing.xs, marginBottom: spacing.md },
  hintLast: { marginBottom: 0, marginTop: spacing.xs },
  readOnly: {
    backgroundColor: colors.border,
    borderRadius: radii.sm,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  readOnlyText: { ...typography.body, color: colors.textSecondary },
  apiError: { ...typography.caption, color: colors.error },
  list: { paddingVertical: spacing.xs },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  listLabel: { ...typography.subtitle, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border },
});
