import { apiJava } from './apiClient';
import type { ClinicPatient } from '../model/patient';
import { FAKE_CLINIC_PATIENTS } from './fakeData';

// MANTENHA false para testar a interface.
// Mude para true no dia de gravar o vídeo da FIAP com a API no ar.
const USE_API = true;

const getClinicPatients = async (): Promise<ClinicPatient[]> => {
  if (USE_API) {
    try {
      const response = await apiJava.get('/animal');
      const apiList = response.data._embedded?.animalResponseList ?? [];
      
      // para manter o botão do Waze/Maps e a UI visíveis durante os testes, 
      return apiList.map((p: any) => ({
        petId: p.id?.toString(),
        petName: p.nome,
        tutorName: 'Marina (Mock)',
        endereco: 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP',
        telefone: '(11) 98765-4321',
        weekLabel: 'Semana 12 / 24',
        adherencePct: 96,
        note: 'Mock: Dados injetados localmente',
        alert: false,
      }));
    } catch (e) {
      return FAKE_CLINIC_PATIENTS;
    }
  }
  return FAKE_CLINIC_PATIENTS;
};

export { getClinicPatients };
