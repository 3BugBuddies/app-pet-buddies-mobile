import type { MedicalRecord } from './medicalRecord';
import type { PrescricaoDraft } from './prescription';
import type { Operador, TipoAcao } from './prescriptionRule';
import type { TipoProcedimento } from './procedure';

type ProcedureSection = 'VACINA_VERMIFUGO' | 'EXAME' | 'PROCEDIMENTO';

interface OpenPlanItem {
  id: number;
  tipo: 'VACINACAO' | 'VERMIFUGACAO';
  nome: string;
  dataAlvo: string;
  vencido: boolean;
}

interface ProcedureDraft {
  key: string;
  section: ProcedureSection;
  tipo: TipoProcedimento;
  nome: string;
  batch: string;
  notes: string;
  itemPlanoId: number | null;
  manualItem: boolean;
}

interface ClosingDraft {
  petId: string;
  petName: string;
  appointmentId: string | null;
  reason: string;
  notes: string;
  weight: string;
  procedures: ProcedureDraft[];
  prescription: PrescricaoDraft | null;
}

interface ClosingProcedure {
  tipo: TipoProcedimento;
  nome: string;
  observacao?: string;
  dataPrevistaInicio: string;
  dataPrevistaFim: string;
  itemPlanoId?: number;
}

interface ClosingRule {
  condicaoClinicaId: number;
  rotuloCongelado: string;
  operador?: Operador;
  limite?: number;
  acaoDose: TipoAcao;
  ordem: number;
}

interface ClosingPrescription {
  medicamento: string;
  doseMin: number;
  doseMax: number;
  unidade: string;
  frequenciaDia: number;
  duracaoDias: number;
  dataInicio: string;
  orientacao?: string;
  regras: ClosingRule[];
}

interface ClosingPayload {
  registroAtendimento: MedicalRecord;
  procedimentos: ClosingProcedure[];
  prescricoes: ClosingPrescription[];
}

export type {
  ClosingDraft,
  ClosingPayload,
  ClosingPrescription,
  ClosingProcedure,
  ClosingRule,
  OpenPlanItem,
  ProcedureDraft,
  ProcedureSection,
};
