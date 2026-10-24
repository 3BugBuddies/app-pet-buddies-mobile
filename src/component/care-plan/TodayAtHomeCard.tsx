import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';
import type { CareItem, TreatmentInfo } from '../../model/care';
import { BrandMark } from '../ui/BrandMark';
import { clockLabel, doseRangeText, doseText, isItemPending, medicationKey, unitOf } from '../../model/careHome';
import { petDefiniteArticle } from '../../model/pet';

interface TodayAtHomeCardProps {
  items: CareItem[];
  treatments: TreatmentInfo[];
  petName: string;
  petSex?: string | null;
  onPress: () => void;
}

function DayReportRow({ items, treatments, onPress, petName, petSex }: TodayAtHomeCardProps) {
  const count = new Set(items.map(medicationKey)).size;
  const title = `Relato de hoje · ${count} remédios`;
  const pending = items.some((item) => isItemPending(item));

  if (pending) {
    const doses = items
      .map((item) => {
        const info = treatments.find((t) => t.prescriptionId != null && t.prescriptionId === item.prescriptionId);
        return [item.title, info ? doseRangeText(info) : null].filter(Boolean).join(' ');
      })
      .join(' · ');
    return (
      <Pressable accessibilityRole="button" style={styles.row} onPress={onPress}>
        <View style={styles.pendingDot} />
        <View style={styles.texts}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>{doses}</Text>
          <Text style={styles.sub}>{`Toque para contar como ${petDefiniteArticle(petSex)} ${petName} passou`}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </Pressable>
    );
  }

  const referred = items.some((item) => item.status === 'ENCAMINHADO');
  const given = items.some((item) => item.status === 'REALIZADO');
  const time = clockLabel(items.map((item) => item.executedAt).find(Boolean));
  const parts = items.map((item) => {
    if (item.status === 'ENCAMINHADO') return `${item.title} · clínica acionada`;
    if (item.doseApplied == null) return `${item.title} sem dose`;
    const dose = [doseText(item.doseApplied), unitOf(treatments, item)].filter(Boolean).join(' ');
    return `${item.title} ${dose}`;
  });
  const text = [...parts, time ? `às ${time}` : null].filter(Boolean).join(' · ');

  return (
    <View style={[styles.row, { backgroundColor: referred ? colors.dangerSoft : colors.limeSoft }]}>
      {given ? (
        <View style={styles.doneDisc}>
          <BrandMark style={styles.doneMark} />
        </View>
      ) : (
        <View style={[styles.closedCircle, { backgroundColor: referred ? colors.danger : colors.lime }]}>
          {referred ? <Text style={styles.mark}>!</Text> : <Ionicons name="remove" size={14} color={colors.textPrimary} />}
        </View>
      )}
      <View style={styles.texts}>
        <Text style={styles.title}>{text}</Text>
        <Text style={styles.sub}>{title}</Text>
      </View>
    </View>
  );
}

function ClosedRow({ item, unit }: { item: CareItem; unit: string | null }) {
  const time = clockLabel(item.executedAt);
  const counted = time ? `Contado às ${time} · ` : '';
  const dose =
    item.doseApplied != null ? ` · ${[doseText(item.doseApplied), unit].filter(Boolean).join(' ')}` : '';

  if (item.status === 'REALIZADO') {
    return (
      <View style={[styles.row, { backgroundColor: colors.limeSoft }]}>
        <View style={styles.doneDisc}>
          <BrandMark style={styles.doneMark} />
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

export function TodayAtHomeCard({ items, treatments, petName, petSex, onPress }: TodayAtHomeCardProps) {
  const combined = new Set(items.map(medicationKey)).size > 1;
  const done = items.filter((item) => !isItemPending(item)).length;
  const total = combined ? 1 : items.length;
  const doneCount = combined ? (done === items.length ? 1 : 0) : done;
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.cardTitle}>Hoje em casa</Text>
        <Text style={styles.counter}>{`${doneCount} de ${total} ${total === 1 ? 'feita' : 'feitas'}`}</Text>
      </View>
      {combined ? (
        <DayReportRow items={items} treatments={treatments} petName={petName} petSex={petSex} onPress={onPress} />
      ) : (
        items.map((item) =>
          isItemPending(item) ? (
            <Pressable key={item.id} accessibilityRole="button" style={styles.row} onPress={onPress}>
              <View style={styles.pendingDot} />
              <View style={styles.texts}>
                <Text style={styles.title}>{`${item.title} · hoje`}</Text>
                <Text style={styles.sub}>{`Toque para contar como ${petDefiniteArticle(petSex)} ${petName} passou`}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
          ) : (
            <ClosedRow key={item.id} item={item} unit={unitOf(treatments, item)} />
          ),
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  doneDisc: { width: 36, height: 36, borderRadius: radii.pill, backgroundColor: '#FFF3D4', alignItems: 'center', justifyContent: 'center' },
  doneMark: { width: 30, height: 30 },
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
