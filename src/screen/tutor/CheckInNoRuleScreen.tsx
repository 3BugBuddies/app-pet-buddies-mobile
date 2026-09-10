import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '../../component/ui/Button';
import type { PlanoTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';

type Props = NativeStackScreenProps<PlanoTabParamList, 'CheckInNoRule'>;

export function CheckInNoRuleScreen({ route }: Props) {
  const { petId, narrative, result } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PlanoTabParamList>>();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Sem regra correspondente</Text>
      <Text style={styles.title}>Sua vet vai revisar esse relato</Text>
      <Text style={styles.body}>
        Nenhuma regra da prescrição cobre exatamente o que você contou. Pra não chutar uma dose,
        a {result.vetName} vai confirmar com você direto — nada fica pendente sozinho.
      </Text>

      <Text style={styles.quote}>"{narrative}"</Text>

      <Text style={styles.meta}>
        {result.vetName} · {result.vetCrmv}
      </Text>

      <Button
        label="Entendi"
        backgroundColor={colors.textPrimary}
        textColor={colors.textLight}
        onPress={() => navigation.navigate('CarePlan', { petId })}
      />
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
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  quote: {
    backgroundColor: colors.cardChia,
    borderRadius: radii.sm,
    padding: spacing.md,
    fontSize: 15,
    lineHeight: 20,
    fontStyle: 'italic',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
