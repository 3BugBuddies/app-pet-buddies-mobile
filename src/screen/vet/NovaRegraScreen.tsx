import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { Button } from '../../component/ui/Button';
import { useNovaRegraControl } from '../../control/usePrescriptionControl';
import type { PacientesTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';

const ACAO_LABEL: Record<string, string> = {
  DOSE_MIN: 'Aplicar a dose mínima da faixa',
  DOSE_MAX: 'Aplicar a dose máxima da faixa',
  DOSE_PADRAO: 'Aplicar a dose padrão',
  ACIONAR_CLINICA: 'Encaminhar para a clínica · sem dose',
};

type Props = NativeStackScreenProps<PacientesTabParamList, 'NovaRegra'>;

export function NovaRegraScreen({ route }: Props) {
  const { animalId, registroAtendimentoId } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList>>();
  const insets = useSafeAreaInsets();
  const { condicoes, acoes, condicaoClinicaId, setCondicaoClinicaId, acao, setAcao, construirRegra } =
    useNovaRegraControl();

  const handleAdd = () => {
    const regra = construirRegra();
    navigation.navigate({
      name: 'Prescricao',
      params: { animalId, registroAtendimentoId, novaRegra: regra },
      merge: true,
    });
  };
  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 80 }]}>
      <CheckInTopBar title="Nova regra" subtitle="Se → então" />

      <Text style={styles.sectionLabel}>Se o tutor relatar</Text>
      <View style={styles.card}>
        <View style={styles.chipsRow}>
          {condicoes.map((condicao) => (
            <Pressable
              key={condicao.id}
              onPress={() => setCondicaoClinicaId(condicao.id)}
              style={[styles.chip, condicaoClinicaId === condicao.id && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, condicaoClinicaId === condicao.id && styles.chipTextActive]}
              >
                {condicao.rotulo}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Text style={styles.sectionLabel}>Então</Text>
      <View style={styles.card}>
        {acoes.map((option, index) => {
          const selected = option === acao;
          return (
            <View key={option}>
              <Pressable style={styles.actionRow} onPress={() => setAcao(option)}>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
                <Text style={styles.actionLabel}>{ACAO_LABEL[option]}</Text>
              </Pressable>
              {index < acoes.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          );
        })}
      </View>

      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>Como fica a regra</Text>
        <Text style={styles.previewText}>
          {condicoes.find((c) => c.id === condicaoClinicaId)?.rotulo.toLowerCase()} → {ACAO_LABEL[acao].toLowerCase()}
        </Text>
      </View>

      <Pressable style={styles.submitButton} onPress={handleAdd}>
        <Text style={styles.submitButtonText}>Adicionar regra e revisar</Text>
      </Pressable>
      <Button label="Voltar/Cancelar" variant="secondary" onPress={() => navigation.goBack()} />
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  chipTextActive: {
    color: colors.textLight,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 50,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.textLight,
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  previewCard: {
    backgroundColor: colors.cardChia,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: 4,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  previewText: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  submitButton: {
    marginTop: spacing.sm,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textLight,
  },
});
