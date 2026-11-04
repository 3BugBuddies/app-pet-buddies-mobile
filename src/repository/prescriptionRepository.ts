import { apiJava } from './apiClient';
import { Prescription, type NarrativaPrescricaoRequest, type RascunhoPrescricaoResponse } from '../model/prescription';


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
  // Filho não é aninhado — é filtro
  const response = await apiJava.get(`/prescricao?animalId=${animalId}`);
  const list = response.data._embedded?.prescricaoResponseList ?? [];
  return list.map(mapPrescription);
};

const createPrescription = async (prescription: Prescription): Promise<Prescription> => {
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
};

// Rota exclusiva para veterinário: envia narrativa e recebe rascunho estruturado pela IA.
// Exige perfil VET. O fechamento é único, então não há registro gravado: vai só o animalId.
const draftPrescription = async (data: NarrativaPrescricaoRequest): Promise<RascunhoPrescricaoResponse> => {
  const payload = {
    ...data,
    animalId: Number(data.animalId),
    registroAtendimentoId: data.registroAtendimentoId ? Number(data.registroAtendimentoId) : undefined,
  };
  const response = await apiJava.post('/prescricao/rascunho', payload);
  return response.data;
};

export { getPrescriptionsByAnimalId, createPrescription, draftPrescription };
