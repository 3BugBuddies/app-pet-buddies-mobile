// Chave das telas de pontos. EXPO_PUBLIC_PONTOS=mock liga com dados de exemplo; sem ela (ou com
// outro valor) o app segue com o "Em breve" de sempre. Quando o Java expuser as rotas de
// pontuação, entra um modo 'api' aqui.
const PONTOS_MODE = process.env.EXPO_PUBLIC_PONTOS;

const pontosAtivos = PONTOS_MODE === 'mock';

export { pontosAtivos };
