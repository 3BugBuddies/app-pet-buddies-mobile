// Campos baseados em T_PB_CONSULTA (schema-sprint-3-08.md).
// Status do backend: AGENDADA | CONFIRMADA | REALIZADA | CANCELADA | NAO_COMPARECEU
// Tipo do backend:   ROTINA | VACINACAO | EXAME | RETORNO | EMERGENCIA
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED';

export interface Appointment {
  id: string;
  petId: string;
  vetId: string;
  date: string;
  reason: string;
  status: AppointmentStatus;
}

export interface CreateAppointmentInput {
  petId: string;
  date: string;   // ISO datetime: YYYY-MM-DDTHH:MM:SS
  reason: string;
  janelaId: number; // obrigatório no backend — id da janela de atendimento do vet
}
