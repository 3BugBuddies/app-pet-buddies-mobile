import { apiJava } from './apiClient';
import type { Protocol } from '../model/legacyPrescription';

const getProtocols = async (): Promise<Protocol[]> => {
  const response = await apiJava.get('/protocolos');
  // Spring HATEOAS — o array real está em _embedded; nome depende do entity Java
  return response.data._embedded?.protocolList ?? response.data._embedded?.protocols ?? [];
};

export { getProtocols };
