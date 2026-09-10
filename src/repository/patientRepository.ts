import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import type { ClinicPatient } from '../model/patient';

// Enquanto o backend da faculdade nao esta pronto, deixamos USE_API em false.
// Quando o backend estiver no ar, basta trocar para true.
const USE_API = false;

const api = axios.create({
  baseURL: 'http://meubackend/api/pacientes',
});

const PATIENTS_KEY = 'CLINIC_PATIENTS';

// Visao de adesao da clinica (Agenda, Pacientes) — nao existe tabela propria;
// no schema real seria agregacao sobre plano/consulta/procedimento.
const initialPatients: ClinicPatient[] = [
  { petId: 'pet-thor', petName: 'Thor', tutorName: 'Rafael', weekLabel: 'sem. 6', adherencePct: 52, note: 'medicação sem marcar há 4 dias', alert: true },
  { petId: 'pet-nina', petName: 'Nina', tutorName: 'Paula', weekLabel: 'sem. 3', adherencePct: 40, note: 'passeios abaixo da meta', alert: true },
  { petId: 'pet-pipoca', petName: 'Pipoca', tutorName: 'Jorge', weekLabel: 'sem. 18', adherencePct: 61, note: 'sem registro há 6 dias', alert: true },
  { petId: 'pet-luna', petName: 'Luna', tutorName: 'Marina', weekLabel: 'sem. 12', adherencePct: 96, note: 'em dia · consulta hoje 10:30', alert: false },
  { petId: 'pet-mel', petName: 'Mel', tutorName: 'Cláudia', weekLabel: 'sem. 24', adherencePct: 100, note: 'plano concluído · renovar', alert: false },
];

const loadLocalList = async (): Promise<ClinicPatient[]> => {
  try {
    const strList = await AsyncStorage.getItem(PATIENTS_KEY);
    if (strList != null) return JSON.parse(strList);
    await AsyncStorage.setItem(PATIENTS_KEY, JSON.stringify(initialPatients));
    return initialPatients;
  } catch (err: any) {
    console.log('Erro ao carregar pacientes: ' + err.message);
    return initialPatients;
  }
};

const getClinicPatients = async (): Promise<ClinicPatient[]> => {
  if (USE_API) {
    try {
      const response = await api.get('/pacientes');
      return response.data;
    } catch (err: any) {
      console.log('Erro ao buscar pacientes na API, usando dados locais: ' + err.message);
      return await loadLocalList();
    }
  }
  return await loadLocalList();
};

export { getClinicPatients };
