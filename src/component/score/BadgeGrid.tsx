import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';
import type { Badge } from '../../model/care';

interface BadgeGridProps {
  badges: Badge[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  return (
    <View style={styles.grid}>
      {badges.map((badge) => (
        <View key={badge.id} style={[styles.badge, badge.unlocked ? styles.unlocked : styles.locked]}>
          <View
            style={[styles.dot, { backgroundColor: badge.unlocked ? colors.success : colors.background }]}
          />
          <Text style={[styles.name, badge.unlocked ? styles.nameUnlocked : styles.nameLocked]}>
            {badge.name}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badge: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: radii.lg,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  unlocked: {
    backgroundColor: `${colors.success}1F`,
  },
  locked: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 15,
  },
  nameUnlocked: {
    color: colors.success,
  },
  nameLocked: {
    color: colors.textMuted,
  },
});
