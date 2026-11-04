import { ActivityIndicator, Text, View } from 'react-native';
import { spacing, typography } from '../../styles/theme';
import { makeStyles, useTheme } from '../../styles/useTheme';

interface LoadingIndicatorProps {
  label?: string;
}

export function LoadingIndicator({ label }: LoadingIndicatorProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
  },
}));
