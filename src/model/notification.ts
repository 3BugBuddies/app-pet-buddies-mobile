export interface AppointmentReminderOptions {
  appointmentId: string;
  petName: string;
  serviceType: string; // Ex: "Vacinação", "Consulta de rotina"
  appointmentDate: Date; // Data e hora da consulta
  reminderMinutesBefore?: number; // Antecedência do lembrete (padrão 60 min)
}

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
