// Visão da clínica sobre o paciente, montada a partir do AnimalResponse.
export interface ClinicPatient {
  petId: string;
  petName: string;
  tutorName?: string;
  endereco?: string;
  telefone?: string;
}

export interface PendingCare {
  id: string;
  name: string;
  targetDate: string;
}

// Resumo do plano ativo do animal (GET /motor/plano/{id}).
export interface PlanSummary {
  category: 'PREVENTIVO' | 'TRATAMENTO' | 'POS_CIRURGICO';
  upcoming: PendingCare[];
  lastDate: string | null;
}
