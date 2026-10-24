// Campos baseados em T_PB_CONSULTA.
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
  // Status do back sem o colapso de mapStatus (NAO_COMPARECEU e CANCELADA viram CANCELED).
  backendStatus?: string;
  animalNome?: string | null;
  veterinarioNome?: string | null;
}

export interface CreateAppointmentInput {
  petId: string;
  date: string;   // ISO datetime: YYYY-MM-DDTHH:MM:SS
  reason: string;
  janelaId: number; // obrigatório no backend — id da janela de atendimento do vet
}
