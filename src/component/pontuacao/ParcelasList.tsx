import { Text, View } from 'react-native';
import { GESTOS, parcelasQuePontuaram, type MemoriaPontos } from '../../model/pontuacao';
import { spacing } from '../../styles/theme';
import { makeStyles } from '../../styles/useTheme';

interface ParcelasListProps {
  memoria: MemoriaPontos;
}

// "O que contou" numa consulta: uma linha por critério que rendeu ponto, com quantidade × pontos.
export function ParcelasList({ memoria }: ParcelasListProps) {
  const styles = useStyles();
  const parcelas = parcelasQuePontuaram(memoria);

  if (parcelas.length === 0) {
    return <Text style={styles.empty}>Nenhum critério pontuou nesta consulta.</Text>;
  }

  return (
    <View style={styles.list}>
      {parcelas.map((p) => (
        <View key={p.gesto} style={styles.row}>
          <View style={styles.text}>
            <Text style={styles.label}>{GESTOS[p.gesto].label}</Text>
            <Text style={styles.sub}>
              {p.quantidade} × {p.pontosPorUnidade}
            </Text>
          </View>
          <Text style={styles.points}>+{p.pontos}</Text>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  list: { gap: spacing.sm, marginTop: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  text: { flex: 1 },
  label: { fontFamily: 'Inter', fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  sub: { fontFamily: 'Inter', fontSize: 13, color: colors.textSecondary },
  points: { fontFamily: 'Sora', fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  empty: { fontFamily: 'Inter', fontSize: 13, color: colors.textSecondary, marginTop: spacing.sm },
}));
