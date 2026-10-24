import type { CareItem } from './care';

const DAY_MS = 86400000;
const dayNumber = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / DAY_MS;
};

export interface TreatmentOverview {
  names: string[];
  // "dia N de M": calculado pelos itens, da primeira à última dose de qualquer medicamento.
  day: number;
  totalDays: number;
  finished: boolean;
}

export function treatmentOverview(items: CareItem[], today: string): TreatmentOverview | null {
  if (items.length === 0) return null;
  const dates = items.map((i) => i.dateIso).sort();
  const first = dayNumber(dates[0]);
  const last = dayNumber(dates[dates.length - 1]);
  const totalDays = last - first + 1;
  const finished = dayNumber(today) > last;
  return {
    names: [...new Set(items.map((i) => i.title))],
    day: Math.min(Math.max(dayNumber(today) - first + 1, 1), totalDays),
    totalDays,
    finished,
  };
}

// "até dd/mm" enquanto o medicamento tem dose pela frente, "encerrado" depois do último dia.
export function medicationEndLabel(items: CareItem[], today: string): string {
  const last = items.map((i) => i.dateIso).sort().pop() ?? today;
  return last < today ? 'encerrado' : `até ${last.slice(8, 10)}/${last.slice(5, 7)}`;
}
