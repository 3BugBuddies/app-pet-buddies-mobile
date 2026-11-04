// Chave das telas de pontos, lida do .env:
//   EXPO_PUBLIC_PONTOS=mock  dados de exemplo, sem chamar nenhuma API
//   EXPO_PUBLIC_PONTOS=api   saldo, extrato e memória lidos do Java (/api/pontuacao/...)
// Sem a chave (ou com outro valor) o app segue com o "Em breve" de sempre.
type ModoPontos = 'mock' | 'api';

const valor = process.env.EXPO_PUBLIC_PONTOS;

const pontosModo: ModoPontos | null = valor === 'mock' || valor === 'api' ? valor : null;

const pontosAtivos = pontosModo !== null;

// O "O que contou" de cada consulta do extrato vem da memória de cálculo, que só existe se o
// MongoDB do .NET estiver configurado. Fica escondido do tutor, a menos que
// EXPO_PUBLIC_PONTOS_DETALHE=on. O extrato, com o total de cada consulta, não depende dele.
const pontosDetalhe = process.env.EXPO_PUBLIC_PONTOS_DETALHE === 'on';

export type { ModoPontos };
export { pontosAtivos, pontosDetalhe, pontosModo };
