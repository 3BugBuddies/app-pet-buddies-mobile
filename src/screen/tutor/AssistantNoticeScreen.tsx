import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../component/ui/Button';
import { usePet } from '../../control/usePetsControl';
import type { PlanoTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';

type Props = NativeStackScreenProps<PlanoTabParamList, 'AssistantNotice'>;

export function AssistantNoticeScreen({ route }: Props) {
  const { petId } = route.params;
  const { data: pet } = usePet(petId);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.noticeCard}>
        <Text style={styles.noticeLabel}>Antes de começar</Text>
        <Text style={styles.noticeTitle}>Isto não é uma consulta veterinária.</Text>
        <Text style={styles.noticeBody}>
          As respostas são orientações gerais baseadas no material que a vet aprovou para{' '}
          {pet?.nome ?? 'seu pet'}. Não substituem exame, diagnóstico nem prescrição. Em caso de
          sinal de alarme, procure a clínica.
        </Text>
        <Text style={styles.noticeLegal}>
          Res. CFMV 1.465/2022, art. 8º — teleorientação com aviso prévio ao responsável.
        </Text>
      </View>

      <View style={styles.ackRow}>
        <View style={styles.ackCheck}>
          <Text style={styles.ackCheckText}>✓</Text>
        </View>
        <Text style={styles.ackText}>Li e entendi que isto não é uma consulta.</Text>
      </View>

      <View style={styles.actions}>
        <Button
          label="Continuar"
          backgroundColor={colors.textPrimary}
          textColor={colors.textLight}
          onPress={() =>
            Alert.alert('Assistente', 'A conversa com o assistente ainda não está disponível.')
          }
        />
        <Button
          label="Falar com a clínica"
          variant="secondary"
          onPress={() => Alert.alert('Clínica', 'Aqui entraria a conexão com a clínica.')}
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
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  noticeCard: {
    backgroundColor: colors.cardChia,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  noticeLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  noticeTitle: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 27,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  noticeBody: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  noticeLegal: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  ackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  ackCheck: {
    width: 26,
    height: 26,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ackCheckText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '700',
  },
  ackText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  actions: {
    marginTop: 'auto',
    gap: spacing.sm,
  },
});
