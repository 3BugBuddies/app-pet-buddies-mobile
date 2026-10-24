import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../component/ui/Button';
import { formatHourShort } from '../../model/closingSummary';
import { formatShortDate } from '../../model/formatDate';
import type { PacientesTabParamList, VetTabParamList } from '../navigation/types';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';
import { useTabBarSpace } from '../navigation/useTabBarSpace';

type Props = NativeStackScreenProps<PacientesTabParamList, 'CheckoutAtendimento'>;
type CheckoutNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<PacientesTabParamList, 'CheckoutAtendimento'>,
  BottomTabNavigationProp<VetTabParamList>
>;

export function CheckoutAtendimentoScreen({ route }: Props) {
  const { summary } = route.params;
  const navigation = useNavigation<CheckoutNavigationProp>();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();

  const handleFinish = () => {
    navigation.popToTop();
    navigation.navigate('HojeTab', { screen: 'AgendaClinica' });
  };

  const subtitle = [
    summary.petName,
    summary.reason,
    `${formatShortDate(summary.whenIso)}, ${formatHourShort(summary.whenIso)}`,
  ]
    .filter(Boolean)
    .join(' · ');
  const seesInApp = summary.responsavel ? `a ${summary.responsavel} já vê no app` : 'o responsável já vê no app';

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 40), paddingBottom: tabBarSpace }]}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={56} color={colors.primary} />
        </View>

        <Text style={styles.title}>Atendimento concluído</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.summary}>
          <Text style={styles.label}>O que ficou registrado</Text>

          <Block label="Registro" title={summary.reason || 'Atendimento'} />
          {summary.vaccines.map((v, index) => (
            <Block
              key={`${v.nome}-${index}`}
              label={v.alvo ? 'Vacina baixada do plano' : 'Vacina avulsa'}
              title={v.nome}
              sub={v.alvo ? `item previsto para ${v.alvo} concluído` : 'fora do plano'}
            />
          ))}
          {summary.others.map((o, index) => (
            <Block key={`${o.nome}-${index}`} label={o.label} title={o.nome} />
          ))}
          {summary.medicamento ? (
            <Block label="Receita" title={`${summary.medicamento} assinada`} sub={seesInApp} />
          ) : null}
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Voltar para Hoje" backgroundColor={colors.action} onPress={handleFinish} />
      </View>
    </View>
  );
}

function Block({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <View style={styles.block}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.blockTitle}>{title}</Text>
      {sub ? <Text style={styles.blockSub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, justifyContent: 'space-between' },
  content: { paddingHorizontal: spacing.lg, alignItems: 'center', marginTop: spacing.xl },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: radii.pill,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  summary: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: colors.textSecondary },
  block: { gap: 2 },
  blockTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  blockSub: { fontSize: 15, color: colors.textSecondary },
  footer: { paddingHorizontal: spacing.lg },
});
