import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../../styles/theme';
import { formatTodayLabel } from '../../model/formatDate';

interface GreetingHeaderProps {
  greeting: string;
  userName: string;
  petName?: string;
  onAvatarPress?: () => void;
  onLogout?: () => void;
}

export function GreetingHeader({ greeting, userName, onAvatarPress, onLogout }: GreetingHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textContainer}>
        <Text style={styles.date}>{formatTodayLabel()}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {greeting}, {userName} ✨
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={onAvatarPress} style={styles.avatar}>
          <Text style={styles.avatarLetter}>{userName.charAt(0).toUpperCase()}</Text>
        </Pressable>
        {onLogout && (
          <Pressable accessibilityRole="button" onPress={onLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  date: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.textSecondary,
  },
  name: {
    fontFamily: 'Sora',
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.cardAlert,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: 'Sora',
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  logoutBtn: {
    padding: 4,
  },
});
