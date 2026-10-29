import { useContext, useMemo } from 'react';
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';
import { ThemeContext } from '../context/themeContext';
import type { ThemeColors } from './theme';

type NamedStyles = { [key: string]: ViewStyle | TextStyle | ImageStyle };

// Cores do tema atual; quem usa o hook redesenha quando o tema muda.
export const useTheme = () => useContext(ThemeContext);

// Estilos que dependem das cores. Declara-se no nível do módulo e usa-se dentro do componente:
//   const useStyles = makeStyles((colors) => ({ root: { backgroundColor: colors.background } }));
//   const styles = useStyles();
// O StyleSheet é recriado só quando o tema muda.
export function makeStyles<S extends NamedStyles>(factory: (colors: ThemeColors) => S & NamedStyles) {
  return function useStyles() {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
