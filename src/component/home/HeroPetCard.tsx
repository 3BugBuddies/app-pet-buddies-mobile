import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

// Asset: add `amigos-tranparentes.png` to assets/images/ before shipping
const heroImage = require('../../../assets/images/amigos-tranparentes.png');

interface HeroPetCardProps {
  petNames: string;
}

export function HeroPetCard({ petNames }: HeroPetCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.textBlock}>
        <Text style={styles.names}>{petNames}</Text>
        <Text style={styles.subtitle}>
          SEMPRE JUNTOS{'\n'}EM NOVAS AVENTURAS ♥
        </Text>
      </View>
      <Image source={heroImage} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardMax,
    borderRadius: radii.lg,
    paddingTop: spacing.lg,
    paddingLeft: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-end',
    overflow: 'hidden',
    minHeight: 140,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  names: {
    fontFamily: 'Sora',
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    lineHeight: 14,
  },
  image: {
    width: 150,
    height: 130,
  },
});
