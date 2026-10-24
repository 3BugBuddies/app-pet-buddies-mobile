import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { buildApiErrorMessage } from '../../control/apiErrorHelper';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { ConfirmedFieldsCard, type ConfirmedField } from '../../component/checkin/ConfirmedFieldsCard';
import { Button } from '../../component/ui/Button';
import { useConfirmCheckIn } from '../../control/useCheckInControl';
import { useCarePlan } from '../../control/useCarePlanControl';
import { todayIso, todayMedications } from '../../model/careHome';
import { medicationGivenLabel } from '../../model/careRules';
import type { PlanoTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';

import { useTabBarSpace } from '../navigation/useTabBarSpace';
type Props = NativeStackScreenProps<PlanoTabParamList, 'CheckInConfirm'>;

export function CheckInConfirmScreen({ route }: Props) {
  const { petId, extracaoResponse } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PlanoTabParamList>>();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const confirmCheckIn = useConfirmCheckIn();
  const { data: plan } = useCarePlan(petId);
  const medications = todayMedications(plan, todayIso());
  const plural = medications.length > 1;

  const condicoesSeguras = extracaoResponse.condicoes || [];
  const redFlagsSeguras = extracaoResponse.redFlags || [];
  // Condição marcada como sinal de alarme também avisa: o back escala por ela mesmo sem red flag.
  const alarmesCatalogo = condicoesSeguras.flatMap((c) => (c.critica && c.valorBooleano && c.rotulo ? [c.rotulo] : []));
  const sinaisNoAviso = [...alarmesCatalogo, ...redFlagsSeguras];
  const isEscalation = sinaisNoAviso.length > 0;
  const isDegradado = extracaoResponse.degradado;

  // Monta os campos de revisão a partir do que a IA extraiu da narrativa
  const fields: ConfirmedField[] = [
    {
      label: 'Estado geral',
      value: isEscalation ? 'Instável' : 'Estável',
      flagged: isEscalation,
    },
    ...condicoesSeguras.map((c) => ({
      label: c.rotulo ?? 'Condição identificada',
      value:
        c.valorNumerico != null
          ? `${String(c.valorNumerico).replace('.', ',')}${c.unidade ? ` ${c.unidade}` : ''}`
          : c.valorBooleano === false
            ? 'não'
            : 'sim',
      flagged: false,
    })),
    ...redFlagsSeguras.map((flag) => ({
      label: 'Sinal de alerta',
      value: flag,
      flagged: true,
    })),
    ...(plural
      ? medications.map((name) => ({
          label: name,
          value: medicationGivenLabel(extracaoResponse.narrativa),
          flagged: false,
        }))
      : []),
  ];

  const handleConfirm = async () => {
    try {
      const result = await confirmCheckIn.mutateAsync({
        redFlags: redFlagsSeguras,
        alarmLabels: condicoesSeguras.flatMap((c) => (c.critica && c.valorBooleano && c.rotulo ? [c.rotulo] : [])),
        payload: {
          animalId: extracaoResponse.animalId,
          narrativa: extracaoResponse.narrativa,
          condicoes: condicoesSeguras.map((c) => ({
            condicaoClinicaId: c.condicaoClinicaId,
            valorBooleano: c.valorBooleano,
            valorNumerico: c.valorNumerico,
            confianca: c.confianca,
          })),
        },
      });

      // O repositório já traduziu `escalado`/`desfechos` da API para o tipo de resultado da tela.
      if (result.status === 'ESCALATION') {
        navigation.navigate('CheckInEscalation', { petId, result });
      } else if (result.status === 'NO_RULE') {
        navigation.navigate('CheckInNoRule', { petId, result, narrative: extracaoResponse.narrativa });
      } else {
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
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: tabBarSpace }]}>
      <CheckInTopBar title="Check-in" stepLabel="2 de 3" />

      <View style={styles.headline}>
        <Text style={styles.h1}>Entendi assim. É isso?</Text>
      </View>

      <Text style={styles.quote}>"{extracaoResponse.narrativa}"</Text>

      {isEscalation && (
        <View style={styles.escalationBanner}>
          <View style={styles.escalationHeader}>
            <Ionicons name="warning" size={20} color={colors.error} />
            <Text style={styles.escalationTitle}>Sinal de alerta detectado</Text>
          </View>
          <Text style={styles.escalationBody}>
            A IA cruzou o relato com a prescrição da veterinária e encontrou um sinal que pede atenção. Se você confirmar, o plano de cuidados é interrompido e você recebe a orientação para procurar a clínica.
          </Text>
          {sinaisNoAviso.length > 0 && (
            <View style={styles.flagsList}>
              {sinaisNoAviso.map((flag, i) => (
                <View key={i} style={styles.flagRow}>
                  <View style={styles.flagDot} />
                  <Text style={styles.flagText}>{flag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {isDegradado && (
        <Text style={styles.noteText}>
          Não consegui interpretar todo o relato automaticamente. Se ele estiver correto, confirme: a
          clínica revisa o que a regra não cobrir.
        </Text>
      )}

      <ConfirmedFieldsCard fields={fields} />

      <Text style={styles.noteText}>
        {isEscalation
          ? 'Confirme somente se o relato estiver correto.'
          : 'Só o que você confirmar entra na regra da veterinária.'}
      </Text>

      <View style={styles.actions}>
        <Button
          label={isEscalation ? 'Confirmo, foi isso que aconteceu' : plural ? 'Confirmar · ver as doses de hoje' : 'Confirmar · ver dose de hoje'}
          backgroundColor={isEscalation ? colors.primary : colors.action}
          textColor={colors.textLight}
          loading={confirmCheckIn.isPending}
          onPress={handleConfirm}
        />
        <Button
          label="Reescrever relato"
          variant="secondary"
          style={{ borderColor: colors.primary }}
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
    borderLeftWidth: 4,
    borderLeftColor: colors.action,
    paddingLeft: spacing.md,
    paddingVertical: spacing.xs,
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
    backgroundColor: colors.action,
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
    backgroundColor: `${colors.error}15`,
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
