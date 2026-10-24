import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { ClosingIconName } from './AccordionRow';
import { colors, radii, spacing } from '../../styles/theme';

interface DoneGridOption {
  key: string;
  label: string;
  icon: ClosingIconName;
  selected: boolean;
}

interface DoneGridProps {
  options: DoneGridOption[];
  onToggle: (key: string) => void;
}

export function DoneGrid({ options, onToggle }: DoneGridProps) {
  return (
    <View style={styles.grid}>
      {options.map((o) => (
        <Pressable
          key={o.key}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: o.selected }}
          onPress={() => onToggle(o.key)}
          style={[styles.tile, o.selected && styles.tileOn]}
        >
          <MaterialCommunityIcons name={o.icon} size={22} color={o.selected ? colors.textLight : colors.primary} />
          <Text style={[styles.label, o.selected && styles.labelOn]}>{o.label}</Text>
          {o.selected ? <Ionicons name="checkmark" size={20} color={colors.success} /> : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tileOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  labelOn: { color: colors.textLight },
});
