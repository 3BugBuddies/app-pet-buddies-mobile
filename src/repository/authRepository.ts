import * as SecureStore from 'expo-secure-store';
import { apiJava } from './apiClient';
import { LoginFormValues } from '../model/login';
import { RegisterFormValues } from '../model/register';
import { AuthSession } from '../model/session';

const SESSION_KEY = 'SESSION';

// Login e cadastro sempre falam com a API: não há usuário nem token local. O que a tela
// exibe vem de ErrorDto { code, message } da API; sem resposta, o problema é de conexão.
const mensagemDeErro = (err: any, fallback: string): string => {
  if (!err?.response) return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
  return err.response.data?.message || fallback;
};

// A API devolve os ids como número; o app trabalha com ids em string.
const paraSessao = (data: any): AuthSession => ({
  token: data.token,
  usuarioId: String(data.usuarioId),
  nome: data.nome,
  perfil: data.perfil,
  responsavelId: data.responsavelId != null ? String(data.responsavelId) : null,
  veterinarioId: data.veterinarioId != null ? String(data.veterinarioId) : null,
});

const login = async (credenciais: LoginFormValues): Promise<AuthSession> => {
  try {
    const resposta = await apiJava.post('/auth/login', {
      login: credenciais.email.trim(),
      senha: credenciais.senha,
    });
    return paraSessao(resposta.data);
  } catch (err: any) {
    throw new Error(mensagemDeErro(err, 'E-mail ou senha inválidos.'));
  }
};

const register = async (dados: RegisterFormValues): Promise<AuthSession> => {
  try {
    const resposta = await apiJava.post('/auth/registro', {
      tipo: dados.perfil,
      nome: dados.nome,
      email: dados.email.trim(),
      senha: dados.senha,
      telefone: dados.telefone ?? undefined, // obrigatório para TUTOR
      crmv: dados.crmv ?? undefined,         // obrigatório para VET
    });
    return paraSessao(resposta.data);
  } catch (err: any) {
    throw new Error(mensagemDeErro(err, 'Não foi possível concluir o cadastro.'));
  }
};

// A sessão fica no SecureStore (criptografado) e persiste entre fechamentos do app.
const saveSession = async (session: AuthSession): Promise<void> => {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
};

const getSession = async (): Promise<AuthSession | null> => {
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    return raw != null ? JSON.parse(raw) : null;
  } catch (err: any) {
    console.log('Erro ao ler sessão salva: ' + err.message);
    return null;
  }
};

const clearSession = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(SESSION_KEY);
};

export { login, register, saveSession, getSession, clearSession };
