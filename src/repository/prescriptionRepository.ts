import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Prescription } from '../model/prescription';

// Enquanto o backend da faculdade nao esta pronto, deixamos USE_API em false.
// Quando o backend estiver no ar, basta trocar para true.
const USE_API = false;

const api = axios.create({
  baseURL: 'http://meubackend/api/prescricoes',
});

const PRESCRIPTIONS_KEY = 'PRESCRIPTIONS';

const initialPrescriptions: Prescription[] = [
  {
    id: 'presc-1',
    medicamento: 'Amoxicilina',
    doseMin: 10,
    doseMax: 20,
    unidade: 'mg/kg',
    frequenciaDia: 2,
    duracaoDias: 7,
    dataInicio: '2026-03-03',
    orientacao: 'Administrar junto com a refeição.',
    animalId: 'pet-luna',
    veterinarioId: 'vet-1',
    registroAtendimentoId: 'rec-1',
  },
];

const saveLocalList = (list: Prescription[]) => {
  AsyncStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(list));
};

const loadLocalList = async (): Promise<Prescription[]> => {
  let list: Prescription[] = [];
  try {
    const strList = await AsyncStorage.getItem(PRESCRIPTIONS_KEY);
    if (strList != null) {
      list = JSON.parse(strList);
    } else {
      list = initialPrescriptions;
      saveLocalList(list);
    }
  } catch (err: any) {
    console.log('Erro ao carregar prescrições: ' + err.message);
  }
  return list;
};

const getPrescriptionsByAnimalId = async (animalId: string): Promise<Prescription[]> => {
  if (USE_API) {
    try {
      const response = await api.get(`/animais/${animalId}/prescricoes`);
      return response.data;
    } catch (err: any) {
      console.log('Erro ao buscar prescrições na API, usando dados locais: ' + err.message);
      const list = await loadLocalList();
      return list.filter((prescription) => prescription.animalId === animalId);
    }
  }
  const list = await loadLocalList();
  return list.filter((prescription) => prescription.animalId === animalId);
};

// Prescricao e imutavel (T_PB_PRESCRICAO no schema-sprint-3-08.md): nao existe
// updatePrescription de proposito, "editar" uma prescricao cria uma nova, ligada
// a anterior via materialOrigemId/versaoOrigem.
const createPrescription = async (prescription: Prescription): Promise<Prescription> => {
  if (USE_API) {
    try {
      const response = await api.post(`/animais/${prescription.animalId}/prescricoes`, prescription);
      return response.data;
    } catch (err: any) {
      console.log('Erro ao criar prescrição na API, salvando localmente: ' + err.message);
    }
  }
  const list = await loadLocalList();
  const newList = [prescription, ...list];
  saveLocalList(newList);
  return prescription;
};

export { getPrescriptionsByAnimalId, createPrescription };
