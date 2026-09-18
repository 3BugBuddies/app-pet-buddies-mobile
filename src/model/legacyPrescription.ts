// Forma ANTIGA de prescricao (nomes em ingles, status DRAFT/SIGNED), usada
// so pelo motor de simulacao de check-in (careRepository.ts/careRules.ts) e
// pela tela de protocolos. Nao confundir com model/prescription.ts, que e a
// prescricao real, assinada de verdade (Fase 4) — unificar as duas exigiria
// portar esse motor de regras pro schema novo (ver nota em careRepository.ts).
export type ConditionSignal =
  | 'FEZES_MOLES'
  | 'NAO_EVACUOU'
  | 'COMEU_POUCO'
  | 'VOMITO'
  | 'SANGUE_NAS_FEZES'
  | 'APATIA'
  | 'DIFICULDADE_RESPIRATORIA';

export const CONDITION_SIGNAL_LABEL: Record<ConditionSignal, string> = {
  FEZES_MOLES: 'Fezes moles',
  NAO_EVACUOU: 'Não evacuou',
  COMEU_POUCO: 'Comeu pouco',
  VOMITO: 'Vômito',
  SANGUE_NAS_FEZES: 'Sangue nas fezes',
  APATIA: 'Apatia',
  DIFICULDADE_RESPIRATORIA: 'Dificuldade respiratória',
};

// Sobrepõem qualquer prescrição/protocolo — sempre viram escalação, mesmo sem
// regra cadastrada pra elas.
export const GLOBAL_ALARM_SIGNALS: ConditionSignal[] = [
  'SANGUE_NAS_FEZES',
  'APATIA',
  'DIFICULDADE_RESPIRATORIA',
];

export type PersistenceKey = 'HOJE' | 'DOIS_DIAS' | 'QUARENTA_OITO_H' | 'TRES_MAIS_DIAS';

export const PERSISTENCE_LABEL: Record<PersistenceKey, string> = {
  HOJE: 'Hoje',
  DOIS_DIAS: '2 dias',
  QUARENTA_OITO_H: '48h',
  TRES_MAIS_DIAS: '3+ dias',
};

// "Manter dose do dia anterior" (do design original) não existe aqui — exigiria
export type RuleAction = 'MENOR_DOSE' | 'MAIOR_DOSE' | 'SEM_DOSE_CLINICA' | 'SEM_DOSE_EMERGENCIA';

export const RULE_ACTION_LABEL: Record<RuleAction, string> = {
  MENOR_DOSE: 'Menor dose da faixa',
  MAIOR_DOSE: 'Maior dose da faixa',
  SEM_DOSE_CLINICA: 'Sem dose · encaminhar à clínica',
  SEM_DOSE_EMERGENCIA: 'Sem dose · emergência 24h',
};

// Frase enxuta pro preview "como o tutor vai ver" e pro resultado do check-in.
export const RULE_ACTION_RESULT_LABEL: Record<RuleAction, string> = {
  MENOR_DOSE: 'menor dose da faixa',
  MAIOR_DOSE: 'maior dose da faixa',
  SEM_DOSE_CLINICA: 'sem dose · clínica',
  SEM_DOSE_EMERGENCIA: 'sem dose · emergência',
};

export interface PrescriptionRule {
  id: string;
  signal: ConditionSignal;
  persistence: PersistenceKey;
  action: RuleAction;
}

export interface Prescription {
  id: string;
  petId: string;
  medicationName: string;
  route: string;
  frequencyLabel: string;
  durationLabel: string;
  doseMin: number;
  doseMax: number;
  doseUnit: string;
  status: 'DRAFT' | 'SIGNED';
  rules: PrescriptionRule[];
  vetName: string;
  vetCrmv: string;
  prescriptionDateLabel: string;
}

export interface Protocol {
  id: string;
  name: string;
  categoryLabel: string;
  doseRangeLabel: string;
  ruleCount: number;
  patientCount: number;
}
