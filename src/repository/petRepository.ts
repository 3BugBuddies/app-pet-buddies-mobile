import { apiJava } from './apiClient';
import { Pet, withoutReadOnlyFields } from '../model/pet';


// A API devolve o id como número, mas toda a camada de controle compara com appointment.petId (String).
const toPet = (p: any): Pet => ({ ...p, id: p.id?.toString() ?? '' });

const getAllPets = async (): Promise<Pet[]> => {
  const response = await apiJava.get('/animal');
  const list: any[] = response.data._embedded?.animalResponseList ?? [];
  return list.map(toPet);
};

const getPetById = async (id: string): Promise<Pet | undefined> => {
  const response = await apiJava.get(`/animal/${id}`);
  return toPet(response.data);
};

const getPetsByResponsavelId = async (responsavelId: string): Promise<Pet[]> => {
  // Sem o filtro a API devolve todos os animais (escopo por token ainda não existe no back).
  const response = await apiJava.get('/animal', { params: { responsavelId } });
  const list: any[] = response.data._embedded?.animalResponseList ?? [];
  return list.map(toPet);
};

const createPet = async (pet: Pet): Promise<Pet> => {
  // Omite `id` no POST (gerado pelo banco) e converte responsavelId para número
  const { id: _id, ...body } = withoutReadOnlyFields(pet);
  const payload = { ...body, responsavelId: Number(pet.responsavelId) };
  const response = await apiJava.post('/animal', payload);
  return toPet(response.data);
};

const updatePet = async (pet: Pet): Promise<Pet> => {
  const payload = { ...withoutReadOnlyFields(pet), responsavelId: Number(pet.responsavelId) };
  const response = await apiJava.put(`/animal/${pet.id}`, payload);
  return toPet(response.data);
};

const deletePet = async (id: string): Promise<void> => {
  await apiJava.delete(`/animal/${id}`);
};

export {
  getAllPets,
  getPetById,
  getPetsByResponsavelId,
  createPet,
  updatePet,
  deletePet,
};
