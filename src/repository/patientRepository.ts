import { apiJava } from './apiClient';
import type { ClinicPatient } from '../model/patient';
import { FAKE_CLINIC_PATIENTS } from './fakeData';

// MANTENHA false para testar a interface.
// Mude para true no dia de gravar o vídeo da FIAP com a API no ar.
const USE_API = true;

// Agregação de adesão da clínica — derivada de plano/consulta no Java.
const getClinicPatients = async (): Promise<ClinicPatient[]> => {
  if (USE_API) {
    // Não existe /pacientes-clinica — a lista de animais da clínica vem de /animal
    // Spring HATEOAS: coleção vazia não traz _embedded (contrato seção 5)
    const response = await apiJava.get('/animal');
    return response.data._embedded?.animalResponseList ?? [];
  }
  return FAKE_CLINIC_PATIENTS;
};

export { getClinicPatients };
