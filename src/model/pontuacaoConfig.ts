// Chave das telas de pontos, lida do .env:
//   EXPO_PUBLIC_PONTOS=mock  dados de exemplo, sem chamar nenhuma API
//   EXPO_PUBLIC_PONTOS=api   saldo, extrato e memória lidos do Java (/api/pontuacao/...)
// Sem a chave (ou com outro valor) o app segue com o "Em breve" de sempre.
type ModoPontos = 'mock' | 'api';

const valor = process.env.EXPO_PUBLIC_PONTOS;

const pontosModo: ModoPontos | null = valor === 'mock' || valor === 'api' ? valor : null;

const pontosAtivos = pontosModo !== null;

export type { ModoPontos };
export { pontosAtivos, pontosModo };
