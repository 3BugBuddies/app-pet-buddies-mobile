import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { radii, spacing } from '../../styles/theme';
import { makeStyles } from '../../styles/useTheme';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
}

export function Card({ children, onPress, style, backgroundColor }: CardProps) {
  const styles = useStyles();
  const content = (
    <View style={[styles.card, backgroundColor ? { backgroundColor } : null, style]}>
      {children}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    shadowColor: colors.surfaceDark,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  pressed: {
    opacity: 0.9,
  },
}));
