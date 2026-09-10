import axios from 'axios';
import type { Protocol } from '../model/legacyPrescription';

// Enquanto o backend da faculdade nao esta pronto, deixamos USE_API em false.
// Quando o backend estiver no ar, basta trocar para true.
const USE_API = false;

const api = axios.create({
  baseURL: 'http://meubackend/api/protocolos',
});

// Politica da clinica (T_PB_PROTOCOLO) — o que todo pet de um perfil recebe.
// Cadastro de protocolo e tela de administracao da clinica, fora do escopo
// atual; por enquanto uma lista fixa, como um seed faria.
const PROTOCOLS: Protocol[] = [
  { id: 'proto-lactulona', name: 'Lactulona · constipação', categoryLabel: 'faixa 1–2 ml', doseRangeLabel: '1–2 ml', ruleCount: 4, patientCount: 12 },
  { id: 'proto-prednisolona', name: 'Prednisolona · desmame', categoryLabel: 'faixa 5–20 mg', doseRangeLabel: '5–20 mg', ruleCount: 6, patientCount: 3 },
  { id: 'proto-insulina', name: 'Insulina · ajuste por glicemia', categoryLabel: 'faixa 2–6 UI', doseRangeLabel: '2–6 UI', ruleCount: 8, patientCount: 2 },
  { id: 'proto-peso', name: 'Controle de peso · dieta', categoryLabel: 'sem dose', doseRangeLabel: '—', ruleCount: 3, patientCount: 9 },
];

const getProtocols = async (): Promise<Protocol[]> => {
  if (USE_API) {
    try {
      const response = await api.get('/protocolos');
      return response.data;
    } catch (err: any) {
      console.log('Erro ao buscar protocolos na API, usando dados locais: ' + err.message);
      return PROTOCOLS;
    }
  }
  return PROTOCOLS;
};

export { getProtocols };
