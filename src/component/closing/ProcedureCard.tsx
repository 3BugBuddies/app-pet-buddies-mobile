import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FieldError } from '../forms/FieldError';
import { Input } from '../ui/Input';
import type { OpenPlanItem, ProcedureDraft } from '../../model/closing';
import { formatDateBR } from '../../model/formatDate';
import { normalizeSearch } from '../../model/text';
import { colors, radii, spacing } from '../../styles/theme';

interface ProcedureCardProps {
  draft: ProcedureDraft;
  items: OpenPlanItem[];
  error?: string;
  onChange: (patch: Partial<ProcedureDraft>) => void;
  onRemove?: () => void;
}

const NAME_LABELS: Record<ProcedureDraft['section'], { label: string; placeholder: string }> = {
  VACINA_VERMIFUGO: { label: 'Nome', placeholder: 'ex.: Antirrábica, Vermífugo' },
  EXAME: { label: 'Exame realizado *', placeholder: 'ex.: Hemograma' },
  PROCEDIMENTO: { label: 'Procedimento *', placeholder: 'ex.: Limpeza de tártaro' },
};

export function ProcedureCard({ draft, items, error, onChange, onRemove }: ProcedureCardProps) {
  const isVaccine = draft.section === 'VACINA_VERMIFUGO';
  const nameLabel = NAME_LABELS[draft.section];
  const nameFromItem = !draft.nome.trim() || items.some((i) => normalizeSearch(i.nome) === normalizeSearch(draft.nome));

  return (
    <View style={styles.card}>
      {onRemove ? (
        <Pressable accessibilityRole="button" onPress={onRemove} hitSlop={8} style={styles.removeRow}>
          <Text style={styles.remove}>remover</Text>
        </Pressable>
      ) : null}

      {isVaccine ? (
        <View style={styles.items}>
          {items.map((item) => (
            <RadioOption
              key={item.id}
              selected={draft.itemPlanoId === item.id}
              title={item.nome}
              subtitle={`${item.vencido ? 'atrasada, prevista ' : 'prevista '}${formatDateBR(item.dataAlvo)} · baixa este item do plano`}
              onPress={() =>
                onChange({
                  itemPlanoId: item.id,
                  manualItem: true,
                  tipo: item.tipo,
                  ...(nameFromItem ? { nome: item.nome } : {}),
                })
              }
            />
          ))}
          <RadioOption
            selected={draft.itemPlanoId == null}
            title="Avulsa, fora do plano"
            subtitle="não baixa nenhum item"
            onPress={() => onChange({ itemPlanoId: null, manualItem: true })}
          />
        </View>
      ) : null}

      <Input
        label={nameLabel.label}
        placeholder={nameLabel.placeholder}
        value={draft.nome}
        onChangeText={(nome) => onChange({ nome })}
        hasError={!!error}
      />
      <FieldError message={error} />

      {isVaccine ? (
        <Input
          label="Lote / marca (opcional)"
          placeholder="ex.: lote 2391 · Zoetis"
          value={draft.batch}
          onChangeText={(batch) => onChange({ batch })}
        />
      ) : null}

      <Input
        label={isVaccine ? 'Reações / observações' : 'Observações (opcional)'}
        placeholder={isVaccine ? 'Alguma reação depois da aplicação?' : 'ex.: resultado em 48 h'}
        value={draft.notes}
        onChangeText={(notes) => onChange({ notes })}
        multiline
        style={styles.notes}
      />
    </View>
  );
}

function RadioOption({
  selected,
  title,
  subtitle,
  onPress,
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.item, selected && styles.itemActive]}
    >
      <View style={[styles.radio, selected && styles.radioOn]}>{selected ? <View style={styles.radioDot} /> : null}</View>
      <View style={styles.itemText}>
        <Text style={styles.itemName}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  removeRow: { alignSelf: 'flex-end' },
  remove: { fontSize: 13, fontWeight: '600', color: colors.error },
  items: { gap: spacing.sm, marginBottom: spacing.md },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  itemActive: { borderColor: colors.primary, backgroundColor: colors.cardChia },
  itemText: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  itemSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: radii.pill, backgroundColor: colors.primary },
  notes: { minHeight: 64, textAlignVertical: 'top' },
});
