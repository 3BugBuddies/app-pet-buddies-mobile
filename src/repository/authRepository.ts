import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiJava } from './apiClient';
import { LoginFormValues } from '../model/login';
import { RegisterFormValues } from '../model/register';
import { AuthSession } from '../model/session';

const SESSION_KEY = 'SESSION';

const login = async (credenciais: LoginFormValues): Promise<AuthSession> => {
  const resposta = await apiJava.post('/auth/login', credenciais);
  return resposta.data;
};

const register = async (dados: RegisterFormValues): Promise<AuthSession> => {
  const resposta = await apiJava.post('/auth/registro', dados);
  return resposta.data;
};

// AsyncStorage persiste a sessão entre fechamentos do app — nunca substituir por API.
const saveSession = async (session: AuthSession): Promise<void> => {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const getSession = async (): Promise<AuthSession | null> => {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw != null ? JSON.parse(raw) : null;
  } catch (err: any) {
    console.log('Erro ao ler sessão salva: ' + err.message);
    return null;
  }
};

const clearSession = async (): Promise<void> => {
  await AsyncStorage.removeItem(SESSION_KEY);
};

export { login, register, saveSession, getSession, clearSession };
