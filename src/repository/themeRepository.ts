import AsyncStorage from '@react-native-async-storage/async-storage';
import { isThemePreference, type ThemePreference } from '../model/themePreference';

const THEME_KEY = 'THEME_PREFERENCE';

// Sem preferência salva (ou storage indisponível) o app segue o tema do aparelho.
const getThemePreference = async (): Promise<ThemePreference> => {
  try {
    const salvo = await AsyncStorage.getItem(THEME_KEY);
    return isThemePreference(salvo) ? salvo : 'system';
  } catch {
    return 'system';
  }
};

const saveThemePreference = async (preference: ThemePreference): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_KEY, preference);
  } catch {
    // Não salvar só faz o app voltar ao tema do aparelho na próxima abertura.
  }
};

export { getThemePreference, saveThemePreference };
