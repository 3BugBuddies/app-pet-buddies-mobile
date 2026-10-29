import { Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccountTopBar } from '../../component/account/AccountTopBar';
import { BrandMark } from '../../component/ui/BrandMark';
import { Card } from '../../component/ui/Card';
import { ThemeSelector } from '../../component/ui/ThemeSelector';
import { useAppInfoControl } from '../../control/useAppInfoControl';
import { radii, spacing, typography } from '../../styles/theme';
import { makeStyles } from '../../styles/useTheme';
import { useTabBarSpace } from '../navigation/useTabBarSpace';

export function SobreAppScreen() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const { version, commit, commitFull, branch, dirty, builtAtLabel } = useAppInfoControl();

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.topBar}>
        <AccountTopBar title="Sobre o app" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}
      >
        <View style={styles.brand}>
          <BrandMark style={styles.brandMark} />
          <Text style={styles.brandName}>Pet Buddies</Text>
          <Text style={styles.brandTagline}>
            Aplicativo da plataforma Clyvo Vet: conecta tutores e veterinários em uma jornada contínua de cuidado animal.
          </Text>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Aparência</Text>
          <ThemeSelector />
          <Text style={styles.sectionHint}>Automático segue o tema do seu aparelho.</Text>
        </Card>

        <Card style={styles.card}>
          <InfoRow label="Versão" value={version || 'Não informada'} />
          <View style={styles.divider} />
          <InfoRow label="Commit" value={commit} highlight />
          <View style={styles.divider} />
          <InfoRow label="Branch" value={branch ?? 'Não informada'} />
          <View style={styles.divider} />
          <InfoRow label="Gerado em" value={builtAtLabel} />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.hashLabel}>Hash completo do commit</Text>
          <Text selectable style={styles.hash}>{commitFull}</Text>
        </Card>

        <Text style={styles.note}>
          O commit identifica o código-fonte que gerou esta versão do app.
        </Text>
        {dirty ? (
          <Text style={styles.warning}>
            Esta versão foi gerada com alterações ainda não commitadas, então pode diferir do commit acima.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const styles = useStyles();
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text selectable style={[styles.infoValue, highlight && styles.infoValueHighlight]}>{value}</Text>
    </View>
  );
}

const MONOSPACE = Platform.select({ ios: 'Menlo', default: 'monospace' });

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.background },
  topBar: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  content: { paddingHorizontal: spacing.lg, gap: spacing.md },
  brand: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  brandMark: { width: 72, height: 72 },
  brandName: { ...typography.title, color: colors.textPrimary },
  brandTagline: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  card: { paddingVertical: spacing.xs },
  divider: { height: 1, backgroundColor: colors.border },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  infoLabel: { ...typography.body, color: colors.textSecondary },
  infoValue: { ...typography.subtitle, color: colors.textPrimary, flexShrink: 1, textAlign: 'right' },
  infoValueHighlight: {
    fontFamily: MONOSPACE,
    backgroundColor: colors.cardMax,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sectionTitle: { ...typography.subtitle, color: colors.textPrimary, marginBottom: spacing.sm },
  sectionHint: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  hashLabel: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  hash: {
    fontFamily: MONOSPACE,
    fontSize: 13,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  note: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  warning: { ...typography.caption, color: colors.warning, textAlign: 'center' },
}));
