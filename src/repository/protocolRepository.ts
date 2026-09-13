import type { Protocol } from '../model/legacyPrescription';
import { FAKE_PROTOCOLS } from './fakeData';

// Protocolos estão no .NET (back-office da clínica) e não podem ser consumidos
// diretamente pelo app (contrato seção 3 e seção 8). Retorna apenas dados locais.
const getProtocols = async (): Promise<Protocol[]> => {
  return FAKE_PROTOCOLS;
};

export { getProtocols };
