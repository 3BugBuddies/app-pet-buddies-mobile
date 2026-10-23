const TP_PROCEDIMENTO = [
  'VACINACAO',
  'VERMIFUGACAO',
  'EXAME_LABORATORIAL',
  'EXAME_IMAGEM',
  'CIRURGIA',
  'INTERNACAO',
  'OUTRO',
] as const;

type TipoProcedimento = (typeof TP_PROCEDIMENTO)[number];
const TP_STATUS_PROCEDIMENTO = ['AGENDADO', 'REALIZADO', 'CANCELADO'] as const;

interface Procedimento {
  id: string | number;
  animalId: string | number;
  nome: string;
  tipo: TipoProcedimento;
  status: (typeof TP_STATUS_PROCEDIMENTO)[number];
  dataPrevistaInicio?: string | null;
  descricao?: string | null;
}

export type { Procedimento, TipoProcedimento };
export { TP_PROCEDIMENTO, TP_STATUS_PROCEDIMENTO };
