const TP_PROCEDIMENTO = ['VACINACAO', 'EXAME', 'CIRURGIA', 'CONSULTA', 'OUTRO'] as const;
const TP_STATUS_PROCEDIMENTO = ['AGENDADO', 'REALIZADO', 'CANCELADO'] as const;

interface Procedimento {
  id: string | number;
  animalId: string | number;
  nome: string;
  tipo: (typeof TP_PROCEDIMENTO)[number];
  status: (typeof TP_STATUS_PROCEDIMENTO)[number];
  dataPrevistaInicio?: string | null;
  descricao?: string | null;
}

export type { Procedimento };
export { TP_PROCEDIMENTO, TP_STATUS_PROCEDIMENTO };
