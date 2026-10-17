import { apiJava, USE_API } from './apiClient';
import { Pet } from '../model/pet';
import type { PetProfileDetails } from '../model/care';
import { FAKE_PETS } from './fakeData';


const getAllPets = async (): Promise<Pet[]> => {
  if (USE_API) {
    const response = await apiJava.get('/animal');
    const list: any[] = response.data._embedded?.animalResponseList ?? [];
    // mas toda a camada de controle compara com appointment.petId (String)
    return list.map((p) => ({ ...p, id: p.id?.toString() ?? '' }));
  }
  return FAKE_PETS;
};

const getPetById = async (id: string): Promise<Pet | undefined> => {
  if (USE_API) {
    const response = await apiJava.get(`/animal/${id}`);
    return { ...response.data, id: response.data.id?.toString() ?? '' };
  }
  return FAKE_PETS.find((p) => p.id === id);
};

const getPetsByResponsavelId = async (responsavelId: string): Promise<Pet[]> => {
  if (USE_API) {
    // Sem o filtro a API devolve todos os animais (escopo por token ainda não existe no back).
    const response = await apiJava.get('/animal', { params: { responsavelId } });
    const list: any[] = response.data._embedded?.animalResponseList ?? [];
    return list.map((p) => ({ ...p, id: p.id?.toString() ?? '' }));
  }
  return FAKE_PETS.filter((pet) => pet.responsavelId === responsavelId);
};

const createPet = async (pet: Pet): Promise<Pet> => {
  if (USE_API) {
    // Omite `id` no POST (gerado pelo banco) e converte responsavelId para número
    const { id: _id, ...body } = pet;
    const payload = { ...body, responsavelId: Number(pet.responsavelId) };
    const response = await apiJava.post('/animal', payload);
    return { ...response.data, id: response.data.id?.toString() ?? '' };
  }
  return pet;
};

const updatePet = async (pet: Pet): Promise<Pet> => {
  if (USE_API) {
    const payload = { ...pet, responsavelId: Number(pet.responsavelId) };
    const response = await apiJava.put(`/animal/${pet.id}`, payload);
    return { ...response.data, id: response.data.id?.toString() ?? '' };
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
    ageLabel: '11 anos',
    weightLabel: '10 kg',
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
