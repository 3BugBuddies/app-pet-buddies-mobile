import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../../styles/theme';

interface GreetingHeaderProps {
  greeting: string;
  userName: string;
  petName?: string;
  onAvatarPress?: () => void;
  onLogout?: () => void;
}

export function GreetingHeader({ greeting, userName, onAvatarPress, onLogout }: GreetingHeaderProps) {
  return (
    <View style={styles.card}>
      {/* Esquerda — Logo da marca */}
      <Image
        source={require('../../../assets/images/logo-header-principal-trasparente.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Centro — Saudação */}
      <View style={styles.textContainer}>
        <Text style={styles.greeting}>{greeting}</Text>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{userName}</Text>
          <Text style={styles.sunIcon}>☀️</Text>
        </View>
        <Text style={styles.subtitle}>QUE BOM TE VER POR AQUI!</Text>
      </View>

      {/* Direita — Avatar + Logout */}
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: colors.surfaceDark,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  logo: {
    width: 80,
    height: 40,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  greeting: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    fontFamily: 'Sora',
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  sunIcon: {
    fontSize: 16,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.cardChia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: 'Sora',
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  logoutBtn: {
    padding: 4,
  },
});
