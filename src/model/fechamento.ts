import type { MedicalRecord } from './medicalRecord';
import type { PrescricaoDraft } from './prescription';
import type { Operador, TipoAcao } from './prescriptionRule';
import type { TipoProcedimento } from './procedure';

type SecaoProcedimento = 'VACINA_VERMIFUGO' | 'EXAME' | 'PROCEDIMENTO';

interface ItemAbertoPlano {
  id: number;
  tipo: 'VACINACAO' | 'VERMIFUGACAO';
  nome: string;
  dataAlvo: string;
  vencido: boolean;
}

interface ProcedimentoDraft {
  chave: string;
  secao: SecaoProcedimento;
  tipo: TipoProcedimento;
  nome: string;
  lote: string;
  observacao: string;
  itemPlanoId: number | null;
  itemManual: boolean;
}

interface FechamentoDraft {
  petId: string;
  petNome: string;
  consultaId: string | null;
  motivo: string;
  observacao: string;
  peso: string;
  procedimentos: ProcedimentoDraft[];
  prescricao: PrescricaoDraft | null;
}

interface ProcedimentoFechamento {
  tipo: TipoProcedimento;
  nome: string;
  observacao?: string;
  dataPrevistaInicio: string;
  dataPrevistaFim: string;
  itemPlanoId?: number;
}

interface RegraFechamento {
  condicaoClinicaId: number;
  rotuloCongelado: string;
  operador?: Operador;
  limite?: number;
  acaoDose: TipoAcao;
  ordem: number;
}

interface PrescricaoFechamento {
  medicamento: string;
  doseMin: number;
  doseMax: number;
  unidade: string;
  frequenciaDia: number;
  duracaoDias: number;
  dataInicio: string;
  orientacao?: string;
  regras: RegraFechamento[];
}

interface FechamentoPayload {
  registroAtendimento: MedicalRecord;
  procedimentos: ProcedimentoFechamento[];
  prescricoes: PrescricaoFechamento[];
}

export type {
  FechamentoDraft,
  FechamentoPayload,
  ItemAbertoPlano,
  PrescricaoFechamento,
  ProcedimentoDraft,
  ProcedimentoFechamento,
  RegraFechamento,
  SecaoProcedimento,
};
