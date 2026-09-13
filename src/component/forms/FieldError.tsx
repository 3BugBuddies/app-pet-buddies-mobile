import { StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '../../styles/theme';

interface FieldErrorProps {
  message?: string;
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null;
  }
  return (
    <Text accessibilityRole="alert" style={styles.text}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
