import type { LancamentoPontos, MemoriaPontos, ParcelaPontos, SaldoPontos } from './pontuacao';

// Leitores das respostas do Java em /api/pontuacao/... O Java entrega cada recurso num envelope
// HATEOAS: os campos ficam no topo, junto de _links, e as listas vêm em _embedded. Aqui só
// entram os campos que o app usa, com valor padrão para o que faltar.

type Cru = Record<string, unknown>;

const numero = (valor: unknown): number => (typeof valor === 'number' && Number.isFinite(valor) ? valor : 0);
const texto = (valor: unknown): string => (typeof valor === 'string' ? valor : '');

const lerSaldo = (data: Cru): SaldoPontos => ({
  responsavelId: numero(data.responsavelId),
  saldo: numero(data.saldo),
});

const lerLancamento = (cru: Cru): LancamentoPontos => ({
  id: numero(cru.id),
  consultaId: numero(cru.consultaId),
  animalId: numero(cru.animalId),
  clinicaId: numero(cru.clinicaId),
  dataConsulta: texto(cru.dataConsulta),
  pontos: numero(cru.pontos),
  createdAt: texto(cru.createdAt),
});

// Extrato vazio chega sem _embedded. O nome da lista não importa: vale a primeira que houver.
const lerExtrato = (data: Cru | null | undefined): LancamentoPontos[] => {
  const embedded = data?._embedded as Cru | undefined;
  const lista = embedded ? Object.values(embedded).find(Array.isArray) : undefined;
  return ((lista as Cru[] | undefined) ?? []).map(lerLancamento);
};

const lerParcela = (cru: Cru): ParcelaPontos => ({
  gesto: texto(cru.gesto),
  quantidade: numero(cru.quantidade),
  pontosPorUnidade: numero(cru.pontosPorUnidade),
  pontos: numero(cru.pontos),
  observacao: texto(cru.observacao),
});

const lerMemoria = (data: Cru): MemoriaPontos => ({
  consultaId: numero(data.consultaId),
  responsavelId: numero(data.responsavelId),
  animalId: numero(data.animalId),
  total: numero(data.total),
  parcelas: (Array.isArray(data.parcelas) ? (data.parcelas as Cru[]) : []).map(lerParcela),
});

export { lerExtrato, lerMemoria, lerSaldo };
