import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';
import { statusDisplay, type CareItem, type StatusTone } from '../../model/care';

interface CareItemsSectionProps {
  title: string;
  items: CareItem[];
  emptyText: string;
}

const TONE_BG: Record<StatusTone, string> = {
  success: colors.success,
  warning: colors.cardMax,
  alert: colors.cardAlert,
  neutral: colors.border,
};

export function CareItemsSection({ title, items, emptyText }: CareItemsSectionProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>{emptyText}</Text>
      ) : (
        items.map((item) => {
          const display = statusDisplay(item.status, item.type === 'MEDICACAO', item.overdue);
          return (
            <View key={item.id} style={styles.row}>
              <View style={styles.textBlock}>
                <Text style={styles.itemTitle}>
                  {item.title} · {item.dateLabel}
                </Text>
              </View>
              <View style={[styles.pill, { backgroundColor: TONE_BG[display.tone] }]}>
                <Text style={styles.pillText}>{display.label}</Text>
              </View>
            </View>
          );
        })
      )}
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
  title: { fontFamily: 'Sora', fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  empty: { fontSize: 14, color: colors.textSecondary },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  textBlock: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  pill: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.pill },
  pillText: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
});
