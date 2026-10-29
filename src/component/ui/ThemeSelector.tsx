import { Pressable, Text, View } from 'react-native';
import { THEME_PREFERENCES } from '../../model/themePreference';
import { radii, spacing, typography } from '../../styles/theme';
import { makeStyles, useTheme } from '../../styles/useTheme';

// Escolha do tema: Automático segue o aparelho; Claro e Escuro forçam o tema no app.
export function ThemeSelector() {
  const { preference, setPreference } = useTheme();
  const styles = useStyles();

  return (
    <View accessibilityRole="radiogroup" style={styles.row}>
      {THEME_PREFERENCES.map((option) => {
        const selected = option.value === preference;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => setPreference(option.value)}
            style={[styles.option, selected && styles.optionSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: { flexDirection: 'row', gap: spacing.sm },
  option: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { ...typography.body, color: colors.textSecondary },
  labelSelected: { color: colors.textLight },
}));
