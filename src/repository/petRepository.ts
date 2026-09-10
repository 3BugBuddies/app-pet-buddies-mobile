import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Pet } from '../model/pet';
import type { PetProfileDetails } from '../model/care';

// Enquanto o backend da faculdade nao esta pronto, deixamos USE_API em false.
// Quando o backend estiver no ar, basta trocar para true.
const USE_API = false;

const api = axios.create({
  baseURL: 'http://meubackend/api/animais',
});

const PETS_KEY = 'PETS';

const initialPets: Pet[] = [
  { id: 'pet-luna', nome: 'Luna', especie: 'CACHORRO', raca: 'Border collie', porte: 'MEDIO', sexo: 'FEMEA', dataNascimento: '2023-04-10', peso: 14.2, condicaoCronica: false, castrado: true, responsavelId: 'tutor-1' },
  { id: 'pet-thor', nome: 'Thor', especie: 'CACHORRO', raca: 'Labrador', porte: 'GRANDE', sexo: 'MACHO', dataNascimento: '2022-02-15', peso: 32.5, condicaoCronica: false, castrado: false, responsavelId: 'tutor-2' },
  { id: 'pet-mel', nome: 'Mel', especie: 'CACHORRO', raca: 'Poodle', porte: 'PEQUENO', sexo: 'FEMEA', dataNascimento: '2021-11-03', peso: 6.8, condicaoCronica: true, castrado: true, responsavelId: 'tutor-3' },
  { id: 'pet-bento', nome: 'Bento', especie: 'CACHORRO', raca: 'Vira-lata', porte: 'MEDIO', sexo: 'MACHO', dataNascimento: '2024-06-20', peso: 18.0, condicaoCronica: false, castrado: false, responsavelId: 'tutor-4' },
  { id: 'pet-nina', nome: 'Nina', especie: 'GATO', raca: 'Siames', porte: 'PEQUENO', sexo: 'FEMEA', dataNascimento: '2023-01-10', peso: 4.1, condicaoCronica: false, castrado: true, responsavelId: 'tutor-5' },
  { id: 'pet-pipoca', nome: 'Pipoca', especie: 'GATO', raca: 'SRD', porte: 'PEQUENO', sexo: 'FEMEA', dataNascimento: '2020-09-05', peso: 3.9, condicaoCronica: true, castrado: true, responsavelId: 'tutor-6' },
];

const saveLocalList = (list: Pet[]) => {
  AsyncStorage.setItem(PETS_KEY, JSON.stringify(list));
};

const loadLocalList = async (): Promise<Pet[]> => {
  let list: Pet[] = [];
  try {
    const strList = await AsyncStorage.getItem(PETS_KEY);
    if (strList != null) {
      list = JSON.parse(strList);
    } else {
      list = initialPets;
      saveLocalList(list);
    }
  } catch (err: any) {
    console.log('Erro ao carregar pets: ' + err.message);
  }
  return list;
};

const getAllPets = async (): Promise<Pet[]> => {
  if (USE_API) {
    try {
      const response = await api.get('/animais');
      return response.data;
    } catch (err: any) {
      console.log('Erro ao buscar pets na API, usando dados locais: ' + err.message);
      return await loadLocalList();
    }
  }
  return await loadLocalList();
};

const getPetById = async (id: string): Promise<Pet | undefined> => {
  const list = await getAllPets();
  return list.find((pet) => pet.id === id);
};

const getPetsByResponsavelId = async (responsavelId: string): Promise<Pet[]> => {
  const list = await getAllPets();
  return list.filter((pet) => pet.responsavelId === responsavelId);
};

const createPet = async (pet: Pet): Promise<Pet> => {
  if (USE_API) {
    try {
      const response = await api.post('/animais', pet);
      return response.data;
    } catch (err: any) {
      console.log('Erro ao criar pet na API, salvando localmente: ' + err.message);
    }
  }
  const list = await loadLocalList();
  const newList = [...list, pet];
  saveLocalList(newList);
  return pet;
};

const updatePet = async (pet: Pet): Promise<Pet> => {
  if (USE_API) {
    try {
      const response = await api.put(`/animais/${pet.id}`, pet);
      return response.data;
    } catch (err: any) {
      console.log('Erro ao atualizar pet na API, atualizando localmente: ' + err.message);
    }
  }
  const list = await loadLocalList();
  const newList = list.map((item) => (item.id === pet.id ? pet : item));
  saveLocalList(newList);
  return pet;
};

const deletePet = async (id: string): Promise<void> => {
  if (USE_API) {
    try {
      await api.delete(`/animais/${id}`);
      return;
    } catch (err: any) {
      console.log('Erro ao apagar pet na API, apagando localmente: ' + err.message);
    }
  }
  const list = await loadLocalList();
  const newList = list.filter((item) => item.id !== id);
  saveLocalList(newList);
};

// Perfil clinico do pet (vacinas, alergia, orientacao em casa) — visao derivada
// pra tela, nao e coluna direta de T_PB_ANIMAL. Ainda mockado por pet.
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
