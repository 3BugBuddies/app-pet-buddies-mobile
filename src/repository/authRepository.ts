import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiJava } from './apiClient';
import { LoginFormValues } from '../model/login';
import { RegisterFormValues } from '../model/register';
import { AuthSession } from '../model/session';

// MANTENHA false para testar a interface. 
// Mude para true no dia de gravar o vídeo da FIAP com a API no ar.
const USE_API = true;

const SESSION_KEY = 'SESSION';
const USUARIOS_KEY = 'USUARIOS';

interface UsuarioLocal {
  id: string;
  nome: string;
  email: string;
  senha: string;
  perfil: AuthSession['perfil'];
  responsavelId?: string | null;
  veterinarioId?: string | null;
}

// Estes são os usuários falsos que permitem o login no emulador
const initialUsuarios: UsuarioLocal[] = [
  { id: 'tutor-1', nome: 'Marina', email: 'tutor@email.com', senha: '123456', perfil: 'TUTOR', responsavelId: 'tutor-1', veterinarioId: null },
  { id: 'vet-1', nome: 'Dra. Helena', email: 'vet@email.com', senha: '123456', perfil: 'VET', responsavelId: null, veterinarioId: 'vet-1' },
];

const loadLocalUsuarios = async (): Promise<UsuarioLocal[]> => {
  try {
    const strList = await AsyncStorage.getItem(USUARIOS_KEY);
    if (strList != null) {
      return JSON.parse(strList);
    }
    await AsyncStorage.setItem(USUARIOS_KEY, JSON.stringify(initialUsuarios));
    return initialUsuarios;
  } catch (err: any) {
    console.log('Erro ao carregar usuários locais: ' + err.message);
    return initialUsuarios;
  }
};

const fakeTokenFor = (usuarioId: string): string => `local-token.${usuarioId}`;

const login = async (credenciais: LoginFormValues): Promise<AuthSession> => {
  if (USE_API) {
    try {
      const resposta = await apiJava.post('/auth/login', credenciais);
      return resposta.data;
    } catch (err: any) {
      console.log('Erro ao entrar na API: ' + err.message);
      throw new Error('Não foi possível entrar. Verifique suas credenciais.');
    }
  }

  // Fallback (Mock)
  const usuarios = await loadLocalUsuarios();
  const encontrado = usuarios.find(
    (usuario) => usuario.email === credenciais.email && usuario.senha === credenciais.senha
  );

  if (!encontrado) {
    throw new Error('E-mail ou senha inválidos.');
  }

  return {
    token: fakeTokenFor(encontrado.id),
    usuarioId: encontrado.id,
    nome: encontrado.nome,
    perfil: encontrado.perfil,
    responsavelId: encontrado.responsavelId ?? null,
    veterinarioId: encontrado.veterinarioId ?? null,
  };
};

const register = async (dados: RegisterFormValues): Promise<AuthSession> => {
  if (USE_API) {
    try {
      // Java espera "tipo" em vez de "perfil" (contrato seção 4)
      const payload = {
        tipo: dados.perfil,
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha,
        telefone: dados.telefone ?? undefined, // obrigatório para TUTOR
        crmv: dados.crmv ?? undefined,         // obrigatório para VET
      };
      const resposta = await apiJava.post('/auth/registro', payload);
      return resposta.data;
    } catch (err: any) {
      console.log('Erro ao cadastrar na API: ' + err.message);
      throw new Error('Não foi possível concluir o cadastro.');
    }
  }

  // Fallback (Mock)
  const usuarios = await loadLocalUsuarios();
  if (usuarios.some((usuario) => usuario.email === dados.email)) {
    throw new Error('Já existe uma conta com esse e-mail.');
  }

  const novoId = `usr-${Date.now()}`;
  const novoUsuario: UsuarioLocal = {
    id: novoId,
    nome: dados.nome,
    email: dados.email,
    senha: dados.senha,
    perfil: dados.perfil as AuthSession['perfil'],
    responsavelId: dados.perfil === 'TUTOR' ? novoId : null,
    veterinarioId: dados.perfil === 'VET' ? novoId : null,
  };

  await AsyncStorage.setItem(USUARIOS_KEY, JSON.stringify([...usuarios, novoUsuario]));

  return {
    token: fakeTokenFor(novoUsuario.id),
    usuarioId: novoUsuario.id,
    nome: novoUsuario.nome,
    perfil: novoUsuario.perfil,
    responsavelId: novoUsuario.responsavelId ?? null,
    veterinarioId: novoUsuario.veterinarioId ?? null,
  };
};

// AsyncStorage persiste a sessão entre fechamentos do app - nunca substituir por API.
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