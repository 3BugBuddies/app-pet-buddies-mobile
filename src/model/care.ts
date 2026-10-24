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
  origin?: string | null;
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

export type CareItemStatus =
  | 'PENDENTE'
  | 'REALIZADO'
  | 'SUSPENSO'
  | 'ENCAMINHADO'
  | 'CANCELADO'
  | 'ATRASADO';

// REALIZADO, SUSPENSO e ENCAMINHADO encerram o item (o check-in grava um deles por desfecho).
export const CLOSED_STATUSES: readonly CareItemStatus[] = ['REALIZADO', 'SUSPENSO', 'ENCAMINHADO'];

export const isStatusClosed = (status: CareItemStatus): boolean => CLOSED_STATUSES.includes(status);

export type StatusTone = 'success' | 'warning' | 'alert' | 'neutral';

export interface StatusDisplay {
  label: string;
  tone: StatusTone;
}

export function statusDisplay(status: CareItemStatus, medication: boolean, overdue: boolean): StatusDisplay {
  switch (status) {
    case 'REALIZADO':
      return { label: medication ? 'Dose dada' : 'Feito', tone: 'success' };
    case 'SUSPENSO':
      return { label: 'Sem dose', tone: 'warning' };
    case 'ENCAMINHADO':
      return { label: 'Clínica acionada', tone: 'alert' };
    case 'ATRASADO':
      return { label: 'Atrasado', tone: 'alert' };
    case 'CANCELADO':
      return { label: 'Cancelado', tone: 'neutral' };
    case 'PENDENTE':
      return overdue ? { label: 'Atrasado', tone: 'alert' } : { label: 'Pendente', tone: 'neutral' };
  }
}

// Item do plano para a aba Cuidados. `treatment` = item nascido de prescrição.
export interface CareItem {
  id: string;
  title: string;
  dateIso: string;
  dateLabel: string;
  type: string;
  status: CareItemStatus;
  overdue: boolean;
  treatment: boolean;
  executedAt?: string | null;
  doseApplied?: number | null;
  interval?: string | null;
  // Unidade da dose, vinda do tratamento do medicamento do item.
  unit?: string | null;
}

export interface TreatmentInfo {
  medication: string;
  unit: string | null;
  frequencyPerDay: number | null;
  start: string;
  end: string;
}

export interface SuspendedTreatment {
  medication: string;
  at: string;
  items: CareItem[];
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
  createdAt?: string | null;
  category?: 'PREVENTIVO' | 'TRATAMENTO' | 'POS_CIRURGICO';
  endDate?: string | null;
  modelName?: string | null;
  treatment?: TreatmentInfo | null;
  clinic?: ClinicaContato | null;
  suspended?: SuspendedTreatment | null;
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
  ruleApplied?: boolean;
  medicationLabel?: string;
  // O desfecho gravou o status de um item do plano (itemPlanoCuidadoId presente).
  itemClosed?: boolean;
  // A regra aplicada suspendeu a dose de hoje (desfecho SEM_DOSE): não há dose a dar.
  suspended?: boolean;
}

export interface CheckInEscalationResult {
  status: 'ESCALATION';
  reasonLabel: string;
  // true = reasonLabel lista condições do catálogo; false = texto do relato.
  reasonFromConditions?: boolean;
  clinicName?: string;
  clinicPhone?: string;
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
  critica?: boolean;
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

export interface ClinicaContato {
  nome: string;
  telefone: string;
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
  clinica?: ClinicaContato | null;
}

// Entrada da mutation de confirmação: o payload da API + o que a IA já tinha sinalizado
// na extração (a API não devolve o motivo da escalação).
export interface ConfirmCheckInInput {
  payload: CheckInRequest;
  redFlags: string[];
  alarmLabels?: string[];
}

// Payload completo de POST /api/checkin (check-in em dois passos).
export interface CheckInRequest {
  animalId: number | string;
  narrativa: string;
  itemPlanoCuidadoId?: number;
  ticUtilizada?: string;
  condicoes: CondicaoConfirmadaRequest[];
}

const WEEKDAYS_PT = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

export function dayAndWeekday(iso: string, today: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const weekday = iso === today ? 'hoje' : WEEKDAYS_PT[new Date(year, month - 1, day).getDay()];
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')} · ${weekday}`;
}

export interface TreatmentGroup {
  name: string;
  rangeLabel: string;
  perDay: number;
  items: CareItem[];
}

// perDay só aparece quando o plano traz mais de um item do mesmo remédio no mesmo dia.
export function groupTreatments(items: CareItem[]): TreatmentGroup[] {
  const byName = new Map<string, CareItem[]>();
  for (const item of items) byName.set(item.title, [...(byName.get(item.title) ?? []), item]);
  return [...byName.entries()].map(([name, group]) => {
    const sorted = [...group].sort((a, b) => a.dateIso.localeCompare(b.dateIso));
    const counts = new Map<string, number>();
    for (const item of sorted) counts.set(item.dateIso, (counts.get(item.dateIso) ?? 0) + 1);
    const short = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
    const first = sorted[0].dateIso;
    const last = sorted[sorted.length - 1].dateIso;
    return {
      name,
      rangeLabel: first === last ? short(first) : `${first.slice(8, 10)} a ${short(last)}`,
      perDay: Math.max(...counts.values()),
      items: sorted,
    };
  });
}

export function activePlansLabel(plan: CarePlan): string {
  const parts: string[] = [];
  const names = [...new Set(plan.items.filter((item) => item.treatment).map((item) => item.title))];
  if (plan.items.some((item) => !item.treatment)) parts.push(plan.modelName ?? 'Preventivo');
  if (names.length > 0) parts.push(`Tratamento com ${names.join(', ')}`);
  if (plan.suspended) parts.push('tratamento suspenso');
  return parts.join(' · ');
}
