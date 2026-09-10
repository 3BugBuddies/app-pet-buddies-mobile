import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const SESSION_KEY = 'SESSION';

const addAuthInterceptor = (instance: ReturnType<typeof axios.create>) => {
  instance.interceptors.request.use(async (config) => {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (raw != null) {
        const session = JSON.parse(raw);
        if (session?.token) {
          config.headers['Authorization'] = `Bearer ${session.token}`;
        }
      }
    } catch {
      // sem token — envia a requisição sem cabeçalho de autenticação
    }
    return config;
  });
};

// Domínio de Registro: consultas, prontuários, prescrições, regras (.NET)
const apiDotNet = axios.create({ baseURL: 'http://10.0.2.2:5297/api' });
addAuthInterceptor(apiDotNet);

// Domínio de Cuidado: auth, plano, check-in, pontuação, badges (Java / Spring HATEOAS)
const apiJava = axios.create({ baseURL: 'http://10.0.2.2:8080/api' });
addAuthInterceptor(apiJava);

export { apiDotNet, apiJava };
