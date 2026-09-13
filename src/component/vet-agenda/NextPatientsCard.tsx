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
  onOpenPatient: (petId: string) => void;
  onToggle: (id: string) => void;
}

export function NextPatientsCard({ items, onOpenPatient, onToggle }: NextPatientsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>Próximos pacientes</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>clínica</Text>
        </View>
      </View>

      {items.map((item) => (
        <Pressable key={item.id} style={styles.row} onPress={() => onOpenPatient(item.petId)}>
          <View style={styles.dateTimeCol}>
            <Text style={styles.dateText}>{item.dateLabel}</Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          <View style={[styles.avatar, item.seen && styles.avatarSeen]}>
            <Text style={[styles.avatarText, item.seen && styles.avatarTextSeen]}>
              {item.petName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.textBlock}>
            <Text style={[styles.petName, item.seen && styles.textSeen]}>
              {item.petName} <Text style={styles.idText}>#{item.petId}</Text>
            </Text>
            <Text style={styles.reason}>{item.reason}</Text>
          </View>
          <Pressable
            hitSlop={8}
            onPress={(e) => {
              e.stopPropagation();
              onToggle(item.id);
            }}
            style={[styles.statusTag, item.seen && styles.statusTagSeen]}
          >
            <Text style={[styles.statusText, item.seen && styles.statusTextSeen]}>
              {item.seen ? 'atendida' : 'aguardando'}
            </Text>
          </Pressable>
        </Pressable>
      ))}
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
    gap: spacing.md,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.cardChia,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateTimeCol: {
    width: 52,
    alignItems: 'center',
    gap: 2,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.cardChia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSeen: {
    backgroundColor: colors.background,
  },
  avatarText: {
    fontWeight: '700',
    fontSize: 15,
    color: colors.primary,
  },
  avatarTextSeen: {
    color: colors.textMuted,
  },
  textBlock: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  textSeen: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  reason: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
  },
  statusTagSeen: {
    backgroundColor: `${colors.success}1F`,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusTextSeen: {
    color: colors.success,
  },
  idText: { fontSize: 12, color: colors.textMuted, fontWeight: '400' },
});
