import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

interface HeroCardProps {
  petName: string;
  breedLabel: string;
  planStatusLabel: string;
  imageUrl?: string | null;
}

export function HeroCard({ petName, breedLabel, planStatusLabel, imageUrl }: HeroCardProps) {
  return (
    <View style={styles.hero}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarInitial}>{petName.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.infoBlock}>
        <Text style={styles.name}>{petName}</Text>
        <Text style={styles.breed}>{breedLabel}</Text>
      </View>
      <View style={styles.tag}>
        <Text style={styles.tagText}>{planStatusLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: colors.primary,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: colors.cardChia,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.cardChia,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  avatarInitial: {
    fontFamily: 'Sora',
    fontSize: 40,
    fontWeight: '700',
    color: colors.primary,
  },
  infoBlock: {
    alignItems: 'center',
    gap: 2,
  },
  name: {
    fontFamily: 'Sora',
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  breed: {
    fontFamily: 'Inter',
    fontSize: 15,
    color: colors.textSecondary,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: `${colors.success}1A`,
  },
  tagText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: colors.success,
  },
});
