import { useState, useEffect, useCallback } from 'react';
import {
  initNotifications,
  sendImmediateNotification,
  scheduleNotification,
  scheduleAppointmentReminder,
} from '../repository/notificationService';
import { AppointmentReminderOptions } from '../model/notification';

export function useNotificationsControl() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    initNotifications().then((granted) => {
      setHasPermission(granted);
    });
  }, []);

  const triggerImmediate = useCallback(async (title?: string, body?: string) => {
    return await sendImmediateNotification(title, body);
  }, []);

  const triggerScheduled = useCallback(async (seconds = 5, title?: string, body?: string) => {
    return await scheduleNotification(title, body, seconds);
  }, []);

  const scheduleAppointment = useCallback(async (options: AppointmentReminderOptions) => {
    return await scheduleAppointmentReminder(options);
  }, []);

  return {
    hasPermission,
    triggerImmediate,
    triggerScheduled,
    scheduleAppointment,
  };
}
