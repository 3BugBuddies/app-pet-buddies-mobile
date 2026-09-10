import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MedicalRecord } from '../model/medicalRecord';

// Enquanto o backend da faculdade nao esta pronto, deixamos USE_API em false.
// Quando o backend estiver no ar, basta trocar para true.
const USE_API = false;

const api = axios.create({
  baseURL: 'http://meubackend/api/registros-atendimento',
});

const RECORDS_KEY = 'MEDICAL_RECORDS';

const initialRecords: MedicalRecord[] = [
  {
    id: 'rec-1',
    animalId: 'pet-luna',
    dataAtendimento: '2026-03-03',
    diagnostico: 'Otite leve no ouvido direito',
    tratamento: 'Limpeza auricular + gotas antibioticas por 7 dias',
    observacao: 'Retorno em 10 dias para reavaliacao.',
  },
  {
    id: 'rec-2',
    animalId: 'pet-luna',
    dataAtendimento: '2026-01-10',
    diagnostico: 'Consulta de rotina',
    tratamento: 'Nenhum tratamento necessario',
  },
];

const saveLocalList = (list: MedicalRecord[]) => {
  AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(list));
};

const loadLocalList = async (): Promise<MedicalRecord[]> => {
  let list: MedicalRecord[] = [];
  try {
    const strList = await AsyncStorage.getItem(RECORDS_KEY);
    if (strList != null) {
      list = JSON.parse(strList);
    } else {
      list = initialRecords;
      saveLocalList(list);
    }
  } catch (err: any) {
    console.log('Erro ao carregar prontuarios: ' + err.message);
  }
  return list;
};

const getRecordsByPetId = async (animalId: string): Promise<MedicalRecord[]> => {
  if (USE_API) {
    try {
      const response = await api.get(`/animais/${animalId}/registros-atendimento`);
      return response.data;
    } catch (err: any) {
      console.log('Erro ao buscar prontuarios na API, usando dados locais: ' + err.message);
      const list = await loadLocalList();
      return list.filter((record) => record.animalId === animalId);
    }
  }
  const list = await loadLocalList();
  return list.filter((record) => record.animalId === animalId);
};

const createRecord = async (record: MedicalRecord): Promise<MedicalRecord> => {
  if (USE_API) {
    try {
      const response = await api.post(`/animais/${record.animalId}/registros-atendimento`, record);
      return response.data;
    } catch (err: any) {
      console.log('Erro ao criar prontuario na API, salvando localmente: ' + err.message);
    }
  }
  const list = await loadLocalList();
  const newList = [record, ...list];
  saveLocalList(newList);
  return record;
};

export { getRecordsByPetId, createRecord };
