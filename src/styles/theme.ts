/**
 * 1. PALETA PRIMITIVA (Cores Agnósticas)
 * Cores nomeadas pela sua representação visual (Hex), sem atrelar a uma função.
 * Facilita a manutenção e a criação de múltiplos temas no futuro.
 */
export const primitiveColors = {
  // Cores Base do "Cuidado Tecnológico" (Opção 1)
  royalBlue: '#3B4FE4',
  softYellow: '#FCE7BA',
  pastelSalmon: '#FFBEA3',
  pastelBlue: '#E2EEFE',
  iceBackground: '#F4F6FB',
  darkNavy: '#1F243A',

  // Neutros e Tons de Cinza
  white: '#FFFFFF',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray800: '#1F2937',
  black: '#000000',

  // Cores de Status (Semânticas Universais)
  green500: '#22C55E',
  red500: '#EF4444',
  yellow500: '#F59E0B',
};

/**
 * 2. PALETA SEMÂNTICA & TOKENS DE DESIGN
 * Aqui as primitivas ganham propósito. É esta paleta que o aplicativo consumirá.
 * Permite trocar a cor "primary" facilmente em todo o app mudando apenas aqui.
 */

export const colors = {
  // Fundo e Superfícies
  background: primitiveColors.iceBackground, // Fundo principal relaxante
  surface: primitiveColors.white,            // Fundo de cartões (Bento UI)
  surfaceDark: primitiveColors.darkNavy,     // Elementos escuros / cabeçalhos

  // Identidade Principal
  primary: primitiveColors.royalBlue,        // Botões principais, ícones ativos
  secondary: primitiveColors.gray500,        // Elementos secundários, bordas

  // Textos
  textPrimary: primitiveColors.darkNavy,     // Texto principal com alto contraste
  textSecondary: primitiveColors.gray500,    // Metadados e subtítulos
  textMuted: primitiveColors.gray400,        // Textos menos importantes / placeholders
  textLight: primitiveColors.white,          // Texto sobre fundos escuros (botões)

  // Elementos Estruturais
  border: primitiveColors.gray200,           // Linhas divisórias e contornos de inputs
  borderStrong: primitiveColors.gray300,

  // Status e Feedbacks
  success: primitiveColors.green500,
  error: primitiveColors.red500,
  warning: primitiveColors.yellow500,

  // Cartões Identidade Pet Buddies (Gamificação / Personas)
  cardMax: primitiveColors.softYellow,       // Amarelo suave para alertas leves/ações do tutor
  cardChia: primitiveColors.pastelBlue,      // Azul pastel para informações de plano/IA
  cardAlert: primitiveColors.pastelSalmon,   // Salmão para avisos/urgências
}


export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
};

export const typography = {
  title: { fontSize: 24, fontWeight: '700' as const },
  subtitle: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
};

export const theme = { colors, spacing, radii, typography };
