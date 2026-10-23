// Visão da clínica sobre o paciente, montada a partir do AnimalResponse.
export interface ClinicPatient {
  petId: string;
  petName: string;
  tutorName?: string;
  endereco?: string;
  telefone?: string;
}

export interface CuidadoPendente {
  id: string;
  nome: string;
  dataAlvo: string;
}

// Resumo do plano ativo do animal (GET /motor/plano/{id}).
export interface ResumoPlano {
  categoria: 'PREVENTIVO' | 'TRATAMENTO' | 'POS_CIRURGICO';
  proximos: CuidadoPendente[];
  ultimaData: string | null;
}
