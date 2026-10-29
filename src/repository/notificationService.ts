import { Platform } from 'react-native';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { cancelAllScheduledNotificationsAsync } from 'expo-notifications/build/cancelAllScheduledNotificationsAsync';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import { formatAppointmentDate } from '../model/formatDate';
import type { AppointmentReminderOptions, NotificationData } from '../model/notification';

const CHANNEL_ID = 'default';
const DEFAULT_REMINDER_MINUTES = 60;

// Configura para exibir banner e som mesmo com o app em primeiro plano
setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Identificador fixo por consulta: permite cancelar o lembrete sem guardar o id gerado.
const reminderId = (appointmentId: string) => `consulta-${appointmentId}-lembrete`;

const toData = (appointmentId: string): NotificationData => ({
  destino: 'AGENDA_TUTOR',
  consultaId: appointmentId,
});

const leadLabel = (minutes: number): string =>
  minutes % 60 === 0 ? `${minutes / 60} h` : `${minutes} min`;

/**
 * Inicializa permissões e canal do Android para notificações locais
 */
export async function initNotifications(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      try {
        await setNotificationChannelAsync(CHANNEL_ID, {
          name: 'Geral',
          importance: AndroidImportance?.MAX ?? 5,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#078FE8',
        });
      } catch (channelErr) {
        // No Expo Go Android, o provedor nativo de canais pode não estar disponível,
        // mas as notificações locais continuam funcionando normalmente.
        console.log('[Notifications] Canal do Android ignorado no Expo Go:', channelErr);
      }
    }

    const { status: existingStatus } = await getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Erro ao inicializar notificações:', error);
    return false;
  }
}

/**
 * Confirma na hora que a consulta foi agendada. Disparada pelo agendamento feito pelo tutor.
 */
export async function notifyAppointmentBooked(options: AppointmentReminderOptions): Promise<string> {
  const { dayLabel, timeLabel } = formatAppointmentDate(options.appointmentDate.toISOString());
  const minutes = options.reminderMinutesBefore ?? DEFAULT_REMINDER_MINUTES;

  return await scheduleNotificationAsync({
    content: {
      title: `Consulta agendada · ${options.petName}`,
      body: `${options.serviceType} · ${dayLabel} às ${timeLabel}. Vamos te lembrar ${leadLabel(minutes)} antes.`,
      data: toData(options.appointmentId),
      sound: 'notification.wav',
    },
    trigger: null,
  });
}

/**
 * Agenda o lembrete da consulta. Devolve null quando o horário do lembrete já passou
 * (consulta marcada para daqui a menos que a antecedência).
 */
export async function scheduleAppointmentReminder(
  options: AppointmentReminderOptions
): Promise<string | null> {
  const minutes = options.reminderMinutesBefore ?? DEFAULT_REMINDER_MINUTES;
  const triggerDate = new Date(options.appointmentDate.getTime() - minutes * 60 * 1000);
  if (triggerDate.getTime() <= Date.now()) return null;

  const { timeLabel } = formatAppointmentDate(options.appointmentDate.toISOString());

  return await scheduleNotificationAsync({
    identifier: reminderId(options.appointmentId),
    content: {
      title: `Lembrete de consulta · ${options.petName}`,
      body: `${options.serviceType} às ${timeLabel}. Faltam ${leadLabel(minutes)}.`,
      data: toData(options.appointmentId),
      sound: 'notification.wav',
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: CHANNEL_ID,
    },
  });
}

/**
 * Cancela o lembrete de uma consulta (cancelamento ou conclusão).
 */
export async function cancelAppointmentReminder(appointmentId: string): Promise<void> {
  await cancelScheduledNotificationAsync(reminderId(appointmentId));
}

/**
 * Cancela todos os lembretes agendados. Usado ao sair da conta: no mesmo aparelho
 * os lembretes de uma conta não podem chegar para a próxima.
 */
export async function cancelAllReminders(): Promise<void> {
  await cancelAllScheduledNotificationsAsync();
}
