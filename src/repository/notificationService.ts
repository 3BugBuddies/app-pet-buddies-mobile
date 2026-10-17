import { Platform } from 'react-native';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import { AppointmentReminderOptions } from '../model/notification';

// Configura para exibir banner e som mesmo com o app em primeiro plano
setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Inicializa permissões e canal do Android para notificações locais
 */
export async function initNotifications(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      try {
        await setNotificationChannelAsync('default', {
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
 * TESTE 1: Dispara uma notificação local imediatamente
 */
export async function sendImmediateNotification(
  title = '🐾 Pet Buddies',
  body = 'Esta é uma notificação de teste imediata!'
): Promise<string> {
  return await scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'notification.wav',
    },
    trigger: null,
  });
}

/**
 * TESTE 2: Dispara uma notificação local após X segundos
 */
export async function scheduleNotification(
  title = '🐾 Pet Buddies',
  body = 'Notificação agendada recebida com sucesso!',
  seconds = 5
): Promise<string> {
  return await scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'notification.wav',
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.round(seconds)),
    },
  });
}

/**
 * Agenda lembrete de consulta veterinária
 */
export async function scheduleAppointmentReminder(
  options: AppointmentReminderOptions
): Promise<string> {
  const minutesBefore = options.reminderMinutesBefore ?? 60;
  const triggerDate = new Date(options.appointmentDate.getTime() - minutesBefore * 60 * 1000);
  const diffInSeconds = (triggerDate.getTime() - Date.now()) / 1000;

  const timeFormatted = options.appointmentDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const title = `📅 Lembrete de Consulta: ${options.petName}`;
  const body = `Faltam ${minutesBefore}min para a consulta de ${options.serviceType} de ${options.petName} (às ${timeFormatted}).`;

  if (diffInSeconds <= 0) {
    return await sendImmediateNotification(title, body);
  }

  return await scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'notification.wav',
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}
