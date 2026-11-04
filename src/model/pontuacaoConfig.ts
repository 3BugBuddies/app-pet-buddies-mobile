// Chave das telas de pontos, lida do .env:
//   EXPO_PUBLIC_PONTOS=api   saldo, extrato e memória lidos do Java (/api/pontuacao/...)
// Sem a chave (ou com outro valor) o app segue com o "Em breve" de sempre.
const pontosAtivos = process.env.EXPO_PUBLIC_PONTOS === 'api';

// O detalhe do cálculo vem da memória de cálculo, que só existe se o MongoDB do .NET estiver
// configurado. Fica escondido, a menos que EXPO_PUBLIC_PONTOS_DETALHE=on:
//   tutor: o "O que contou" de cada consulta do extrato;
//   vet: quanto o responsável ganhou, no atendimento concluído (sem a chave, o bloco só diz
//        "Pontos enviados", sem esperar a memória).
// O extrato, com o total de cada consulta, não depende dele.
const pontosDetalhe = process.env.EXPO_PUBLIC_PONTOS_DETALHE === 'on';

export { pontosAtivos, pontosDetalhe };
