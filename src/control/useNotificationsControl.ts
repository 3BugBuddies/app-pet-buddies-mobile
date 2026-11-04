import { useCallback } from 'react';
import type { AppointmentReminderOptions } from '../model/notification';
import { notifyAppointmentBooked, scheduleAppointmentReminders } from '../repository/notificationService';

export function useNotificationsControl() {
  // Avisa o tutor que a consulta foi agendada e deixa os lembretes programados (2 h, 1 h e 30 min antes).
  // Falha de notificação não pode desfazer nem travar um agendamento que já deu certo.
  const notifyBooked = useCallback(async (options: AppointmentReminderOptions) => {
    if (Number.isNaN(options.appointmentDate.getTime())) return;
    try {
      await notifyAppointmentBooked(options);
      await scheduleAppointmentReminders(options);
    } catch (error) {
      console.warn('[Notifications] Não foi possível notificar o agendamento:', error);
    }
  }, []);

  return { notifyBooked };
}
