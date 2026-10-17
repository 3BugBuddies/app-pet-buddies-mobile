export interface NotificationPayload {
  title: string;
  body: string;
}

export interface AppointmentReminderOptions {
  petName: string;
  serviceType: string; // Ex: "Vacinação", "Consulta Clínica", "Banho e Tosa"
  appointmentDate: Date; // Data e hora da consulta
  reminderMinutesBefore?: number; // Ex: 60 minutos antes (padrão 60 min)
}
