import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { spacing } from '../../styles/theme';

interface LogoHeaderProps {
  style?: StyleProp<ViewStyle>;
  size?: 'large' | 'small';
}

export function LogoHeader({ style, size = 'large' }: LogoHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <Image 
        source={require('../../../assets/images/logo-header-principal-trasparente.png')}
        style={size === 'large' ? styles.logoLarge : styles.logoSmall}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  logoLarge: {
    width: 180,
    height: 70,
  },
  logoSmall: {
    width: 120,
    height: 40,
  },
});