import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FieldError } from '../forms/FieldError';
import { Input } from '../ui/Input';
import type { ItemAbertoPlano, ProcedimentoDraft } from '../../model/fechamento';
import { colors, radii, spacing } from '../../styles/theme';

interface ProcedimentoCardProps {
  draft: ProcedimentoDraft;
  itens: ItemAbertoPlano[];
  erro?: string;
  onChange: (patch: Partial<ProcedimentoDraft>) => void;
  onRemove: () => void;
}

const dataCurta = (iso: string) => iso.split('-').reverse().join('/');

const ROTULO_NOME: Record<ProcedimentoDraft['secao'], { label: string; placeholder: string }> = {
  VACINA_VERMIFUGO: { label: 'Nome *', placeholder: 'ex.: Antirrábica, Vermífugo' },
  EXAME: { label: 'Exame realizado *', placeholder: 'ex.: Hemograma' },
  PROCEDIMENTO: { label: 'Procedimento *', placeholder: 'ex.: Limpeza de tártaro' },
};

export function ProcedimentoCard({ draft, itens, erro, onChange, onRemove }: ProcedimentoCardProps) {
  const ehVacina = draft.secao === 'VACINA_VERMIFUGO';
  const rotulo = ROTULO_NOME[draft.secao];

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        {ehVacina ? (
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
        label={rotulo.label}
        placeholder={rotulo.placeholder}
        value={draft.nome}
        onChangeText={(nome) => onChange({ nome })}
        hasError={!!erro}
      />
      <FieldError message={erro} />

      {ehVacina ? (
        <>
          <Input
            label="Lote / marca (opcional)"
            placeholder="ex.: Zoetis, lote 12345"
            value={draft.lote}
            onChangeText={(lote) => onChange({ lote })}
          />
          <Text style={styles.sub}>Item do plano</Text>
          <View style={styles.itens}>
            <Pressable
              onPress={() => onChange({ itemPlanoId: null, itemManual: true })}
              style={[styles.item, draft.itemPlanoId == null && styles.itemActive]}
            >
              <Text style={styles.itemNome}>Avulsa</Text>
              <Text style={styles.itemSub}>não baixa nenhum item do plano</Text>
            </Pressable>
            {itens.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => onChange({ itemPlanoId: item.id, itemManual: true })}
                style={[styles.item, draft.itemPlanoId === item.id && styles.itemActive]}
              >
                <Text style={styles.itemNome}>{item.nome}</Text>
                <Text style={styles.itemSub}>
                  {item.vencido ? 'vencido · ' : 'previsto · '}
                  {dataCurta(item.dataAlvo)}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      <Input
        label={ehVacina ? 'Reações / observações (opcional)' : 'Observações (opcional)'}
        placeholder={ehVacina ? 'ex.: animal agitado' : 'ex.: resultado em 48 h'}
        value={draft.observacao}
        onChangeText={(observacao) => onChange({ observacao })}
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
  itens: { gap: spacing.xs, marginBottom: spacing.md },
  item: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.sm,
  },
  itemActive: { borderColor: colors.primary, backgroundColor: colors.cardChia },
  itemNome: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  itemSub: { fontSize: 12, color: colors.textSecondary },
  notes: { minHeight: 64, textAlignVertical: 'top' },
});
