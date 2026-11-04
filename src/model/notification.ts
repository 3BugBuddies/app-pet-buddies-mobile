export interface AppointmentReminderOptions {
  appointmentId: string;
  petName: string;
  serviceType: string; // Ex: "Vacinação", "Consulta de rotina"
  appointmentDate: Date; // Data e hora da consulta
  remindersMinutesBefore?: number[]; // Antecedências dos lembretes, em minutos (padrão: 2 h, 1 h e 30 min)
}

// Antecedências padrão dos lembretes, da mais longa para a mais curta.
export const DEFAULT_REMINDER_MINUTES = [120, 60, 30];

// Só as antecedências cujo horário ainda não passou: uma consulta daqui a 90 min não tem o lembrete
// de 2 h, e uma daqui a menos de 30 min fica só com a confirmação.
export const upcomingReminderLeads = (
  appointmentDate: Date,
  leads: number[] = DEFAULT_REMINDER_MINUTES,
  now: Date = new Date()
): number[] =>
  leads
    .filter((minutes) => appointmentDate.getTime() - minutes * 60 * 1000 > now.getTime())
    .sort((a, b) => b - a);

export const leadLabel = (minutes: number): string =>
  minutes % 60 === 0 ? `${minutes / 60} h` : `${minutes} min`;

// "2 h, 1 h e 30 min"
export const joinLeadLabels = (leads: number[]): string => {
  const labels = leads.map(leadLabel);
  if (labels.length <= 1) return labels.join('');
  return `${labels.slice(0, -1).join(', ')} e ${labels[labels.length - 1]}`;
};

// Para onde o toque na notificação leva. Vai no campo `data` da notificação.
export type NotificationDestination = 'AGENDA_TUTOR';

// type (e não interface) para ser aceito como o `data` da notificação, que é um Record<string, unknown>.
export type NotificationData = {
  destino: NotificationDestination;
  consultaId?: string;
};

const DESTINATIONS: NotificationDestination[] = ['AGENDA_TUTOR'];

// O `data` vem do sistema operacional sem tipo: só aceita destinos que o app conhece.
export const parseNotificationDestination = (data: unknown): NotificationDestination | null => {
  const destino = (data as Partial<NotificationData> | null | undefined)?.destino;
  return destino && DESTINATIONS.includes(destino) ? destino : null;
};
