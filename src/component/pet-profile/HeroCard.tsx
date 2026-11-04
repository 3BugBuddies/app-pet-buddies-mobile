import { Image, Text, View } from 'react-native';
import { radii, spacing } from '../../styles/theme';
import { makeStyles } from '../../styles/useTheme';

interface HeroCardProps {
  petName: string;
  breedLabel: string;
  planStatusLabel: string;
  imageUrl?: string | null;
}

export function HeroCard({ petName, breedLabel, planStatusLabel, imageUrl }: HeroCardProps) {
  const styles = useStyles();
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

const useStyles = makeStyles((colors) => ({
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
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 3,
    borderColor: colors.cardChia,
  },
  avatarFallback: {
    width: 128,
    height: 128,
    borderRadius: 64,
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
    color: colors.textPrimary,
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
}));
