import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { spacing } from '../../styles/theme';
import { useTheme } from '../../styles/useTheme';

// O logo claro tem o texto em azul-marinho e some no fundo escuro: o tema escuro tem arte própria.
const LOGO_LIGHT = require('../../../assets/images/logo-header-principal-trasparente.png');
const LOGO_DARK = require('../../../assets/images/logo-header-principal-trasparente-dark-mode.png');

interface LogoHeaderProps {
  style?: StyleProp<ViewStyle>;
  size?: 'large' | 'small';
}

export function LogoHeader({ style, size = 'large' }: LogoHeaderProps) {
  const { scheme } = useTheme();
  return (
    <View style={[styles.container, style]}>
      <Image 
        source={scheme === 'dark' ? LOGO_DARK : LOGO_LIGHT}
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