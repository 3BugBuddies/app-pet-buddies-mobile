// Visao de adesao do paciente pra clinica (Agenda, Pacientes). Nao existe
// tabela propria no schema — seria agregacao sobre plano/consulta/procedimento
// (ver schema-sprint-3-08.md, secao "Pontos").
export interface ClinicPatient {
  petId: string;
  petName: string;
  tutorName: string;
  endereco?: string;
  telefone?: string;
  weekLabel: string;
  adherencePct: number;
  note: string;
  alert: boolean;
}

