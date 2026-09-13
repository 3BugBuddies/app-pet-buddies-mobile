import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { ConfirmedFieldsCard, type ConfirmedField } from '../../component/checkin/ConfirmedFieldsCard';
import { Button } from '../../component/ui/Button';
import { useConfirmCheckIn } from '../../control/useCheckInControl';
import type { PlanoTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';

type Props = NativeStackScreenProps<PlanoTabParamList, 'CheckInConfirm'>;

export function CheckInConfirmScreen({ route }: Props) {
  const { petId, extracaoResponse } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PlanoTabParamList>>();
  const insets = useSafeAreaInsets();
  const confirmCheckIn = useConfirmCheckIn();

  // Monta os campos de revisão a partir do que a IA extraiu da narrativa
  const fields: ConfirmedField[] = [
    {
      label: 'Estado geral',
      value: extracaoResponse.degradado ? 'Degradado' : 'Estável',
      flagged: extracaoResponse.degradado,
    },
    {
      label: 'Condições identificadas',
      value: extracaoResponse.condicoes.length > 0
        ? `${extracaoResponse.condicoes.length} condição(ões) detectada(s)`
        : 'Nenhuma condição detectada',
      flagged: false,
    },
    ...extracaoResponse.redFlags.map((flag) => ({
      label: 'Alerta',
      value: flag,
      flagged: true,
    })),
  ];

  const handleConfirm = async () => {
    // Constrói o payload do contrato (seção 7) a partir do que a IA extraiu e o
    // tutor confirmou. As condições voltam ao Java no mesmo formato que vieram.
    const result = await confirmCheckIn.mutateAsync({
      animalId: extracaoResponse.animalId,
      narrativa: extracaoResponse.narrativa,
      condicoes: extracaoResponse.condicoes.map((c) => ({
        condicaoClinicaId: c.condicaoClinicaId,
        valorBooleano: c.valorBooleano,
        valorNumerico: c.valorNumerico,
        confianca: c.confianca,
      })),
    });
    if (result.status === 'ESCALATION') {
      navigation.navigate('CheckInEscalation', { petId, result });
    } else if (result.status === 'NO_RULE') {
      navigation.navigate('CheckInNoRule', { petId, result, narrative: extracaoResponse.narrativa });
    } else {
      navigation.navigate('CheckInResult', { petId, result });
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 80 }]}>
      <CheckInTopBar title="Confirmar" subtitle="Confira as informações" stepLabel="2 / 3" />

      <View style={styles.headline}>
        <Text style={styles.h1}>Entendi assim. É isso?</Text>
        <Text style={styles.p}>
          Confira cada item. Só o que você confirmar entra na regra da vet.
        </Text>
      </View>

      <Text style={styles.quote}>"{extracaoResponse.narrativa}"</Text>

      <ConfirmedFieldsCard fields={fields} />

      <View style={styles.noteRow}>
        <View style={styles.noteDot} />
        <Text style={styles.noteText}>
          A interpretação é automática. A confirmação é sua — sem ela, nada é registrado nem
          calculado.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          label="Confirmo, está certo"
          backgroundColor={colors.textPrimary}
          textColor={colors.textLight}
          loading={confirmCheckIn.isPending}
          onPress={handleConfirm}
        />
        <Button
          label="Reescrever"
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  headline: {
    gap: spacing.xs,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  p: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  quote: {
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    padding: spacing.md,
    fontSize: 15,
    lineHeight: 20,
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
  noteRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  noteDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});
