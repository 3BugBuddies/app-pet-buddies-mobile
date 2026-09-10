import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, typography } from '../../styles/theme';

interface GreetingHeaderProps {
  greeting: string;
  petName: string;
  onAvatarPress?: () => void;
}

export function GreetingHeader({ greeting, petName, onAvatarPress }: GreetingHeaderProps) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.hi}>{greeting}</Text>
        <Text style={styles.name}>{petName}</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={onAvatarPress} style={styles.avatar}>
        <Text style={styles.avatarLetter}>{petName.charAt(0).toUpperCase()}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hi: {
    ...typography.body,
    color: colors.textSecondary,
  },
  name: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: colors.cardMax,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatarLetter: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
});
