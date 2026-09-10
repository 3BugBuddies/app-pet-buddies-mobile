import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LoginFormValues } from '../model/login';
import { RegisterFormValues } from '../model/register';
import { AuthSession } from '../model/session';

// Enquanto o backend da faculdade nao esta pronto, deixamos USE_API em false.
// Quando o backend estiver no ar, basta trocar para true.
// O login e emitido pelo servico Java (petbuddies-ai), nao pelo .NET.
const USE_API = false;

const api = axios.create({
  baseURL: 'http://meubackend/api',
});

const SESSION_KEY = 'SESSION';
const USUARIOS_KEY = 'USUARIOS';

interface UsuarioLocal {
  id: string;
  nome: string;
  email: string;
  senha: string;
  perfil: AuthSession['perfil'];
}

// IDs "tutor-1" / "vet-1" (nao "usr-tutor-1"): mesma convencao que o resto do
// dado mock ja usa (FAKE_PETS.ownerId em services/petService.ts, por ex.) —
// sessao precisa bater com esses IDs pra "Meus pets" filtrar por dono certo.
const initialUsuarios: UsuarioLocal[] = [
  { id: 'tutor-1', nome: 'Marina', email: 'tutor@email.com', senha: '123456', perfil: 'TUTOR' },
  { id: 'vet-1', nome: 'Dra. Helena', email: 'vet@email.com', senha: '123456', perfil: 'VET' },
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
      const resposta = await api.post('/login', credenciais);
      return resposta.data;
    } catch (err: any) {
      console.log('Erro ao entrar na API: ' + err.message);
      throw new Error('Não foi possível entrar. Verifique suas credenciais.');
    }
  }
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
  };
};

const register = async (dados: RegisterFormValues): Promise<AuthSession> => {
  if (USE_API) {
    try {
      const resposta = await api.post('/usuarios', dados);
      return resposta.data;
    } catch (err: any) {
      console.log('Erro ao cadastrar na API: ' + err.message);
      throw new Error('Não foi possível concluir o cadastro.');
    }
  }
  const usuarios = await loadLocalUsuarios();
  if (usuarios.some((usuario) => usuario.email === dados.email)) {
    throw new Error('Já existe uma conta com esse e-mail.');
  }
  const novoUsuario: UsuarioLocal = {
    id: `usr-${Date.now()}`,
    nome: dados.nome,
    email: dados.email,
    senha: dados.senha,
    perfil: dados.perfil as AuthSession['perfil'],
  };
  await AsyncStorage.setItem(USUARIOS_KEY, JSON.stringify([...usuarios, novoUsuario]));
  return {
    token: fakeTokenFor(novoUsuario.id),
    usuarioId: novoUsuario.id,
    nome: novoUsuario.nome,
    perfil: novoUsuario.perfil,
  };
};

// Persistencia do token de sessao: sempre AsyncStorage, mesmo com USE_API ligado
// (regra da rubrica), pra sobreviver a fechar e reabrir o app.
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
