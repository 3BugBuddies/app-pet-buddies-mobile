import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FieldError } from '../forms/FieldError';
import type { ItemReceitaDraft } from '../../model/prescription';
import { descreverCondicao, rotuloAcao } from '../../model/prescriptionRule';
import { capitalize, daysText, doseBounds, doseText } from '../../model/careHome';
import { colors, radii, spacing } from '../../styles/theme';

interface MedicationCardProps {
  item: ItemReceitaDraft;
  // Com um só medicamento a tela é a de sempre: sem cabeçalho colapsável.
  single: boolean;
  open: boolean;
  errors: Record<string, string>;
  onToggle: () => void;
  onRemove: () => void;
  onChange: (patch: Partial<ItemReceitaDraft>) => void;
  onAddRule: () => void;
}

const doseLabel = (item: ItemReceitaDraft) => {
  const range = doseBounds(item.doseMin, item.doseMax);
  return range ? `${range} ${item.unidade}`.trim() : '';
};

const intervalLabel = (perDay: number) => {
  if (!perDay) return '';
  const hours = 24 / perDay;
  return Number.isInteger(hours) ? `a cada ${hours}h` : `${perDay}×/dia`;
};

export const closedSummary = (item: ItemReceitaDraft) => {
  const rules = item.regras.length;
  return {
    title: [capitalize(item.medicamento.trim()) || 'Novo medicamento', doseLabel(item)].filter(Boolean).join(' · '),
    sub: [
      intervalLabel(item.frequenciaDia),
      item.duracaoDias ? daysText(item.duracaoDias) : '',
      rules > 0 ? `${rules} ${rules === 1 ? 'regra' : 'regras'} de dose` : '',
    ]
      .filter(Boolean)
      .join(' · '),
  };
};

export function MedicationCard({ item, single, open, errors, onToggle, onRemove, onChange, onAddRule }: MedicationCardProps) {
  const summary = closedSummary(item);
  const hasError = Object.keys(errors).length > 0;

  const fields = (
    <>
      <Input
        label="Nome do Medicamento"
        placeholder="medicamento genérico ou comercial"
        value={item.medicamento}
        onChangeText={(v) => onChange({ medicamento: v })}
        hasError={!!errors.medicamento}
      />
      <FieldError message={errors.medicamento} />

      <View style={styles.row}>
        <View style={styles.flex2}>
          <Input
            label="Dose Mínima"
            keyboardType="decimal-pad"
            placeholder="0.0"
            value={item.doseMin ? doseText(item.doseMin) : ''}
            onChangeText={(v) => onChange({ doseMin: Number(v.replace(',', '.')) || 0 })}
            hasError={!!errors.doseMin}
          />
        </View>
        <View style={styles.flex2}>
          <Input
            label="Dose Máxima"
            keyboardType="decimal-pad"
            placeholder="0.0"
            value={item.doseMax ? doseText(item.doseMax) : ''}
            onChangeText={(v) => onChange({ doseMax: Number(v.replace(',', '.')) || 0 })}
            hasError={!!errors.doseMax}
          />
        </View>
        <View style={styles.flex1}>
          <Input
            label="Unid."
            placeholder="mg, ml, g..."
            value={item.unidade}
            onChangeText={(v) => onChange({ unidade: v })}
            hasError={!!errors.unidade}
          />
        </View>
      </View>
      <FieldError message={errors.doseMax} />

      <View style={styles.row}>
        <View style={styles.flex1}>
          <Input
            label="Vezes ao dia"
            keyboardType="number-pad"
            placeholder=""
            value={String(item.frequenciaDia || '')}
            onChangeText={(v) => onChange({ frequenciaDia: Number(v) || 0 })}
            hasError={!!errors.frequenciaDia}
          />
        </View>
        <View style={styles.flex1}>
          <Input
            label="Dias de tratamento"
            keyboardType="number-pad"
            placeholder=""
            value={String(item.duracaoDias || '')}
            onChangeText={(v) => onChange({ duracaoDias: Number(v) || 0 })}
            hasError={!!errors.duracaoDias}
          />
        </View>
      </View>

      <Input
        label="Orientação para o responsável (opcional)"
        placeholder=""
        value={item.orientacao}
        onChangeText={(v) => onChange({ orientacao: v })}
        returnKeyType="done"
      />
    </>
  );

  const rules = (
    <View style={styles.rulesSection}>
      <Text style={styles.sectionLabel}>Regras de dose · se → então</Text>
      <Text style={styles.noteText}>
        Opcional. Adicione regras para que o app adapte a dose conforme os sintomas relatados pelo responsável no check-in.
      </Text>
      {item.regras.length === 0 ? (
        <Text style={styles.emptyRules}>Nenhuma regra adicionada</Text>
      ) : (
        item.regras.map((regra, index) => (
          <View key={index} style={styles.ruleRow}>
            <View style={styles.ruleDot} />
            <Text style={styles.ruleText} numberOfLines={2}>
              Se <Text style={styles.ruleBold}>{descreverCondicao(regra)}</Text>
              <Text style={styles.ruleArrow}> → </Text>
              {rotuloAcao(regra.acao)}
            </Text>
          </View>
        ))
      )}
      <Button label="+ Adicionar regra" variant="secondary" onPress={onAddRule} />
    </View>
  );

  if (single) {
    return (
      <>
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Dados do Medicamento</Text>
          {fields}
        </View>
        {rules}
      </>
    );
  }

  return (
    <View style={[styles.card, hasError && styles.cardError]}>
      <View style={styles.head}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${open ? 'Fechar' : 'Abrir'} ${summary.title}`}
          accessibilityState={{ expanded: open }}
          onPress={onToggle}
          style={styles.headMain}
        >
          <View style={styles.headText}>
            <Text style={styles.headTitle} numberOfLines={1}>{summary.title}</Text>
            {summary.sub ? <Text style={styles.headSub} numberOfLines={1}>{summary.sub}</Text> : null}
          </View>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.primary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remover ${summary.title}`}
          onPress={onRemove}
          hitSlop={8}
          style={styles.remove}
        >
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>
      {open ? (
        <View style={styles.body}>
          {fields}
          {rules}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardError: { borderColor: colors.error },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headText: { flex: 1 },
  headTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  headSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  remove: { padding: spacing.xs },
  body: { gap: spacing.sm, marginTop: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rulesSection: { gap: spacing.sm },
  noteText: { fontSize: 13, lineHeight: 19, color: colors.textSecondary, marginBottom: spacing.xs },
  emptyRules: { fontSize: 14, color: colors.textMuted, fontStyle: 'italic' },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ruleDot: { width: 8, height: 8, borderRadius: radii.pill, backgroundColor: colors.primary, flexShrink: 0 },
  ruleText: { flex: 1, fontSize: 14, lineHeight: 20, color: colors.textPrimary },
  ruleBold: { fontWeight: '700', color: colors.textPrimary },
  ruleArrow: { color: colors.textPrimary, fontWeight: '700' },
});
