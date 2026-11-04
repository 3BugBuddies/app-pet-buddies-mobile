import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { BrandMark } from '../../component/ui/BrandMark';
import { Button } from '../../component/ui/Button';
import { usePontosDaConsulta } from '../../control/usePontuacaoControl';
import { formatHourShort } from '../../model/closingSummary';
import { formatShortDate } from '../../model/formatDate';
import { daysText } from '../../model/careHome';
import { descreverPontosConsulta, descreverPontosEnviados } from '../../model/pontuacao';
import { pontosAtivos, pontosDetalhe } from '../../model/pontuacaoConfig';
import type { PacientesTabParamList, VetTabParamList } from '../navigation/types';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radii, spacing } from '../../styles/theme';
import { makeStyles, useTheme } from '../../styles/useTheme';
import { useTabBarSpace } from '../navigation/useTabBarSpace';

type Props = NativeStackScreenProps<PacientesTabParamList, 'CheckoutAtendimento'>;
type CheckoutNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<PacientesTabParamList, 'CheckoutAtendimento'>,
  BottomTabNavigationProp<VetTabParamList>
>;

export function CheckoutAtendimentoScreen({ route }: Props) {
  const { colors } = useTheme();
  const styles = useStyles();
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
          <BrandMark style={styles.celebrationMark} />
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
          {summary.medicamentos.length > 0 ? (
            <Block
              label="Receita"
              title={
                summary.medicamentos.length === 1
                  ? `${summary.medicamentos[0].nome} assinada`
                  : `Receita assinada · ${summary.medicamentos.map((m) => `${m.nome} ${daysText(m.duracaoDias)}`).join(', ')}`
              }
              sub={seesInApp}
            />
          ) : null}
          {pontosAtivos ? <PontosBlock consultaId={summary.consultaId} responsavel={summary.responsavel} /> : null}
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Voltar para Hoje" backgroundColor={colors.action} onPress={handleFinish} />
      </View>
    </View>
  );
}

// Sem EXPO_PUBLIC_PONTOS_DETALHE o bloco só confirma o envio, na hora, sem buscar a memória de cálculo.
function PontosBlock({ consultaId, responsavel }: { consultaId: string; responsavel: string }) {
  if (!pontosDetalhe) {
    const { title, sub } = descreverPontosEnviados(responsavel);
    return <Block label="Pontos do responsável" title={title} sub={sub} />;
  }
  return <PontosBlockComDetalhe consultaId={consultaId} responsavel={responsavel} />;
}

// Pontos que o responsável ganhou com esta consulta. O envio ao .NET roda em segundo plano, então
// o bloco começa em "calculando" e o app tenta de novo alguns segundos antes de desistir do detalhe.
function PontosBlockComDetalhe({ consultaId, responsavel }: { consultaId: string; responsavel: string }) {
  const { status, memoria } = usePontosDaConsulta(consultaId);
  const { title, sub } = descreverPontosConsulta(status, memoria, responsavel);
  return <Block label="Pontos do responsável" title={title} sub={sub} />;
}

function Block({ label, title, sub }: { label: string; title: string; sub?: string }) {
  const styles = useStyles();
  return (
    <View style={styles.block}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.blockTitle}>{title}</Text>
      {sub ? <Text style={styles.blockSub}>{sub}</Text> : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.background, justifyContent: 'space-between' },
  content: { paddingHorizontal: spacing.lg, alignItems: 'center', marginTop: spacing.xl },
  celebrationMark: { width: 104, height: 104 },
  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: radii.pill,
    backgroundColor: colors.amberSoft,
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
}));
