import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

interface HeroCardProps {
  petName: string;
  breedLabel: string;
  planStatusLabel: string;
}

export function HeroCard({ petName, breedLabel, planStatusLabel }: HeroCardProps) {
  return (
    <View style={styles.hero}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>foto de {petName}</Text>
      </View>
      <View style={styles.footer}>
        <View>
          <Text style={styles.name}>{petName}</Text>
          <Text style={styles.breed}>{breedLabel}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{planStatusLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 260,
    borderRadius: radii.lg,
    backgroundColor: colors.cardMax,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  placeholder: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textPrimary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textPrimary,
    opacity: 0.7,
  },
  footer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  name: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  breed: {
    fontSize: 14,
    color: colors.textPrimary,
    opacity: 0.75,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.success,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
  },
});
