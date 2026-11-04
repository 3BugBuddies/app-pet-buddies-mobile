import { createContext } from 'react';
import type { ThemePreference, ThemeScheme } from '../model/themePreference';
import { lightColors, type ThemeColors } from '../styles/theme';

interface Theme {
  colors: ThemeColors;
  scheme: ThemeScheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

const themeVazio: Theme = {
  colors: lightColors,
  scheme: 'light',
  preference: 'system',
  setPreference: () => undefined,
};

const ThemeContext = createContext(themeVazio);

export { ThemeContext, Theme, themeVazio };
