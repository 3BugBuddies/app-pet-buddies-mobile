import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';
import type { CareItem } from '../../model/care';
import { isItemOverdue } from '../../model/careHome';

interface PreventiveCardProps {
  title: string;
  items: CareItem[];
  emptyText?: string;
  highlightNext?: boolean;
  idleLabel?: string;
  footnote?: string;
  onPressItem: (item: CareItem) => void;
}

export function PreventiveCard({
  title,
  items,
  emptyText,
  highlightNext,
  idleLabel,
  footnote,
  onPressItem,
}: PreventiveCardProps) {
  const overdue = items.filter(isItemOverdue).length;
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.cardTitle}>{title}</Text>
        {overdue > 0 ? (
          <Text style={[styles.status, { color: colors.danger, fontWeight: '700' }]}>
            {`${overdue} ${overdue === 1 ? 'atrasado' : 'atrasados'}`}
          </Text>
        ) : idleLabel ? (
          <Text style={styles.status}>{idleLabel}</Text>
        ) : (
          <View style={styles.okRow}>
            <View style={styles.okBadge}>
              <Ionicons name="checkmark" size={11} color={colors.textPrimary} />
            </View>
            <Text style={styles.status}>nada vencido</Text>
          </View>
        )}
      </View>

      {items.length === 0 && emptyText ? <Text style={styles.empty}>{emptyText}</Text> : null}

      {items.map((item, index) => {
        const dotColor = isItemOverdue(item)
          ? colors.danger
          : highlightNext && index === 0
            ? colors.action
            : colors.info;
        return (
          <Pressable key={item.id} accessibilityRole="button" style={styles.row} onPress={() => onPressItem(item)}>
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
            <View style={styles.texts}>
              <Text style={styles.title}>{`${item.title} · ${item.dateLabel}`}</Text>
              {item.interval ? <Text style={styles.sub}>{item.interval}</Text> : null}
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </Pressable>
        );
      })}

      {footnote ? <Text style={styles.footnote}>{footnote}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 10,
    shadowColor: colors.primary,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  cardTitle: { fontFamily: 'Sora', fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  status: { fontFamily: 'Inter', fontSize: 12, color: colors.textSecondary },
  okRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  okBadge: {
    width: 16,
    height: 16,
    borderRadius: radii.pill,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { fontFamily: 'Inter', fontSize: 14, color: colors.textSecondary },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radii.md - 4,
    backgroundColor: colors.rowBackground,
  },
  dot: { width: 10, height: 10, borderRadius: radii.pill },
  texts: { flex: 1, gap: 2 },
  title: { fontFamily: 'Inter', fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  sub: { fontFamily: 'Inter', fontSize: 12, color: colors.textSecondary },
  footnote: { fontFamily: 'Inter', fontSize: 12, color: colors.textSecondary },
});
