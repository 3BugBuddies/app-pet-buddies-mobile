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

// Origem opcional da prescrição (receita-modelo); a API exige os dois campos juntos ou nenhum.
type ClosingPrescriptionDraft = PrescricaoDraft & {
  receitaModeloId?: number | null;
  receitaModeloVersao?: number | null;
};

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
  prescription: ClosingPrescriptionDraft | null;
}

interface ClosingDoneSummary {
  petName: string;
  reason: string;
  whenIso: string;
  responsavel: string;
  vaccines: { nome: string; alvo: string | null }[];
  others: { label: string; nome: string }[];
  medicamento: string | null;
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
  receitaModeloId?: number;
  receitaModeloVersao?: number;
  regras: ClosingRule[];
}

interface ClosingPayload {
  registroAtendimento: MedicalRecord;
  procedimentos: ClosingProcedure[];
  prescricoes: ClosingPrescription[];
}

export type {
  ClosingDoneSummary,
  ClosingDraft,
  ClosingPayload,
  ClosingPrescription,
  ClosingPrescriptionDraft,
  ClosingProcedure,
  ClosingRule,
  OpenPlanItem,
  ProcedureDraft,
  ProcedureSection,
};
