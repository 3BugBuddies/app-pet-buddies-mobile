import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';

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

// Todos os recursos do app vão para a API Java (Spring HATEOAS)
// .NET é back-office da clínica e não é chamado diretamente pelo app
const apiJava = axios.create({
  baseURL: 'http://petbuddies-java-rm563925.eastus.azurecontainer.io:8080/api',
});
addAuthInterceptor(apiJava);

// Se o Java devolver 401, o token expirou: limpa a sessão e avisa o usuário.
// O AuthContext vai detectar a sessão nula no próximo render e redirecionar ao Login.
apiJava.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(SESSION_KEY);
      Alert.alert('Sessão expirada', 'Faça login novamente para continuar.');
    }
    return Promise.reject(error);
  }
);

export { apiJava };
