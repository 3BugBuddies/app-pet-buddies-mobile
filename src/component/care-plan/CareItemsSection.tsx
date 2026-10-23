import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';
import { dayAndWeekday, groupTreatments, statusDisplay, type CareItem, type StatusTone } from '../../model/care';

interface CareItemsSectionProps {
  title: string;
  items: CareItem[];
  emptyText: string;
  grouped?: boolean;
}

const TONE_BG: Record<StatusTone, string> = {
  success: colors.success,
  warning: colors.cardMax,
  alert: colors.cardAlert,
  neutral: colors.border,
};

const todayIso = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function CareItemsSection({ title, items, emptyText, grouped }: CareItemsSectionProps) {
  const today = todayIso();
  const renderPill = (item: CareItem) => {
    const display = statusDisplay(item.status, item.type === 'MEDICACAO', item.overdue);
    return (
      <View style={[styles.pill, { backgroundColor: TONE_BG[display.tone] }]}>
        <Text style={styles.pillText}>{display.label}</Text>
      </View>
    );
  };
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>{emptyText}</Text>
      ) : grouped ? (
        groupTreatments(items).map((group) => (
          <View key={group.name} style={styles.group}>
            <Text style={styles.groupTitle}>
              {[group.name, group.rangeLabel, group.perDay > 1 ? `${group.perDay}×/dia` : null].filter(Boolean).join(' · ')}
            </Text>
            {group.items.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={styles.textBlock}>
                  <Text style={styles.itemTitle}>{dayAndWeekday(item.dateIso, today)}</Text>
                </View>
                {renderPill(item)}
              </View>
            ))}
          </View>
        ))
      ) : (
        items.map((item) => {
          return (
            <View key={item.id} style={styles.row}>
              <View style={styles.textBlock}>
                <Text style={styles.itemTitle}>
                  {item.title} · {item.dateLabel}
                </Text>
              </View>
              {renderPill(item)}
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
  group: { gap: spacing.xs },
  groupTitle: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginTop: spacing.xs },
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
