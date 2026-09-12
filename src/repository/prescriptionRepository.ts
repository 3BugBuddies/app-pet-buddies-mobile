import { apiJava } from './apiClient';
import { Prescription, type NarrativaPrescricaoRequest, type RascunhoPrescricaoResponse } from '../model/prescription';
import { addFakePrescription, getFakePrescriptionsByAnimalId } from './fakeData';

// MANTENHA false para testar a interface.
// Mude para true no dia de gravar o vídeo da FIAP com a API no ar.
const USE_API = false;

const getPrescriptionsByAnimalId = async (animalId: string): Promise<Prescription[]> => {
  if (USE_API) {
    // Filho não é aninhado — é filtro (contrato regra 2)
    const response = await apiJava.get(`/prescricao?animalId=${animalId}`);
    return response.data._embedded?.prescricaoResponseList ?? [];
  }
  return getFakePrescriptionsByAnimalId(animalId);
};

// Prescrição é imutável (T_PB_PRESCRICAO): não existe PUT. "Editar" cria uma nova
// prescrição com materialOrigemId apontando para a original.
const createPrescription = async (prescription: Prescription): Promise<Prescription> => {
  if (USE_API) {
    const response = await apiJava.post('/prescricao', prescription);
    return response.data;
  }
  return addFakePrescription(prescription);
};

// Rota exclusiva para veterinário: envia narrativa e recebe rascunho estruturado pela IA.
// Exige perfil VET (única rota com restrição de perfil — contrato seção 2).
const draftPrescription = async (data: NarrativaPrescricaoRequest): Promise<RascunhoPrescricaoResponse> => {
  if (USE_API) {
    const response = await apiJava.post('/prescricao/rascunho', data);
    return response.data;
  }
  // Mock: estrutura completa do RascunhoPrescricaoResponse do Java
  return {
    narrativaOriginal: data.narrativa,
    extracaoDisponivel: true,
    motivoDegradacao: null,
    prescricao: {
      medicamento: 'Amoxicilina',
      doseMin: 5,
      doseMax: 10,
      unidade: 'mg',
      frequenciaDia: 2,
      duracaoDias: 7,
      orientacao: 'Administrar junto com alimento',
    },
    regrasPropostas: [
      { condicaoClinicaId: 'cond-fezes-moles', rotuloCongelado: 'Fezes moles', acao: 'DOSE_MIN' },
      { condicaoClinicaId: 'cond-vomito', rotuloCongelado: 'Vômito', acao: 'ACIONAR_CLINICA' },
    ],
    condicoesDescartadas: [],
  };
};

export { getPrescriptionsByAnimalId, createPrescription, draftPrescription };
