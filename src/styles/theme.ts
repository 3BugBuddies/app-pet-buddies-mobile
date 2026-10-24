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

/*
 * Paleta Dark Mode (Preservada para implementação futura):
 * const darkPalette = {
 *   azulPrimario: '#253C96',
 *   laranjaDestaque: '#FF8A1E',
 *   azulClaroApoio: '#74B6FF',
 *   estrelaDourada: '#F7C85A',
 *   fundoApp: '#0F1424',
 *   fundoSecundario: '#151C31',
 *   cardSurface: '#1B2440',
 *   bordaSutil: '#2B3558',
 *   overlaySuave: '#0A0F1DCC',
 *   textoPrimario: '#F6F8FF',
 *   textoSecundario: '#B7C2E3',
 *   textoTerciario: '#8A95B8',
 *   textoDesabilitado: '#626D90',
 *   sucesso: '#38C793',
 *   aviso: '#F7C85A',
 *   erro: '#FF6B6B',
 *   informacao: '#5AA9FF',
 * };
 */

/**
 * 2. PALETA SEMÂNTICA & TOKENS DE DESIGN (Modo Claro)
 */
export const colors = {
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


export const theme = { colors, spacing, radii, typography };