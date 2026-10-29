/**
 * 1. PALETA PRIMITIVA (Pet Buddies + Tarsila)
 */
export const primitiveColors = {
  // Pet Buddies (Predominante)
  pbLaranja: '#FF8400',
  pbAzulCeu: '#3FA9F6',
  pbAzulMarinho: '#152039',
  pbAmarelo: '#FFC83D',
  pbCreme: '#FFFDF9',

  // Tarsila (Detalhes e Acentos)
  tsTangerine: '#F8982E',
  tsSky: '#A9D7F3',
  tsElectric: '#303A95',
  tsNeon: '#D8E022',
  tsLeche: '#F7F3E6',

  // Neutros
  white: '#FFFFFF',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray800: '#1F2937',
  black: '#000000',
};

/**
 * 2. PALETA SEMÂNTICA & TOKENS DE DESIGN (Modo Claro)
 */
const lightColors = {
  // Fundo e Superfícies
  background: primitiveColors.pbCreme,
  surface: primitiveColors.white,
  surfaceDark: primitiveColors.pbAzulMarinho,

  // Identidade Principal
  primary: primitiveColors.pbAzulMarinho,
  secondary: primitiveColors.tsElectric,
  action: primitiveColors.pbLaranja,
  accent: primitiveColors.pbAmarelo,

  // Textos (Acessibilidade/Contraste)
  textPrimary: primitiveColors.pbAzulMarinho,
  textSecondary: primitiveColors.gray500,
  textMuted: primitiveColors.gray400,
  textLight: primitiveColors.white,

  // Estrutura
  border: primitiveColors.gray200,
  borderStrong: primitiveColors.gray300,

  // Status e Feedbacks
  success: primitiveColors.tsNeon,
  error: '#EF4444',
  warning: primitiveColors.tsTangerine,

  // UI Específica
  cardHome: primitiveColors.pbLaranja,
  cardProgress: primitiveColors.pbAmarelo,
  cardProtocol: primitiveColors.tsSky,

  // Cartões Bento UI (~15% de opacidade)
  cardMax: `${primitiveColors.pbAmarelo}26`,
  cardChia: `${primitiveColors.pbAzulCeu}26`,
  cardAlert: `${primitiveColors.tsTangerine}26`,

  // Tarefas e semana do tratamento
  peach: '#FFF0E0',
  amberSoft: '#FFF3D4',
  infoSoft: '#DCEFFD',
  lime: '#C9F27A',
  limeSoft: '#F4FBE6',
  info: '#5AA9E6',
  danger: '#A3321F',
  dangerSoft: '#FDE3DF',
  rowBackground: '#F6F7F9',
  dimmed: '#B4B9C4',
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
};

export const radii = {
  sm: 8, md: 16, lg: 24, pill: 999,
};

export const typography = {
  // Sora para Títulos
  title: { fontFamily: 'Sora_700Bold', fontSize: 24 },
  subtitle: { fontFamily: 'Sora_600SemiBold', fontSize: 16 },

  // Inter para Corpo
  body: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  caption: { fontFamily: 'Inter_400Regular', fontSize: 12 },
};

/**
 * 3. PALETA SEMÂNTICA (Modo Escuro)
 * Mesmos tokens do modo claro. Cada fundo pastel ganha uma versão escura própria,
 * porque o texto por cima passa a ser claro.
 */
type ThemeColors = { [K in keyof typeof lightColors]: string };

const darkColors: ThemeColors = {
  // Fundo e Superfícies
  background: '#0F1424',
  surface: '#1B2440',
  surfaceDark: '#05070F',

  // Identidade Principal
  primary: '#4A67E0',
  secondary: '#8B97FF',
  action: '#FF8A1E',
  accent: '#F7C85A',

  // Textos (Acessibilidade/Contraste)
  textPrimary: '#F6F8FF',
  textSecondary: '#B7C2E3',
  textMuted: '#8A95B8',
  textLight: '#FFFFFF',

  // Estrutura
  border: '#2B3558',
  borderStrong: '#3B4770',

  // Status e Feedbacks
  success: primitiveColors.tsNeon,
  error: '#FF6B6B',
  warning: '#F8A94A',

  // UI Específica
  cardHome: primitiveColors.pbLaranja,
  cardProgress: primitiveColors.pbAmarelo,
  cardProtocol: primitiveColors.tsSky,

  // Cartões Bento UI (~20% de opacidade, um pouco mais forte para aparecer no fundo escuro)
  cardMax: `${primitiveColors.pbAmarelo}33`,
  cardChia: `${primitiveColors.pbAzulCeu}33`,
  cardAlert: `${primitiveColors.tsTangerine}33`,

  // Tarefas e semana do tratamento
  peach: '#3A2A1A',
  amberSoft: '#3A301A',
  infoSoft: '#1A2E48',
  lime: '#C9F27A',
  limeSoft: '#1F2E14',
  info: '#74B6FF',
  danger: '#F26B57',
  dangerSoft: '#3A1D1A',
  rowBackground: '#202A48',
  dimmed: '#626D90',
};

export { lightColors, darkColors };
export type { ThemeColors };
