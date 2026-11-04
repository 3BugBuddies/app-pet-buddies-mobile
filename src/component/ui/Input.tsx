import { forwardRef } from 'react';
import { Text, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';
import type { ReactNode } from 'react';
import { radii, spacing, typography } from '../../styles/theme';
import { makeStyles, useTheme } from '../../styles/useTheme';

interface InputProps extends TextInputProps {
  label: string;
  hasError?: boolean;
  rightElement?: ReactNode;
}

export const Input = forwardRef<TextInputInstance, InputProps>(function Input(
  { label, hasError, style, rightElement, ...rest },
  ref
) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, hasError && styles.inputWrapperError]}>
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, style]}
          {...rest}
        />
        {rightElement ? <View style={styles.rightSlot}>{rightElement}</View> : null}
      </View>
    </View>
  );
});

const useStyles = makeStyles((colors) => ({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    minHeight: 48,
  },
  inputWrapperError: {
    borderColor: colors.error,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rightSlot: {
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));
