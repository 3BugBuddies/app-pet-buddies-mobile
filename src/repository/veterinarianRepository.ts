import { apiJava, USE_API } from './apiClient';
import type { Veterinarian } from '../model/veterinarian';

// Veterinários da clínica: o tutor escolhe com quem agendar, já que /janela-atendimento/livres
// exige o veterinarioId.
const getVeterinarians = async (): Promise<Veterinarian[]> => {
  if (USE_API) {
    const response = await apiJava.get('/veterinario');
    const lista: any[] = response.data._embedded?.veterinarioResponseList ?? [];
    return lista
      .filter((v) => v.ativo !== false)
      .map((v) => ({ id: String(v.id), nome: v.nome, crmv: v.crmv ?? '' }));
  }
  return [{ id: 'vet-1', nome: 'Dra. Helena', crmv: 'CRMV-SP 12345' }];
};

export { getVeterinarians };
