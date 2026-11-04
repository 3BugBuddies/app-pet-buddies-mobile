import { useCallback, useEffect, useMemo, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import type { Theme } from '../context/themeContext';
import type { ThemePreference } from '../model/themePreference';
import { getThemePreference, saveThemePreference } from '../repository/themeRepository';
import { darkColors, lightColors } from '../styles/theme';

// Faz o Appearance do React Native seguir a preferência; assim a barra de status,
// o teclado e os alertas do sistema também trocam de tema junto com o app.
// (o react-native-web não implementa setColorScheme; no celular ele existe)
const applyPreference = (preference: ThemePreference) =>
  Appearance.setColorScheme?.(preference === 'system' ? 'auto' : preference);

// Monta o valor do ThemeContext. `ready` fica falso até a preferência salva ser lida,
// para o app não piscar no tema errado ao abrir.
export function useThemeControl(): { theme: Theme; ready: boolean } {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let ativo = true;
    getThemePreference().then((salva) => {
      if (!ativo) return;
      applyPreference(salva);
      setPreferenceState(salva);
      setReady(true);
    });
    return () => {
      ativo = false;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    applyPreference(next);
    setPreferenceState(next);
    void saveThemePreference(next);
  }, []);

  const scheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = useMemo<Theme>(
    () => ({
      scheme,
      preference,
      setPreference,
      colors: scheme === 'dark' ? darkColors : lightColors,
    }),
    [scheme, preference, setPreference]
  );

  // Fundo da janela do sistema: aparece atrás do teclado e nas transições, e não pode ficar claro no tema escuro.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background).catch(() => undefined);
  }, [theme.colors.background]);

  return { theme, ready };
}
