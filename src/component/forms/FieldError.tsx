import { Text } from 'react-native';
import { spacing, typography } from '../../styles/theme';
import { makeStyles } from '../../styles/useTheme';

interface FieldErrorProps {
  message?: string;
}

export function FieldError({ message }: FieldErrorProps) {
  const styles = useStyles();
  if (!message) {
    return null;
  }
  return (
    <Text accessibilityRole="alert" style={styles.text}>
      {message}
    </Text>
  );
}

const useStyles = makeStyles((colors) => ({
  text: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
}));
