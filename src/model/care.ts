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
  // PRESCRICAO = medicação (tem check-in); PROTOCOLO = vacina/vermífugo do plano preventivo.
  origem?: string | null;
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

export type StatusItem =
  | 'PENDENTE'
  | 'REALIZADO'
  | 'SUSPENSO'
  | 'ENCAMINHADO'
  | 'CANCELADO'
  | 'ATRASADO';

// REALIZADO, SUSPENSO e ENCAMINHADO encerram o item (o check-in grava um deles por desfecho).
export const STATUS_CONCLUIDOS: readonly StatusItem[] = ['REALIZADO', 'SUSPENSO', 'ENCAMINHADO'];

export const isStatusConcluido = (status: StatusItem): boolean => STATUS_CONCLUIDOS.includes(status);

export type StatusTone = 'success' | 'warning' | 'alert' | 'neutral';

export interface StatusDisplay {
  label: string;
  tone: StatusTone;
}

export function statusDisplay(status: StatusItem, medicacao: boolean, vencido: boolean): StatusDisplay {
  switch (status) {
    case 'REALIZADO':
      return { label: medicacao ? 'dose dada' : 'realizado', tone: 'success' };
    case 'SUSPENSO':
      return { label: 'sem dose', tone: 'warning' };
    case 'ENCAMINHADO':
      return { label: 'clínica acionada', tone: 'alert' };
    case 'ATRASADO':
      return { label: 'atrasado', tone: 'alert' };
    case 'CANCELADO':
      return { label: 'cancelado', tone: 'neutral' };
    case 'PENDENTE':
      return vencido ? { label: 'atrasado', tone: 'alert' } : { label: 'pendente', tone: 'neutral' };
  }
}

// Item do plano para a aba Cuidados. `tratamento` = item nascido de prescrição.
export interface CareItem {
  id: string;
  title: string;
  dateIso: string;
  dateLabel: string;
  tipo: string;
  status: StatusItem;
  vencido: boolean;
  tratamento: boolean;
}

export interface CareHistoryItem {
  id: string;
  dateIso: string;
  dateLabel: string;
  dayLabel: string;
  title: string;
  completed: boolean;
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
  history?: CareHistoryItem[];
  items: CareItem[];
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
  // false = nenhuma regra casou (dose-base da receita). Ausente nos resultados locais/mock.
  regraAplicada?: boolean;
  medicationLabel?: string;
  // O desfecho gravou o status de um item do plano (itemPlanoCuidadoId presente).
  itemEncerrado?: boolean;
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
// em "confirmar com a clínica", nunca em dose.
export interface CheckInNoRuleResult {
  status: 'NO_RULE';
  vetName: string;
  vetCrmv: string;
}

export type CheckInResult = CheckInDoseResult | CheckInEscalationResult | CheckInNoRuleResult;

// --- DTOs do fluxo de IA: Check-in Narrado (POST /api/checkin/extracao) ---

export interface CheckinExtracaoRequest {
  animalId: number | string;
  dataReferencia: string; // "yyyy-MM-dd"
  narrativa: string;
}

// Uma condição clínica que a IA identificou na narrativa do tutor.
export interface CondicaoObservadaExtracao {
  condicaoClinicaId: number;
  valorBooleano?: boolean;
  valorNumerico?: number;
  confianca: number; // 0.0 – 1.0
  rotulo?: string | null;
  unidade?: string | null;
}

// Corpo cru da resposta de /checkin/extracao — sem envelope HATEOAS.
export interface CheckinExtracaoResponse {
  animalId: number | string;
  dataReferencia: string;
  narrativa: string;
  condicoes: CondicaoObservadaExtracao[];
  redFlags: string[];
  degradado: boolean;
}

// --- DTOs do fluxo de confirmação: POST /api/checkin ---

export interface CondicaoConfirmadaRequest {
  condicaoClinicaId: number;
  valorBooleano?: boolean;
  valorNumerico?: number;
  confianca: number;
}

// Resposta de POST /api/checkin (CheckinResponse do Java). Quem diz se houve escalação é
// `escalado`; `desfechos` traz a dose por medicamento (vazio = nenhuma regra bateu).
export type TipoDesfecho = 'DOSE_CALCULADA' | 'ACIONAR_CLINICA' | 'SEM_DOSE';

export interface CheckinDesfecho {
  prescricaoId: number;
  medicamento: string;
  itemPlanoCuidadoId: number | null;
  desfecho: TipoDesfecho;
  doseAplicada: number | null;
  unidade: string | null;
  regraAplicadaId: number | null;
  // Campos novos do back-end (A5): ausentes em respostas antigas.
  veterinarioNome?: string | null;
  veterinarioCrmv?: string | null;
  clinicaNome?: string | null;
  prescritaEm?: string | null;
}

export interface CheckinResponse {
  id: number;
  animalId: number;
  itemPlanoCuidadoId: number | null;
  dataReferencia: string;
  registradoEm: string;
  narrativa: string;
  escalado: boolean;
  desfechos: CheckinDesfecho[];
}

// Entrada da mutation de confirmação: o payload da API + o que a IA já tinha sinalizado
// na extração (a API não devolve o motivo da escalação).
export interface ConfirmCheckInInput {
  payload: CheckInRequest;
  redFlags: string[];
}

// Payload completo de POST /api/checkin (check-in em dois passos).
export interface CheckInRequest {
  animalId: number | string;
  narrativa: string;
  itemPlanoCuidadoId?: number;
  ticUtilizada?: string;
  condicoes: CondicaoConfirmadaRequest[];
}

// Etiqueta de estado do hero da home, derivada dos itens do plano (sem dado fixo).
export function planStateLabel(plan: CarePlan | null | undefined, hoje: string): string | undefined {
  if (!plan) return undefined;
  const tratamento = plan.items.filter((item) => item.tratamento).map((item) => item.dateIso).sort();
  const primeira = tratamento[0];
  const ultima = tratamento[tratamento.length - 1];
  if (primeira && ultima && ultima >= hoje) {
    const dia = (iso: string) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10))) / 86400000;
    const total = dia(ultima) - dia(primeira) + 1;
    const atual = Math.min(total, Math.max(1, dia(hoje) - dia(primeira) + 1));
    return `Tratamento · dia ${atual} de ${total}`;
  }
  return plan.items.length > 0 ? 'Preventivo' : undefined;
}
