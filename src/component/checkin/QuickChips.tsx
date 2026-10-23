import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

interface QuickChipsProps {
  options: string[];
  onSelect: (text: string) => void;
  selected?: string;
  hideLabel?: boolean;
}

export function QuickChips({ options, onSelect, selected, hideLabel }: QuickChipsProps) {
  return (
    <View style={styles.wrap}>
      {hideLabel ? null : <Text style={styles.label}>Resposta rápida</Text>}
      <View style={styles.row}>
        {options.map((option) => (
          <Pressable key={option} onPress={() => onSelect(option)} style={[styles.chip, option === selected && styles.chipSelected]}>
            <Text style={[styles.chipText, option === selected && styles.chipTextSelected]}>{option}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipTextSelected: {
    color: colors.textLight,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
});
