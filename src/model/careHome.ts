import type { CareItem, CarePlan, TreatmentInfo } from './care';
import { isStatusClosed } from './care';

export type DayDot = 'DONE' | 'NO_DOSE' | 'REFERRED' | 'PENDING' | 'TODO' | 'OFF';

export interface WeekDayCell {
  iso: string;
  weekday: string;
  dayNumber: string;
  isToday: boolean;
  dot: DayDot;
}

export interface TreatmentWeek {
  medication: string;
  days: WeekDayCell[];
  currentDay: number;
  totalDays: number;
  dosesGiven: number;
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

const hasOutcome = (item: CareItem): boolean => item.doseApplied != null || !!item.executedAt;

function dotFor(items: CareItem[], iso: string, today: string): DayDot {
  if (items.some((item) => item.status === 'ENCAMINHADO')) return 'REFERRED';
  if (items.some((item) => item.status === 'PENDENTE' || item.status === 'ATRASADO')) {
    return iso > today ? 'TODO' : 'PENDING';
  }
  if (items.some((item) => item.status === 'REALIZADO')) return 'DONE';
  if (items.some((item) => item.status === 'SUSPENSO' && hasOutcome(item))) return 'NO_DOSE';
  if (items.length === 0) return iso > today ? 'TODO' : 'OFF';
  return 'OFF';
}

export function treatmentWeek(
  items: CareItem[],
  info: TreatmentInfo | null | undefined,
  medication: string,
  today: string,
): TreatmentWeek | null {
  if (items.length === 0) return null;
  const dates = items.map((item) => item.dateIso).sort();
  const start = info?.start ?? dates[0];
  const end = info?.end ?? dates[dates.length - 1];
  const totalDays = utcDay(end) - utcDay(start) + 1;
  if (totalDays < 1) return null;

  const days: WeekDayCell[] = Array.from({ length: totalDays }, (_, index) => {
    const iso = addDays(start, index);
    const [year, month, day] = iso.split('-').map(Number);
    return {
      iso,
      weekday: WEEKDAY_SHORT[new Date(Date.UTC(year, month - 1, day)).getUTCDay()],
      dayNumber: String(day),
      isToday: iso === today,
      dot: dotFor(items.filter((item) => item.dateIso === iso), iso, today),
    };
  });

  return {
    medication,
    days,
    currentDay: Math.min(totalDays, Math.max(1, utcDay(today) - utcDay(start) + 1)),
    totalDays,
    dosesGiven: items.filter((item) => item.status === 'REALIZADO').length,
    endLabel: `${end.slice(8, 10)}/${end.slice(5, 7)}`,
    ended: end < today,
  };
}

export function activeTreatmentWeek(plan: CarePlan, today: string): TreatmentWeek | null {
  const items = plan.items.filter((item) => item.treatment);
  if (items.length === 0) return null;
  const week = treatmentWeek(items, plan.treatment, plan.treatment?.medication ?? items[0].title, today);
  return week && !week.ended ? week : null;
}

export function suspendedTreatmentWeek(plan: CarePlan, today: string): TreatmentWeek | null {
  if (!plan.suspended) return null;
  return treatmentWeek(plan.suspended.items, plan.treatment, plan.suspended.medication, today);
}

export function todayTreatmentItems(plan: CarePlan, today: string): CareItem[] {
  return plan.items.filter((item) => item.treatment && item.dateIso === today && item.status !== 'CANCELADO');
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
  return plan.createdAt?.slice(0, 10) === today ? 'Preventivo · criado hoje' : 'Preventivo';
}

export function clockLabel(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return `${String(date.getHours()).padStart(2, '0')}h${String(date.getMinutes()).padStart(2, '0')}`;
}

export const doseText = (dose: number): string => String(dose).replace('.', ',');

export const phoneDigits = (phone: string): string => phone.replace(/[^\d+]/g, '');
