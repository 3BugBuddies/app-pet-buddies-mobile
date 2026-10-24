import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';
import { capitalize, doseText } from '../../model/careHome';
import { medicationEndLabel } from '../../model/treatmentSummary';
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
            <View style={styles.groupHead}>
              <Text style={[styles.groupTitle, styles.textBlock]}>
                {[capitalize(group.name), group.perDay > 1 ? `${group.perDay}×/dia` : null].filter(Boolean).join(' · ')}
              </Text>
              <Text style={styles.groupEnd}>{medicationEndLabel(group.items, today)}</Text>
            </View>
            {group.items.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={styles.textBlock}>
                  <Text style={styles.itemTitle}>{dayAndWeekday(item.dateIso, today)}</Text>
                  {item.doseApplied != null ? (
                    <Text style={styles.itemDose}>{[doseText(item.doseApplied), item.unit].filter(Boolean).join(' ')}</Text>
                  ) : null}
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
                  {capitalize(item.title)} · {item.dateLabel}
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
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  groupTitle: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  groupEnd: { fontSize: 13, color: colors.textSecondary },
  itemDose: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
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
