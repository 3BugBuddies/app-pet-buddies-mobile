import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { buildApiErrorMessage } from '../../control/apiErrorHelper';
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

  const condicoesSeguras = extracaoResponse.condicoes || [];
  const redFlagsSeguras = extracaoResponse.redFlags || [];
  const isEscalation = extracaoResponse.degradado || redFlagsSeguras.length > 0;

  // Monta os campos de revisão a partir do que a IA extraiu da narrativa
  const fields: ConfirmedField[] = [
    {
      label: 'Estado geral',
      value: isEscalation ? 'Instável' : 'Estável',
      flagged: isEscalation,
    },
    {
      label: 'Sintomas relatados',
      value: condicoesSeguras.length > 0
        ? `${condicoesSeguras.length} condição(ões) identificada(s)`
        : 'Nenhum sintoma específico',
      flagged: false,
    },
    ...redFlagsSeguras.map((flag) => ({
      label: 'Sinal de alerta',
      value: flag,
      flagged: true,
    })),
  ];

  const handleConfirm = async () => {
    try {
      const result = await confirmCheckIn.mutateAsync({
        animalId: extracaoResponse.animalId,
        narrativa: extracaoResponse.narrativa,
        itemPlanoCuidadoId: route.params.itemPlanoCuidadoId, // Opcional, mas crucial se passado para ligar ao plano
        condicoes: condicoesSeguras.map((c) => ({
          condicaoClinicaId: c.condicaoClinicaId,
          valorBooleano: c.valorBooleano,
          valorNumerico: c.valorNumerico,
          confianca: c.confianca,
        })),
      });

      // Removemos o UX Hack 'lactulona', pois a API gerencia isso.

      // Navegação baseada no contrato real da API (CheckinResponse)
      if (result.escalado) {
        // Se a API escalou para a clínica, navegamos para a tela de alerta
        navigation.navigate('CheckInEscalation', { petId, result });
      } else if (!result.desfechos || result.desfechos.length === 0) {
        // Se não houve desfechos, significa que não bateu com nenhuma regra da prescrição
        navigation.navigate('CheckInNoRule', { petId, result, narrative: extracaoResponse.narrativa });
      } else {
        // Fluxo feliz: calculou a dose
        navigation.navigate('CheckInResult', { petId, result });
      }
    } catch (error: any) {
      const msg = error?.response?.status === 409
        ? 'Você já registrou os cuidados deste pet hoje!'
        : buildApiErrorMessage(error, 'Não foi possível confirmar o check-in. Tente novamente.');
      Alert.alert('Aviso', msg);
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

      {isEscalation && (
        <View style={styles.escalationBanner}>
          <View style={styles.escalationHeader}>
            <Ionicons name="warning" size={20} color={colors.error} />
            <Text style={styles.escalationTitle}>Sinal de alerta detectado</Text>
          </View>
          <Text style={styles.escalationBody}>
            Nossa Inteligência Artificial analisou o relato e cruzou com a prescrição do veterinário.
            {'\n\n'}
            Foi identificado um sinal que requer atenção. Se você confirmar, o plano de cuidados será
            <Text style={styles.escalationBold}> interrompido</Text> e você receberá orientação para
            retornar à clínica.
          </Text>
          {redFlagsSeguras.length > 0 && (
            <View style={styles.flagsList}>
              {redFlagsSeguras.map((flag, i) => (
                <View key={i} style={styles.flagRow}>
                  <View style={styles.flagDot} />
                  <Text style={styles.flagText}>{flag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <ConfirmedFieldsCard fields={fields} />

      <View style={styles.noteRow}>
        <View style={styles.noteDot} />
        <Text style={styles.noteText}>
          {isEscalation
            ? 'A IA identificou um sinal de alerta na prescrição do veterinário. Confirme somente se o relato estiver correto.'
            : 'A interpretação é automática. A confirmação é sua — sem ela, nada é registrado nem calculado.'}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          label={isEscalation ? 'Confirmo, foi isso que aconteceu' : 'Confirmo, está certo'}
          backgroundColor={isEscalation ? colors.error : colors.textPrimary}
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
  escalationBanner: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1.5,
    borderColor: colors.error,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  escalationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  escalationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.error,
  },
  escalationBody: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textPrimary,
  },
  escalationBold: {
    fontWeight: '700',
    color: colors.error,
  },
  flagsList: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flagDot: {
    width: 6,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.error,
    flexShrink: 0,
  },
  flagText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
});
