import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

// Asset: add `amigos-tranparentes.png` to assets/images/ before shipping
const heroImage = require('../../../assets/images/amigos-tranparentes.png');

interface HeroPetCardProps {
  petNames: string;
  stateLabel?: string;
  details?: string;
}

export function HeroPetCard({ petNames, stateLabel, details }: HeroPetCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.textBlock}>
        {stateLabel ? <Text style={styles.subtitle}>{stateLabel}</Text> : null}
        <Text style={styles.names}>{petNames}</Text>
        {details ? <Text style={styles.details}>{details}</Text> : null}
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
  details: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.textSecondary,
  },
  image: {
    width: 150,
    height: 130,
  },
});
