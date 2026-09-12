import { useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/authContext';
import type { Pet } from '../model/pet';
import {
  createPet,
  deletePet,
  getAllPets,
  getPetById,
  getPetProfileDetails,
  getPetsByResponsavelId,
  updatePet,
} from '../repository/petRepository';

const PETS_KEY = ['pets'];

// "Meus pets" do tutor logado — usa responsavelId (vínculo da tabela T_PB_RESPONSAVEL),
// não usuarioId, pois a API Java filtra por /animal?responsavelId=.
export function usePets() {
  const { session } = useContext(AuthContext);
  return useQuery({
    queryKey: [...PETS_KEY, session?.responsavelId],
    queryFn: () => getPetsByResponsavelId(String(session?.responsavelId ?? '')),
    enabled: !!session?.responsavelId,
  });
}

// Todos os pets da clínica, sem filtro por dono — usado pelo lado vet pra
// resolver nome/raça de qualquer paciente (Agenda, Pacientes, Prontuário).
export function useClinicPets() {
  return useQuery({
    queryKey: [...PETS_KEY, 'clinic'],
    queryFn: getAllPets,
  });
}

export function usePet(id: string) {
  return useQuery({
    queryKey: [...PETS_KEY, id],
    queryFn: () => getPetById(id),
    enabled: !!id,
  });
}

export function usePetProfileDetails(petId: string) {
  return useQuery({
    queryKey: ['petProfile', petId],
    queryFn: () => getPetProfileDetails(petId),
    enabled: !!petId,
  });
}

export function useCreatePet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pet: Pet) => createPet(pet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PETS_KEY });
    },
  });
}

export function useUpdatePet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pet: Pet) => updatePet(pet),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: PETS_KEY });
      queryClient.invalidateQueries({ queryKey: [...PETS_KEY, variables.id] });
    },
  });
}

export function useDeletePet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PETS_KEY });
    },
  });
}
