import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../styles/theme';

interface GreetingHeaderProps {
  greeting: string; // Ex: "Bom dia,"
  userName: string; // Ex: "Mari"
  petName?: string; // Ex: "Buddy"
  onAvatarPress?: () => void;
}

export function GreetingHeader({ greeting, userName, onAvatarPress }: GreetingHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textContainer}>
        <Text style={styles.greeting}>{greeting}</Text>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.sunIcon}>☀️</Text>
        </View>
        <Text style={styles.subtitle}>QUE BOM TE VER POR AQUI!</Text>
      </View>

      <Pressable accessibilityRole="button" onPress={onAvatarPress} style={styles.avatar}>
        <Text style={styles.avatarLetter}>{userName.charAt(0).toUpperCase()}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: colors.textSecondary,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    fontFamily: 'Sora',
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  sunIcon: {
    fontSize: 24,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.cardChia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: 'Sora',
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
});