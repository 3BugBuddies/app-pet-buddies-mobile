import { useCallback } from 'react';
import type { AppointmentReminderOptions } from '../model/notification';
import { notifyAppointmentBooked, scheduleAppointmentReminder } from '../repository/notificationService';

export function useNotificationsControl() {
  // Avisa o tutor que a consulta foi agendada e deixa o lembrete programado.
  // Falha de notificação não pode desfazer nem travar um agendamento que já deu certo.
  const notifyBooked = useCallback(async (options: AppointmentReminderOptions) => {
    if (Number.isNaN(options.appointmentDate.getTime())) return;
    try {
      await notifyAppointmentBooked(options);
      await scheduleAppointmentReminder(options);
    } catch (error) {
      console.warn('[Notifications] Não foi possível notificar o agendamento:', error);
    }
  }, []);

  return { notifyBooked };
}
