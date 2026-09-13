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
 * 2. PALETA SEMÂNTICA & TOKENS DE DESIGN
 */
export const colors = {
  // Fundo e Superfícies
  background: primitiveColors.pbCreme, 
  surface: primitiveColors.white,            
  surfaceDark: primitiveColors.pbAzulMarinho,     

  // Identidade Principal
  primary: primitiveColors.pbAzulMarinho,     // Elementos âncora, TopBar, Textos fortes
  secondary: primitiveColors.tsElectric,      // Acentos profundos Tarsila
  action: primitiveColors.pbLaranja,          // Call to Action (Botões primários)
  accent: primitiveColors.pbAmarelo,          // Recompensas, Estrelas, Badges

  // Textos (Acessibilidade/Contraste)
  textPrimary: primitiveColors.pbAzulMarinho,   
  textSecondary: primitiveColors.gray500,    
  textMuted: primitiveColors.gray400,        
  textLight: primitiveColors.white,          

  // Estrutura
  border: primitiveColors.gray200,           
  borderStrong: primitiveColors.gray300,   

  // Status e Feedbacks (Usando a vibração da Tarsila)
  success: primitiveColors.tsNeon, // O Neon da Tarsila é perfeito para sucesso/check
  error: '#EF4444',
  warning: primitiveColors.tsTangerine,

  cardHome: primitiveColors.pbLaranja, // Cartões Home (Plano, Agenda, Pet)
  cardProgress: primitiveColors.pbAmarelo, // Cartão Progresso (Plano Vivo)
  cardProtocol: primitiveColors.tsSky, // Cartão Protocolos (Agenda)

  // Cartões Bento UI (Aplicando transparência de ~15% = '26' no HEX para UX suave)
  cardMax: `${primitiveColors.pbAmarelo}26`,       
  cardChia: `${primitiveColors.pbAzulCeu}26`,      
  cardAlert: `${primitiveColors.tsTangerine}26`,   
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
};

export const radii = {
  sm: 8, md: 16, lg: 24, pill: 999,
};

export const typography = {
  // Sora para Títulos (Branding Forte)
  title: { fontFamily: 'Sora', fontSize: 24, fontWeight: '700' as const },
  subtitle: { fontFamily: 'Sora', fontSize: 16, fontWeight: '600' as const },
  // Inter para Corpo (Leitura Perfeita)
  body: { fontFamily: 'Inter', fontSize: 14, fontWeight: '400' as const },
  caption: { fontFamily: 'Inter', fontSize: 12, fontWeight: '400' as const },
};

export const theme = { colors, spacing, radii, typography };