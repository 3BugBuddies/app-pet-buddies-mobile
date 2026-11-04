import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { statusHttp, useMemoriaConsulta } from '../../control/usePontuacaoControl';
import { formatShortDate } from '../../model/formatDate';
import { descreverFalhaMemoria, type LancamentoPontos } from '../../model/pontuacao';
import { spacing } from '../../styles/theme';
import { makeStyles, useTheme } from '../../styles/useTheme';
import { ParcelasList } from './ParcelasList';

interface ExtratoRowProps {
  lancamento: LancamentoPontos;
  petName: string;
}

// Uma consulta do extrato. A memória de cálculo só é buscada quando o tutor abre "O que contou".
export function ExtratoRow({ lancamento, petName }: ExtratoRowProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const memoria = useMemoriaConsulta(lancamento.consultaId, { enabled: open });
  const falha = memoria.isError ? descreverFalhaMemoria(statusHttp(memoria.error)) : null;

  return (
    <View style={styles.row}>
      <View style={styles.head}>
        <View style={styles.text}>
          <Text style={styles.title}>Consulta efetivada</Text>
          <Text style={styles.sub}>
            {petName} · {formatShortDate(lancamento.dataConsulta)}
          </Text>
        </View>
        <Text style={styles.points}>{lancamento.pontos > 0 ? `+${lancamento.pontos}` : '0'}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((current) => !current)}
        style={styles.toggle}
      >
        <Text style={styles.toggleText}>O que contou</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
      </Pressable>

      {open ? (
        memoria.data ? (
          <ParcelasList memoria={memoria.data} />
        ) : memoria.isFetching || !falha ? (
          <ActivityIndicator size="small" color={colors.primary} style={styles.loading} />
        ) : (
          <View>
            <Text style={styles.unavailable}>{falha.mensagem}</Text>
            {falha.podeTentarDeNovo ? (
              <Pressable accessibilityRole="button" onPress={() => memoria.refetch()} style={styles.retry}>
                <Text style={styles.toggleText}>Tentar de novo</Text>
              </Pressable>
            ) : null}
          </View>
        )
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: { paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  text: { flex: 1 },
  title: { fontFamily: 'Inter', fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  sub: { fontFamily: 'Inter', fontSize: 13, color: colors.textSecondary },
  points: { fontFamily: 'Sora', fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-start', marginTop: spacing.sm },
  toggleText: { fontFamily: 'Inter', fontSize: 13, fontWeight: '600', color: colors.primary },
  loading: { alignSelf: 'flex-start', marginTop: spacing.sm },
  unavailable: { fontFamily: 'Inter', fontSize: 13, color: colors.textSecondary, marginTop: spacing.sm },
  retry: { alignSelf: 'flex-start', marginTop: spacing.xs },
}));
