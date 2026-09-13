import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

interface QuickChipsProps {
  options: string[];
  onSelect: (text: string) => void;
}

export function QuickChips({ options, onSelect }: QuickChipsProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Ou responda rápido</Text>
      <View style={styles.row}>
        {options.map((option) => (
          <Pressable key={option} onPress={() => onSelect(option)} style={styles.chip}>
            <Text style={styles.chipText}>{option}</Text>
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
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
});
