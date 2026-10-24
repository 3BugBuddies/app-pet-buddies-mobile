import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';
import type { CareItem } from '../../model/care';
import { clockLabel, doseText, isItemPending } from '../../model/careHome';
import { petDefiniteArticle } from '../../model/pet';

interface TodayAtHomeCardProps {
  items: CareItem[];
  unit: string | null | undefined;
  petName: string;
  petSex?: string | null;
  onPressItem: (item: CareItem) => void;
}

function ClosedRow({ item, unit }: { item: CareItem; unit: string | null | undefined }) {
  const time = clockLabel(item.executedAt);
  const counted = time ? `Contado às ${time} · ` : '';
  const dose =
    item.doseApplied != null ? ` · ${[doseText(item.doseApplied), unit].filter(Boolean).join(' ')}` : '';

  if (item.status === 'REALIZADO') {
    return (
      <View style={[styles.row, { backgroundColor: colors.limeSoft }]}>
        <View style={[styles.closedCircle, { backgroundColor: colors.lime }]}>
          <Ionicons name="checkmark" size={14} color={colors.textPrimary} />
        </View>
        <View style={styles.texts}>
          <Text style={styles.title}>{`${item.title}${dose}`}</Text>
          <Text style={styles.sub}>{`${counted}dose dada`}</Text>
        </View>
      </View>
    );
  }

  if (item.status === 'ENCAMINHADO') {
    return (
      <View style={[styles.row, { backgroundColor: colors.dangerSoft }]}>
        <View style={[styles.closedCircle, { backgroundColor: colors.danger }]}>
          <Text style={styles.mark}>!</Text>
        </View>
        <View style={styles.texts}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.sub}>{`${counted}clínica acionada`}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, { backgroundColor: colors.limeSoft }]}>
      <View style={[styles.closedCircle, { backgroundColor: colors.lime }]}>
        <Ionicons name="remove" size={14} color={colors.textPrimary} />
      </View>
      <View style={styles.texts}>
        <Text style={styles.title}>{`${item.title} · sem dose`}</Text>
        <Text style={styles.sub}>{`${counted}sem dose hoje`}</Text>
      </View>
    </View>
  );
}

export function TodayAtHomeCard({ items, unit, petName, petSex, onPressItem }: TodayAtHomeCardProps) {
  const done = items.filter((item) => !isItemPending(item)).length;
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.cardTitle}>Hoje em casa</Text>
        <Text style={styles.counter}>{`${done} de ${items.length} ${items.length === 1 ? 'feita' : 'feitas'}`}</Text>
      </View>
      {items.map((item) =>
        isItemPending(item) ? (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            style={styles.row}
            onPress={() => onPressItem(item)}
          >
            <View style={styles.pendingDot} />
            <View style={styles.texts}>
              <Text style={styles.title}>{`${item.title} · hoje`}</Text>
              <Text style={styles.sub}>{`Toque para contar como ${petDefiniteArticle(petSex)} ${petName} passou`}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </Pressable>
        ) : (
          <ClosedRow key={item.id} item={item} unit={unit} />
        ),
      )}
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
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  cardTitle: { fontFamily: 'Sora', fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  counter: { fontFamily: 'Inter', fontSize: 12, color: colors.textSecondary },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radii.md - 4,
    backgroundColor: colors.rowBackground,
  },
  pendingDot: { width: 10, height: 10, borderRadius: radii.pill, backgroundColor: colors.action },
  closedCircle: { width: 28, height: 28, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  mark: { fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: colors.textLight },
  texts: { flex: 1, gap: 2 },
  title: { fontFamily: 'Inter', fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  sub: { fontFamily: 'Inter', fontSize: 12, color: colors.textSecondary },
});
