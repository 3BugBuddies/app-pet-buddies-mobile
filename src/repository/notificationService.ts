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
import {
  DEFAULT_REMINDER_MINUTES,
  joinLeadLabels,
  leadLabel,
  upcomingReminderLeads,
  type AppointmentReminderOptions,
  type NotificationData,
} from '../model/notification';

const CHANNEL_ID = 'default';

// Configura para exibir banner e som mesmo com o app em primeiro plano
setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Identificador fixo por consulta e antecedência: permite cancelar os lembretes sem guardar os ids gerados.
const reminderId = (appointmentId: string, minutes: number) => `consulta-${appointmentId}-lembrete-${minutes}`;

// Id do lembrete único das versões antigas do app: ainda pode estar agendado num aparelho já instalado.
const legacyReminderId = (appointmentId: string) => `consulta-${appointmentId}-lembrete`;

const toData = (appointmentId: string): NotificationData => ({
  destino: 'AGENDA_TUTOR',
  consultaId: appointmentId,
});

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
 * A frase "Vamos te lembrar…" lista só os lembretes que ainda cabem antes da consulta.
 */
export async function notifyAppointmentBooked(options: AppointmentReminderOptions): Promise<string> {
  const { dayLabel, timeLabel } = formatAppointmentDate(options.appointmentDate.toISOString());
  const leads = upcomingReminderLeads(options.appointmentDate, options.remindersMinutesBefore);
  const lembretes = leads.length > 0 ? ` Vamos te lembrar ${joinLeadLabels(leads)} antes.` : '';

  return await scheduleNotificationAsync({
    content: {
      title: `Consulta agendada · ${options.petName}`,
      body: `${options.serviceType} · ${dayLabel} às ${timeLabel}.${lembretes}`,
      data: toData(options.appointmentId),
      sound: 'notification.wav',
    },
    trigger: null,
  });
}

/**
 * Agenda os lembretes da consulta (por padrão 2 h, 1 h e 30 min antes). Pula os que já passaram:
 * uma consulta daqui a 90 min ganha só os de 1 h e 30 min. Devolve os ids agendados.
 */
export async function scheduleAppointmentReminders(options: AppointmentReminderOptions): Promise<string[]> {
  const { timeLabel } = formatAppointmentDate(options.appointmentDate.toISOString());
  const leads = upcomingReminderLeads(options.appointmentDate, options.remindersMinutesBefore);

  return await Promise.all(
    leads.map((minutes) =>
      scheduleNotificationAsync({
        identifier: reminderId(options.appointmentId, minutes),
        content: {
          title: `Lembrete de consulta · ${options.petName}`,
          body: `${options.serviceType} às ${timeLabel}. Faltam ${leadLabel(minutes)}.`,
          data: toData(options.appointmentId),
          sound: 'notification.wav',
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: new Date(options.appointmentDate.getTime() - minutes * 60 * 1000),
          channelId: CHANNEL_ID,
        },
      })
    )
  );
}

/**
 * Cancela os lembretes de uma consulta (cancelamento ou conclusão), inclusive o lembrete único
 * que versões antigas do app deixaram agendado.
 */
export async function cancelAppointmentReminder(appointmentId: string): Promise<void> {
  const ids = [legacyReminderId(appointmentId), ...DEFAULT_REMINDER_MINUTES.map((m) => reminderId(appointmentId, m))];
  await Promise.all(ids.map((id) => cancelScheduledNotificationAsync(id)));
}

/**
 * Cancela todos os lembretes agendados. Usado ao sair da conta: no mesmo aparelho
 * os lembretes de uma conta não podem chegar para a próxima.
 */
export async function cancelAllReminders(): Promise<void> {
  await cancelAllScheduledNotificationsAsync();
}
