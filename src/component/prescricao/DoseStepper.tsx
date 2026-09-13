import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

interface DoseStepperProps {
  label: string;
  value: number;
  unit: string;
  step?: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function DoseStepper({ label, value, unit, step = 0.5, min = 0, max = 999, onChange }: DoseStepperProps) {
  const formatted = String(value).replace('.', ',');

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable
          style={styles.button}
          onPress={() => onChange(Math.max(min, Number((value - step).toFixed(2))))}
        >
          <Text style={styles.buttonText}>−</Text>
        </Pressable>
        <Text style={styles.value}>
          {formatted} {unit}
        </Text>
        <Pressable
          style={styles.button}
          onPress={() => onChange(Math.min(max, Number((value + step).toFixed(2))))}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    fontSize: 12,
    color: colors.textLight,
    opacity: 0.85,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textLight,
    lineHeight: 22,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.textLight,
    minWidth: 64,
    textAlign: 'center',
  },
});
