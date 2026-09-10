import { apiDotNet } from './apiClient';
import { Pet } from '../model/pet';
import type { PetProfileDetails } from '../model/care';

const getAllPets = async (): Promise<Pet[]> => {
  const response = await apiDotNet.get('/animais');
  return response.data;
};

const getPetById = async (id: string): Promise<Pet | undefined> => {
  const response = await apiDotNet.get(`/animais/${id}`);
  return response.data;
};

const getPetsByResponsavelId = async (responsavelId: string): Promise<Pet[]> => {
  const all = await getAllPets();
  return all.filter((pet) => pet.responsavelId === responsavelId);
};

const createPet = async (pet: Pet): Promise<Pet> => {
  const response = await apiDotNet.post('/animais', pet);
  return response.data;
};

const updatePet = async (pet: Pet): Promise<Pet> => {
  const response = await apiDotNet.put(`/animais/${pet.id}`, pet);
  return response.data;
};

const deletePet = async (id: string): Promise<void> => {
  await apiDotNet.delete(`/animais/${id}`);
};

// Perfil clínico derivado (vacinas, alergias, orientação em casa) — ainda não tem
// endpoint próprio no backend; mantido como dado local até a API expor essa visão.
const FAKE_PROFILES: Record<string, PetProfileDetails> = {
  'pet-luna': {
    petId: 'pet-luna',
    ageLabel: '3 anos',
    weightLabel: '18 kg',
    neuteredLabel: 'Sim',
    sexLabel: 'fêmea',
    planStatusLabel: 'Plano em dia',
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
    throw new Error('Perfil não encontrado');
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
