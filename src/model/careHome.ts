import type { CareItem, CarePlan, TreatmentInfo } from './care';
import { isStatusClosed, medicationsTitle, treatmentsOf } from './care';

export type DayDot = 'DONE' | 'NO_DOSE' | 'REFERRED' | 'PENDING' | 'TODO' | 'OFF' | 'APPOINTMENT';

export interface WeekDayCell {
  iso: string;
  weekday: string;
  dayNumber: string;
  isToday: boolean;
  dot: DayDot;
  pressable?: boolean;
}

export interface TreatmentWeek {
  // Rótulo do cabeçalho: "A", "A + B" ou "A + 2".
  medication: string;
  medications: string[];
  days: WeekDayCell[];
  currentDay: number;
  totalDays: number;
  dosesGiven: number;
  // Dias com algum item com desfecho.
  reportsDone: number;
  endLabel: string;
  ended: boolean;
}

const WEEKDAY_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export const todayIso = (date: Date = new Date()): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const utcDay = (iso: string): number => {
  const [year, month, day] = iso.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
};

const addDays = (iso: string, amount: number): string =>
  new Date((utcDay(iso) + amount) * 86400000).toISOString().slice(0, 10);

const dayCell = (iso: string, today: string, dot: DayDot): WeekDayCell => {
  const [year, month, day] = iso.split('-').map(Number);
  return {
    iso,
    weekday: WEEKDAY_SHORT[new Date(Date.UTC(year, month - 1, day)).getUTCDay()],
    dayNumber: String(day),
    isToday: iso === today,
    dot,
  };
};

const hasOutcome = (item: CareItem): boolean => item.doseApplied != null || !!item.executedAt;

// Item que o relato do dia fechou: REALIZADO ou SUSPENSO por regra (com desfecho).
const isReported = (item: CareItem): boolean => item.status === 'REALIZADO' || hasOutcome(item);

function dotFor(items: CareItem[], iso: string, today: string): DayDot {
  if (items.some((item) => item.status === 'ENCAMINHADO')) return 'REFERRED';
  if (items.some((item) => item.status === 'PENDENTE' || item.status === 'ATRASADO')) {
    return iso > today ? 'TODO' : 'PENDING';
  }
  if (items.some((item) => item.status === 'REALIZADO' || item.doseApplied != null)) return 'DONE';
  if (items.some(hasOutcome)) return 'NO_DOSE';
  if (items.length === 0) return iso > today ? 'TODO' : 'OFF';
  return 'OFF';
}

const distinct = (values: string[]): string[] => [...new Set(values)];

// Só os medicamentos com item hoje; sem item hoje, todos os do plano.
function headerMedications(items: CareItem[], today: string): string[] {
  const todays = items.filter((item) => item.dateIso === today);
  return distinct((todays.length > 0 ? todays : items).map((item) => item.title));
}

export function treatmentWeek(items: CareItem[], medications: string[], today: string): TreatmentWeek | null {
  if (items.length === 0) return null;
  const dates = items.map((item) => item.dateIso).sort();
  const start = dates[0];
  const end = dates[dates.length - 1];
  const totalDays = utcDay(end) - utcDay(start) + 1;
  if (totalDays < 1) return null;

  const days: WeekDayCell[] = Array.from({ length: totalDays }, (_, index) => {
    const iso = addDays(start, index);
    return dayCell(iso, today, dotFor(items.filter((item) => item.dateIso === iso), iso, today));
  });

  return {
    medication: medicationsTitle(medications),
    medications,
    days,
    currentDay: Math.min(totalDays, Math.max(1, utcDay(today) - utcDay(start) + 1)),
    totalDays,
    dosesGiven: items.filter((item) => item.status === 'REALIZADO').length,
    reportsDone: new Set(items.filter(isReported).map((item) => item.dateIso)).size,
    endLabel: `${end.slice(8, 10)}/${end.slice(5, 7)}`,
    ended: end < today,
  };
}

export function activeTreatmentWeek(plan: CarePlan, today: string): TreatmentWeek | null {
  const items = plan.items.filter((item) => item.treatment);
  if (items.length === 0) return null;
  const week = treatmentWeek(items, headerMedications(items, today), today);
  return week && !week.ended ? week : null;
}

export function suspendedTreatmentWeek(plan: CarePlan, today: string): TreatmentWeek | null {
  if (!plan.suspended) return null;
  const names = plan.suspended.medications.length > 0 ? plan.suspended.medications : [plan.suspended.medication];
  return treatmentWeek(plan.suspended.items, names, today);
}

export function todayTreatmentItems(plan: CarePlan, today: string): CareItem[] {
  return plan.items.filter((item) => item.treatment && item.dateIso === today && item.status !== 'CANCELADO');
}

export const medicationKey = (item: CareItem): string => String(item.prescriptionId ?? item.title);

export const doseText = (dose: number): string => String(dose).replace('.', ',');

export function doseRangeText(info: Pick<TreatmentInfo, 'doseMin' | 'doseMax' | 'unit'>): string | null {
  const { doseMin, doseMax, unit } = info;
  if (doseMin == null && doseMax == null) return null;
  const value =
    doseMin != null && doseMax != null && doseMax !== doseMin
      ? `${doseText(doseMin)} a ${doseText(doseMax)}`
      : doseText(doseMin ?? doseMax ?? 0);
  return [value, unit].filter(Boolean).join(' ');
}

// Unidade do medicamento do item; o singular do plano só vale quando o item não traz a prescrição.
export function unitOf(treatments: TreatmentInfo[], item: CareItem): string | null {
  const own = treatments.find((t) => t.prescriptionId != null && t.prescriptionId === item.prescriptionId);
  return (own ?? (treatments.length === 1 ? treatments[0] : undefined))?.unit ?? null;
}

export interface MedicationLine {
  name: string;
  dose: string | null;
  frequency: string | null;
  endLabel: string;
  ended: boolean;
}

export function medicationLines(plan: CarePlan, today: string): MedicationLine[] {
  return treatmentsOf(plan).map((t) => {
    const own = plan.items.filter((item) => item.treatment && (item.prescriptionId != null ? item.prescriptionId === t.prescriptionId : item.title === t.medication));
    const end = own.length > 0 ? own.map((item) => item.dateIso).sort().at(-1) ?? t.end : t.end;
    return {
      name: t.medication,
      dose: doseRangeText(t),
      frequency: t.frequencyPerDay ? `${t.frequencyPerDay}x ao dia` : null,
      endLabel: `${end.slice(8, 10)}/${end.slice(5, 7)}`,
      ended: end < today,
    };
  });
}

export function todayMedications(plan: CarePlan | null | undefined, today: string): string[] {
  return plan ? distinct(todayTreatmentItems(plan, today).map((item) => item.title)) : [];
}

export const isItemPending = (item: CareItem): boolean => !isStatusClosed(item.status);

export function openPreventiveItems(plan: CarePlan): CareItem[] {
  return plan.items
    .filter((item) => !item.treatment && (item.status === 'PENDENTE' || item.status === 'ATRASADO'))
    .sort((a, b) => a.dateIso.localeCompare(b.dateIso));
}

export const isItemOverdue = (item: CareItem): boolean => item.overdue || item.status === 'ATRASADO';

export function planStateLabel(plan: CarePlan | null | undefined, today: string): string | undefined {
  if (!plan) return undefined;
  const week = activeTreatmentWeek(plan, today);
  if (week) return `Tratamento · dia ${week.currentDay} de ${week.totalDays}`;
  if (plan.items.length === 0 && !plan.suspended) return undefined;
  if (plan.suspended && plan.items.length === 0) return 'Tratamento suspenso';
  return plan.createdAt?.slice(0, 10) === today ? 'Preventivo · criado hoje' : 'Preventivo';
}

export interface ScheduledVisit {
  date: string;
  reason: string;
}

export interface FreeWeek {
  days: WeekDayCell[];
  visit: ScheduledVisit | null;
  footer: string;
}

const visitLabel = (visit: ScheduledVisit): string => {
  const iso = visit.date.slice(0, 10);
  const [hours, minutes] = visit.date.slice(11, 16).split(':');
  const hour = minutes && minutes !== '00' ? `${Number(hours)}h${minutes}` : `${Number(hours)}h`;
  const weekday = dayCell(iso, iso, 'TODO').weekday;
  return `${visit.reason || 'Consulta'} ${weekday}. ${iso.slice(8, 10)}/${iso.slice(5, 7)}, ${hour}`;
};

export function freeWeek(today: string, visit: ScheduledVisit | null | undefined, freeDates: string[]): FreeWeek {
  const visitIso = visit?.date.slice(0, 10);
  const free = new Set(freeDates);
  const days = Array.from({ length: 7 }, (_, index) => {
    const iso = addDays(today, index);
    const isVisit = iso === visitIso;
    return { ...dayCell(iso, today, isVisit ? 'APPOINTMENT' : 'TODO'), pressable: isVisit || free.has(iso) };
  });
  return {
    days,
    visit: visit ?? null,
    footer: `Sem tratamento ativo · ${visit ? visitLabel(visit) : 'nenhuma consulta marcada'}`,
  };
}

export function upcomingVisit<T extends ScheduledVisit & { petId: string; status: string }>(
  appointments: T[] | undefined,
  petId: string | undefined,
  today: string,
): T | undefined {
  if (!appointments || !petId) return undefined;
  return appointments
    .filter(
      (a) => a.petId === petId && a.date?.slice(0, 10) >= today && a.status !== 'CANCELED' && a.status !== 'COMPLETED',
    )
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}

export const weekEndIso = (today: string): string => addDays(today, 6);

export function clockLabel(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return `${String(date.getHours()).padStart(2, '0')}h${String(date.getMinutes()).padStart(2, '0')}`;
}

export const phoneDigits = (phone: string): string => phone.replace(/[^\d+]/g, '');
