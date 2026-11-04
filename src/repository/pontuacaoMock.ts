import type { GestoPontuacao, LancamentoPontos, MemoriaPontos, ParcelaPontos, SaldoPontos } from '../model/pontuacao';

// DADOS DE EXEMPLO. Só são lidos com EXPO_PUBLIC_PONTOS=mock (ver model/pontuacaoConfig.ts); com
// =api, o pontuacaoRepository chama o Java e este arquivo não entra.
//
// Regras fingidas: consulta 20, dose com check-in 3, adesão completa 10, evolução positiva 3.
// Na memória, um consultaId terminado em 0 simula a memória indisponível e um terminado em 5
// simula uma consulta que não rendeu pontos (clínica sem regras).

const RESPONSAVEL_ID = 1;
const CLINICA_ID = 1;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const parcela = (gesto: GestoPontuacao, quantidade: number, pontosPorUnidade: number): ParcelaPontos => ({
  gesto,
  quantidade,
  pontosPorUnidade,
  pontos: quantidade * pontosPorUnidade,
  observacao: '',
});

const total = (parcelas: ParcelaPontos[]) => parcelas.reduce((soma, p) => soma + p.pontos, 0);

const EXEMPLOS: { consultaId: number; dataConsulta: string; parcelas: ParcelaPontos[] }[] = [
  {
    consultaId: 303,
    dataConsulta: '2026-11-03T14:30:00',
    parcelas: [
      parcela('CONSULTA_REALIZADA', 1, 20),
      parcela('CHECKIN_REGISTRADO', 9, 3),
      parcela('ADESAO_COMPLETA', 1, 10),
      parcela('EVOLUCAO_POSITIVA', 1, 3),
    ],
  },
  {
    consultaId: 302,
    dataConsulta: '2026-09-15T10:00:00',
    parcelas: [
      parcela('CONSULTA_REALIZADA', 1, 20),
      parcela('CHECKIN_REGISTRADO', 10, 3),
      parcela('ADESAO_COMPLETA', 0, 10),
      parcela('EVOLUCAO_POSITIVA', 0, 3),
    ],
  },
  {
    consultaId: 301,
    dataConsulta: '2026-07-10T09:00:00',
    parcelas: [
      parcela('CONSULTA_REALIZADA', 1, 20),
      parcela('CHECKIN_REGISTRADO', 0, 3),
      parcela('ADESAO_COMPLETA', 0, 10),
      parcela('EVOLUCAO_POSITIVA', 1, 3),
    ],
  },
];

const getSaldo = async (): Promise<SaldoPontos> => {
  await wait(400);
  return { responsavelId: RESPONSAVEL_ID, saldo: EXEMPLOS.reduce((soma, e) => soma + total(e.parcelas), 0) };
};

// Do mais recente ao mais antigo, como o .NET devolve. Os animalIds são os pets do tutor logado,
// para o extrato mostrar nomes reais.
const getExtrato = async (animalIds: number[]): Promise<LancamentoPontos[]> => {
  await wait(400);
  return EXEMPLOS.map((e, i) => ({
    id: i + 1,
    consultaId: e.consultaId,
    animalId: animalIds.length > 0 ? animalIds[i % animalIds.length] : 1,
    clinicaId: CLINICA_ID,
    dataConsulta: e.dataConsulta,
    pontos: total(e.parcelas),
    createdAt: e.dataConsulta,
  }));
};

const getMemoria = async (consultaId: number): Promise<MemoriaPontos> => {
  await wait(1200);
  if (consultaId % 10 === 0) throw new Error('Memória de cálculo indisponível.');
  const exemplo = EXEMPLOS.find((e) => e.consultaId === consultaId) ?? EXEMPLOS[0];
  const parcelas =
    consultaId % 10 === 5 ? exemplo.parcelas.map((p) => ({ ...p, quantidade: 0, pontos: 0 })) : exemplo.parcelas;
  return { consultaId, responsavelId: RESPONSAVEL_ID, animalId: 1, total: total(parcelas), parcelas };
};

export { getExtrato, getMemoria, getSaldo };
