// 'system' segue o tema do aparelho; as outras duas forçam o tema no app.
type ThemePreference = 'system' | 'light' | 'dark';
type ThemeScheme = 'light' | 'dark';

const THEME_PREFERENCES: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Automático' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
];

const isThemePreference = (valor: unknown): valor is ThemePreference =>
  THEME_PREFERENCES.some((p) => p.value === valor);

export { ThemePreference, ThemeScheme, THEME_PREFERENCES, isThemePreference };
