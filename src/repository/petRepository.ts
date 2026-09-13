import { apiJava } from './apiClient';
import { Pet } from '../model/pet';
import type { PetProfileDetails } from '../model/care';
import { FAKE_PETS } from './fakeData';

// MANTENHA false para testar a interface.
// Mude para true no dia de gravar o vídeo da FIAP com a API no ar.
const USE_API = true;

const getAllPets = async (): Promise<Pet[]> => {
  if (USE_API) {
    const response = await apiJava.get('/animal');
    // HATEOAS: coleção vazia não traz _embedded (contrato seção 5)
    return response.data._embedded?.animalResponseList ?? [];
  }
  return FAKE_PETS;
};

const getPetById = async (id: string): Promise<Pet | undefined> => {
  if (USE_API) {
    const response = await apiJava.get(`/animal/${id}`);
    return response.data;
  }
  return FAKE_PETS.find((p) => p.id === id);
};

const getPetsByResponsavelId = async (responsavelId: string): Promise<Pet[]> => {
  if (USE_API) {
    const response = await apiJava.get(`/animal?responsavelId=${responsavelId}`);
    return response.data._embedded?.animalResponseList ?? [];
  }
  return FAKE_PETS.filter((pet) => pet.responsavelId === responsavelId);
};

const createPet = async (pet: Pet): Promise<Pet> => {
  if (USE_API) {
    const response = await apiJava.post('/animal', pet);
    return response.data;
  }
  return pet;
};

const updatePet = async (pet: Pet): Promise<Pet> => {
  if (USE_API) {
    const response = await apiJava.put(`/animal/${pet.id}`, pet);
    return response.data;
  }
  return pet;
};

const deletePet = async (id: string): Promise<void> => {
  if (USE_API) {
    await apiJava.delete(`/animal/${id}`);
  }
};

// Perfil clínico derivado (vacinas, alergias, orientação em casa) — ainda não tem
// endpoint próprio no backend; mantido como dado local até a API expor essa visão.
const FAKE_PROFILES: Record<string, PetProfileDetails> = {
  'pet-luna': {
    petId: 'pet-luna',
    ageLabel: '3 anos',
    weightLabel: '17,2 kg',
    neuteredLabel: 'Sim',
    sexLabel: 'Fêmea',
    planStatusLabel: 'Plano ativo · sem. 12/24',
    allergy: 'Frango',
    homeInstruction: 'Ração light, 2×/dia',
    vaccines: [
      { id: 'v10', name: 'V10 · reforço', dateLabel: '12 set 2026 · agendada', status: 'SCHEDULED' },
      { id: 'antirrabica', name: 'Antirrábica', dateLabel: '3 mar 2026 · aplicada', status: 'APPLIED' },
      { id: 'gripe-canina', name: 'Gripe canina', dateLabel: '10 jan 2026 · aplicada', status: 'APPLIED' },
    ],
  },
};

const getPetProfileDetails = async (petId: string): Promise<PetProfileDetails> => {
  const profile = FAKE_PROFILES[petId];
  if (!profile) {
    return {
      petId,
      ageLabel: 'Idade não informada',
      weightLabel: 'Peso não informado',
      neuteredLabel: 'Não informado',
      sexLabel: 'Não informado',
      planStatusLabel: 'Aguardando plano',
      homeInstruction: 'Nenhuma orientação registrada ainda.',
      vaccines: [],
    };
  }
  return profile;
};

export {
  getAllPets,
  getPetById,
  getPetsByResponsavelId,
  createPet,
  updatePet,
  deletePet,
  getPetProfileDetails,
};
