import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FieldError } from '../forms/FieldError';
import { Input } from '../ui/Input';
import type { OpenPlanItem, ProcedureDraft } from '../../model/closing';
import { formatDateBR } from '../../model/formatDate';
import { colors, radii, spacing } from '../../styles/theme';

interface ProcedureCardProps {
  draft: ProcedureDraft;
  items: OpenPlanItem[];
  error?: string;
  onChange: (patch: Partial<ProcedureDraft>) => void;
  onRemove: () => void;
}

const NAME_LABELS: Record<ProcedureDraft['section'], { label: string; placeholder: string }> = {
  VACINA_VERMIFUGO: { label: 'Nome *', placeholder: 'ex.: Antirrábica, Vermífugo' },
  EXAME: { label: 'Exame realizado *', placeholder: 'ex.: Hemograma' },
  PROCEDIMENTO: { label: 'Procedimento *', placeholder: 'ex.: Limpeza de tártaro' },
};

export function ProcedureCard({ draft, items, error, onChange, onRemove }: ProcedureCardProps) {
  const isVaccine = draft.section === 'VACINA_VERMIFUGO';
  const nameLabel = NAME_LABELS[draft.section];

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        {isVaccine ? (
          <View style={styles.chips}>
            {(['VACINACAO', 'VERMIFUGACAO'] as const).map((tipo) => (
              <Pressable
                key={tipo}
                onPress={() => onChange({ tipo })}
                style={[styles.chip, draft.tipo === tipo && styles.chipActive]}
              >
                <Text style={[styles.chipText, draft.tipo === tipo && styles.chipTextActive]}>
                  {tipo === 'VACINACAO' ? 'Vacina' : 'Vermífugo'}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View />
        )}
        <Pressable accessibilityRole="button" onPress={onRemove} hitSlop={8}>
          <Text style={styles.remove}>remover</Text>
        </Pressable>
      </View>

      <Input
        label={nameLabel.label}
        placeholder={nameLabel.placeholder}
        value={draft.nome}
        onChangeText={(nome) => onChange({ nome })}
        hasError={!!error}
      />
      <FieldError message={error} />

      {isVaccine ? (
        <>
          <Input
            label="Lote / marca (opcional)"
            placeholder="ex.: Zoetis, lote 12345"
            value={draft.batch}
            onChangeText={(batch) => onChange({ batch })}
          />
          <Text style={styles.sub}>Item do plano</Text>
          <View style={styles.items}>
            <Pressable
              onPress={() => onChange({ itemPlanoId: null, manualItem: true })}
              style={[styles.item, draft.itemPlanoId == null && styles.itemActive]}
            >
              <Text style={styles.itemName}>Avulsa</Text>
              <Text style={styles.itemSubtitle}>não baixa nenhum item do plano</Text>
            </Pressable>
            {items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => onChange({ itemPlanoId: item.id, manualItem: true })}
                style={[styles.item, draft.itemPlanoId === item.id && styles.itemActive]}
              >
                <Text style={styles.itemName}>{item.nome}</Text>
                <Text style={styles.itemSubtitle}>
                  {item.vencido ? 'vencido · ' : 'previsto · '}
                  {formatDateBR(item.dataAlvo)}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      <Input
        label={isVaccine ? 'Reações / observações (opcional)' : 'Observações (opcional)'}
        placeholder={isVaccine ? 'ex.: animal agitado' : 'ex.: resultado em 48 h'}
        value={draft.notes}
        onChangeText={(notes) => onChange({ notes })}
        multiline
        style={styles.notes}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  chips: { flexDirection: 'row', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.cardChia,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  chipTextActive: { color: colors.textLight },
  remove: { fontSize: 13, fontWeight: '600', color: colors.error },
  sub: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xs },
  items: { gap: spacing.xs, marginBottom: spacing.md },
  item: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.sm,
  },
  itemActive: { borderColor: colors.primary, backgroundColor: colors.cardChia },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  itemSubtitle: { fontSize: 12, color: colors.textSecondary },
  notes: { minHeight: 64, textAlignVertical: 'top' },
});
