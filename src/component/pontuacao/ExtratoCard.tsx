import { ActivityIndicator, Text, View } from 'react-native';
import { useExtrato } from '../../control/usePontuacaoControl';
import { usePets } from '../../control/usePetsControl';
import { radii, spacing } from '../../styles/theme';
import { makeStyles, useTheme } from '../../styles/useTheme';
import { ExtratoRow } from './ExtratoRow';

// Extrato do tutor: uma linha por consulta pontuada, da mais recente para a mais antiga.
// O extrato traz o animalId, então o nome do pet vem da lista de pets do tutor.
export function ExtratoCard() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { data: pets } = usePets();
  const { data: extrato, isError } = useExtrato();

  const petName = (animalId: number) => pets?.find((p) => Number(p.id) === animalId)?.nome ?? 'Pet';

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Extrato</Text>
      {isError ? (
        <Text style={styles.note}>O extrato não está disponível agora.</Text>
      ) : !extrato ? (
        <ActivityIndicator color={colors.primary} style={styles.loading} />
      ) : extrato.length === 0 ? (
        <Text style={styles.note}>Nenhuma consulta pontuou ainda. Os pontos aparecem aqui depois de cada consulta efetivada.</Text>
      ) : (
        <View>
          {extrato.map((lancamento) => (
            <ExtratoRow key={lancamento.id} lancamento={lancamento} petName={petName(lancamento.animalId)} />
          ))}
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  eyebrow: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  note: { fontFamily: 'Inter', fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  loading: { alignSelf: 'flex-start', marginTop: spacing.sm },
}));
