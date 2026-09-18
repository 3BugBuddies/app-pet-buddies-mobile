import { apiJava } from './apiClient';
import { Prescription, type NarrativaPrescricaoRequest, type RascunhoPrescricaoResponse } from '../model/prescription';
import { addFakePrescription, getFakePrescriptionsByAnimalId } from './fakeData';

// MANTENHA false para testar a interface.
// Mude para true no dia de gravar o vídeo da FIAP com a API no ar.
const USE_API = true;

// Normaliza um item da lista do backend para o tipo interno Prescription
function mapPrescription(p: any): Prescription {
  return {
    id: p.id?.toString() ?? null,
    medicamento: p.medicamento,
    doseMin: p.doseMin,
    doseMax: p.doseMax,
    unidade: p.unidade,
    frequenciaDia: p.frequenciaDia,
    duracaoDias: p.duracaoDias,
    dataInicio: p.dataInicio?.slice(0, 10) ?? p.dataInicio, // backend devolve "AAAA-MM-DD"
    orientacao: p.orientacao ?? null,
    materialOrigemId: p.materialOrigemId?.toString() ?? null,
    versaoOrigem: p.versaoOrigem ?? null,
    animalId: p.animalId?.toString() ?? '',
    veterinarioId: p.veterinarioId?.toString() ?? '',
    registroAtendimentoId: p.registroAtendimentoId?.toString() ?? null,
  };
}

const getPrescriptionsByAnimalId = async (animalId: string): Promise<Prescription[]> => {
  if (USE_API) {
    // Filho não é aninhado — é filtro (contrato regra 2)
    const response = await apiJava.get(`/prescricao?animalId=${animalId}`);
    const list = response.data._embedded?.prescricaoResponseList ?? [];
    return list.map(mapPrescription);
  }
  return getFakePrescriptionsByAnimalId(animalId);
};

const createPrescription = async (prescription: Prescription): Promise<Prescription> => {
  if (USE_API) {
    // Backend exige wrapper: { "prescricoes": [...] }
    const payload = {
      medicamento: prescription.medicamento,
      doseMin: prescription.doseMin,
      doseMax: prescription.doseMax,
      unidade: prescription.unidade,
      frequenciaDia: prescription.frequenciaDia,
      duracaoDias: prescription.duracaoDias,
      dataInicio: prescription.dataInicio,
      orientacao: prescription.orientacao ?? undefined,
      animalId: Number(prescription.animalId),
      veterinarioId: Number(prescription.veterinarioId),
      registroAtendimentoId: prescription.registroAtendimentoId && !isNaN(Number(prescription.registroAtendimentoId))
        ? Number(prescription.registroAtendimentoId)
        : undefined,
    };
    // Retorna lista HATEOAS — pega o primeiro item criado
    const response = await apiJava.post('/prescricao', { prescricoes: [payload] });
    const list = response.data._embedded?.prescricaoResponseList ?? [];
    return list.length > 0 ? mapPrescription(list[0]) : prescription;
  }
  return addFakePrescription(prescription);
};

// Rota exclusiva para veterinário: envia narrativa e recebe rascunho estruturado pela IA.
// Exige perfil VET (única rota com restrição de perfil — contrato seção 2).
const draftPrescription = async (data: NarrativaPrescricaoRequest): Promise<RascunhoPrescricaoResponse> => {
  if (USE_API) {
    const payload = {
      ...data,
      animalId: Number(data.animalId),
      registroAtendimentoId: data.registroAtendimentoId ? Number(data.registroAtendimentoId) : undefined,
    };
    console.log('[draftPrescription] POST /prescricao/rascunho payload:', JSON.stringify(payload, null, 2));
    try {
      const response = await apiJava.post('/prescricao/rascunho', payload);
      console.log('[draftPrescription] Response data:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (err: any) {
      console.error('[draftPrescription] Error:', err?.response?.status, JSON.stringify(err?.response?.data, null, 2));
      throw err;
    }
  }
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
      { condicaoClinicaId: 1, rotuloCongelado: 'Fezes moles', acao: 'DOSE_MIN' },
      { condicaoClinicaId: 2, rotuloCongelado: 'Vômito', acao: 'ACIONAR_CLINICA' },
    ],
    condicoesDescartadas: [],
  };
};

export { getPrescriptionsByAnimalId, createPrescription, draftPrescription };
