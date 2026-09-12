export interface PetVaccine {
  id: string;
  name: string;
  dateLabel: string;
  status: 'APPLIED' | 'SCHEDULED';
}

export interface PetProfileDetails {
  petId: string;
  ageLabel: string;
  weightLabel: string;
  neuteredLabel: string;
  sexLabel: string;
  planStatusLabel: string;
  allergy?: string;
  homeInstruction: string;
  vaccines: PetVaccine[];
}

export interface WeekDay {
  label: string;
  dayNumber: number;
  isActive: boolean;
  dotColor: 'CUIDADO' | 'CASA' | 'NONE';
}

// Um item clínico do dia (medicamento ou procedimento). Espelha o que viria de
// T_PB_EVENTO_PLANO alimentado por T_PB_PRESCRICAO (NM_MEDICAMENTO, NR_DOSE_MIN,
// DS_UNIDADE, TX_ORIENTACAO) ou T_PB_PROCEDIMENTO (NM_NOME, DS_DESCRICAO).
export interface CareTask {
  id: string;
  title: string;
  description: string;
  time: string;
  points: number;
  completed: boolean;
  // % de adesão histórica do tutor nesse item — só usado na visão da vet
  // (PlanoPacienteScreen); ausente na visão do tutor.
  adherencePct?: number;
}

// Marco clínico do plano (ex.: revisão de peso, encerramento) — visão da vet.
export interface ClinicalMilestone {
  title: string;
  whenLabel: string;
  tagLabel?: string;
  done: boolean;
}

export interface CarePlan {
  petId: string;
  weekLabel: string;
  weekDays: WeekDay[];
  tasks: CareTask[];
  // Progresso do plano vivo (semana X de Y) e marcos clínicos — só usados na
  // visão da vet (PlanoPacienteScreen); opcionais pra não afetar o tutor.
  currentWeekNumber?: number;
  totalWeeks?: number;
  milestones?: ClinicalMilestone[];
}

export interface CheckInInterpretation {
  medicationGiven: boolean;
  appetite: 'NORMAL' | 'LOW' | 'NONE';
  defecated: boolean;
  stoolConsistency: 'NORMAL' | 'SOFT' | 'BLOOD';
  alarmSign: boolean;
  vomited: boolean;
  apathetic: boolean;
  breathingDifficulty: boolean;
}

export interface CheckInDoseResult {
  status: 'DOSE';
  doseLabel: string;
  doseRangeLabel: string;
  ruleDescription: string;
  ruleConfirmedAtLabel: string;
  vetName: string;
  vetCrmv: string;
  prescriptionDateLabel: string;
  pointsEarned: number;
}

export interface CheckInEscalationResult {
  status: 'ESCALATION';
  reasonLabel: string;
  ruleDescription: string;
  vetName: string;
  vetCrmv: string;
  suggestedSlotLabel: string;
}

// Nenhuma regra da prescrição bateu com o relato — princípio do produto: cai
// em "confirmar com a clínica", nunca em dose (ver RegrasPrescricao-html).
export interface CheckInNoRuleResult {
  status: 'NO_RULE';
  vetName: string;
  vetCrmv: string;
}

export type CheckInResult = CheckInDoseResult | CheckInEscalationResult | CheckInNoRuleResult;

export interface CareScore {
  totalPoints: number;
  pointsToday: number;
  tier: string;
  nextTier: string;
  pointsToNextTier: number;
  progressPct: number;
  streakDays: number;
  appointmentsCount: number;
  homeAdherencePct: number;
}

export interface Badge {
  id: string;
  name: string;
  unlocked: boolean;
}

// --- DTOs do fluxo de IA: Check-in Narrado (POST /api/checkin/extracao) ---

export interface CheckinExtracaoRequest {
  animalId: number | string;
  dataReferencia: string; // "yyyy-MM-dd"
  narrativa: string;
}

// Uma condição clínica que a IA identificou na narrativa do tutor.
// Espelha o array "condicoes" do CheckinExtracaoResponse do Java.
export interface CondicaoObservadaExtracao {
  condicaoClinicaId: number;
  valorBooleano?: boolean;
  valorNumerico?: number;
  confianca: number; // 0.0 – 1.0
}

// Corpo cru da resposta de /checkin/extracao — sem envelope HATEOAS (contrato seção 5).
export interface CheckinExtracaoResponse {
  animalId: number | string;
  dataReferencia: string;
  narrativa: string;
  condicoes: CondicaoObservadaExtracao[];
  redFlags: string[];
  degradado: boolean;
}

// --- DTOs do fluxo de confirmação: POST /api/checkin ---

// Condição confirmada pelo tutor — mesma forma da extração, remetida de volta ao Java.
export interface CondicaoConfirmadaRequest {
  condicaoClinicaId: number;
  valorBooleano?: boolean;
  valorNumerico?: number;
  confianca: number;
}

// Payload completo de POST /api/checkin (contrato seção 7 — Tutor · check-in em dois passos).
export interface CheckInRequest {
  animalId: number | string;
  narrativa: string;
  itemPlanoCuidadoId?: number;
  ticUtilizada?: string;
  condicoes: CondicaoConfirmadaRequest[];
}
