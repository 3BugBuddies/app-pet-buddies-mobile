import { apiJava } from './apiClient';
import type { ClinicPatient } from '../model/patient';

// Agregação de adesão da clínica — derivada de plano/consulta no Java.
const getClinicPatients = async (): Promise<ClinicPatient[]> => {
  const response = await apiJava.get('/pacientes-clinica');
  // Spring HATEOAS: o array pode vir em _embedded
  return response.data._embedded?.clinicPatientList
    ?? response.data._embedded?.clinicPatients
    ?? response.data;
};

export { getClinicPatients };
