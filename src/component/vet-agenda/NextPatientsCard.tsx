import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

export interface NextPatientItem {
  id: string;
  petId: string;
  dateLabel: string;
  time: string;
  petName: string;
  reason: string;
  seen: boolean;
}

interface NextPatientsCardProps {
  items: NextPatientItem[];
  onOpenPatient: (petId: string, consultaId?: string) => void;
  onAtender: (petId: string, consultaId: string) => void;
}

export function NextPatientsCard({ items, onOpenPatient, onAtender }: NextPatientsCardProps) {
  return (
    <View style={styles.list}>
      <Text style={styles.title}>PRÓXIMOS</Text>

      {items.map((item) => (
        <Pressable
          key={item.id}
          style={[styles.row, item.seen && styles.rowSeen]}
          onPress={() => onOpenPatient(item.petId, item.id)}
        >
          <View style={styles.dateTimeCol}>
            <Text style={[styles.timeText, item.seen && styles.textSeen]}>{item.time}</Text>
            <Text style={styles.dateText}>{item.dateLabel}</Text>
          </View>
          <View style={styles.textBlock}>
            <Text style={[styles.petName, item.seen && styles.textSeen]}>{item.petName}</Text>
            <Text style={styles.reason}>{item.reason}</Text>
          </View>
          {item.seen ? (
            <View style={styles.statusTag}>
              <Text style={styles.statusText}>atendido</Text>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              hitSlop={6}
              style={styles.atenderButton}
              onPress={() => onAtender(item.petId, item.id)}
            >
              <Text style={styles.atenderText}>Atender</Text>
            </Pressable>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  rowSeen: {
    backgroundColor: colors.border,
  },
  dateTimeCol: {
    width: 56,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  textBlock: {
    flex: 1,
  },
  petName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  textSeen: {
    color: colors.textSecondary,
  },
  reason: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  atenderButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  atenderText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textLight,
  },
});
