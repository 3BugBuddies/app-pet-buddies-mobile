import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { PrescriptionRule } from '../model/prescriptionRule';

// Enquanto o backend da faculdade nao esta pronto, deixamos USE_API em false.
// Quando o backend estiver no ar, basta trocar para true.
const USE_API = false;

const api = axios.create({
  baseURL: 'http://meubackend/api/prescricoes',
});

const RULES_KEY = 'PRESCRIPTION_RULES';

const loadLocalList = async (): Promise<PrescriptionRule[]> => {
  try {
    const strList = await AsyncStorage.getItem(RULES_KEY);
    return strList != null ? JSON.parse(strList) : [];
  } catch (err: any) {
    console.log('Erro ao carregar regras de prescrição: ' + err.message);
    return [];
  }
};

const saveLocalList = (list: PrescriptionRule[]) => {
  AsyncStorage.setItem(RULES_KEY, JSON.stringify(list));
};

const getRulesByPrescriptionId = async (prescricaoId: string): Promise<PrescriptionRule[]> => {
  if (USE_API) {
    try {
      const response = await api.get(`/${prescricaoId}/regras`);
      return response.data;
    } catch (err: any) {
      console.log('Erro ao buscar regras na API, usando dados locais: ' + err.message);
      const list = await loadLocalList();
      return list.filter((regra) => regra.prescricaoId === prescricaoId);
    }
  }
  const list = await loadLocalList();
  return list.filter((regra) => regra.prescricaoId === prescricaoId);
};

const createRule = async (regra: PrescriptionRule): Promise<PrescriptionRule> => {
  if (USE_API) {
    try {
      const response = await api.post(`/${regra.prescricaoId}/regras`, regra);
      return response.data;
    } catch (err: any) {
      console.log('Erro ao criar regra na API, salvando localmente: ' + err.message);
    }
  }
  const list = await loadLocalList();
  const newList = [...list, regra];
  saveLocalList(newList);
  return regra;
};

export { getRulesByPrescriptionId, createRule };
