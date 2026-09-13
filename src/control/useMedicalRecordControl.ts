import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MedicalRecord, medicalRecordSchema } from '../model/medicalRecord';
import { createRecord, getRecordsByPetId } from '../repository/medicalRecordRepository';
import { usePet, useUpdatePet } from './usePetsControl';

const registrosQueryKey = (animalId: string) => ['prontuario', 'registros', animalId];

interface MedicalRecordControl {
  registros: MedicalRecord[] | undefined;
  carregandoRegistros: boolean;
  anamnese: string;
  setAnamnese: (value: string) => void;
  diagnostico: string;
  setDiagnostico: (value: string) => void;
  observacao: string;
  setObservacao: (value: string) => void;
  weight: string;
  setWeight: (value: string) => void;
  homeInstructionOn: boolean;
  setHomeInstructionOn: (value: boolean) => void;
  homeInstructionText: string;
  setHomeInstructionText: (value: string) => void;
  diagnosticoErro: string | null;
  isSaving: boolean;
  salvar: (precisaPrescrever: boolean) => void;
}

const useMedicalRecordControl = (
  animalId: string,
  onSaved?: (registro: MedicalRecord) => void,
  onSavedWithoutPrescription?: () => void,
): MedicalRecordControl => {
  const queryClient = useQueryClient();

  const registrosQuery = useQuery({
    queryKey: registrosQueryKey(animalId),
    queryFn: () => getRecordsByPetId(animalId),
  });

  const { data: petAtual } = usePet(animalId);
  const updatePet = useUpdatePet();

  const [anamnese, setAnamnese] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [observacao, setObservacao] = useState('');
  const [weight, setWeight] = useState('');
  const [homeInstructionOn, setHomeInstructionOn] = useState(false);
  const [homeInstructionText, setHomeInstructionText] = useState('');
  const [diagnosticoErro, setDiagnosticoErro] = useState<string | null>(null);

  const salvarMutation = useMutation({
    mutationFn: async (precisaPrescrever: boolean) => {
      // Atualiza o peso do animal antes de salvar o prontuário
      if (weight && petAtual) {
        const pesoNumerico = parseFloat(weight.replace(',', '.'));
        if (!isNaN(pesoNumerico)) {
          await updatePet.mutateAsync({ ...petAtual, peso: pesoNumerico });
        }
      }

      const observacaoFinal = [
        observacao,
        homeInstructionOn && homeInstructionText
          ? `Orientação para casa: ${homeInstructionText}`
          : null,
      ]
        .filter(Boolean)
        .join(' · ') || undefined;

      const registro = await medicalRecordSchema.validate(
        {
          id: `rec-${Date.now()}`,
          animalId,
          dataAtendimento: new Date().toISOString().slice(0, 10),
          anamnese: anamnese || undefined,
          diagnostico,
          tratamento: precisaPrescrever
            ? 'Vide prescrição estruturada'
            : 'Apenas orientação em consultório',
          observacao: observacaoFinal,
        },
        { abortEarly: false }
      );

      return { registro: await createRecord(registro), precisaPrescrever };
    },
    onSuccess: ({ registro, precisaPrescrever }) => {
      queryClient.invalidateQueries({ queryKey: registrosQueryKey(animalId) });
      if (precisaPrescrever) {
        onSaved?.(registro);
      } else {
        onSavedWithoutPrescription?.();
      }
    },
    onError: (error: any) => {
      if (!error?.inner) return;
      for (const erro of error.inner) {
        if (erro.path === 'diagnostico') setDiagnosticoErro(erro.message);
      }
    },
  });

  const salvar = (precisaPrescrever: boolean) => {
    setDiagnosticoErro(null);
    salvarMutation.mutate(precisaPrescrever);
  };

  return {
    registros: registrosQuery.data,
    carregandoRegistros: registrosQuery.isLoading,
    anamnese,
    setAnamnese,
    diagnostico,
    setDiagnostico,
    observacao,
    setObservacao,
    weight,
    setWeight,
    homeInstructionOn,
    setHomeInstructionOn,
    homeInstructionText,
    setHomeInstructionText,
    diagnosticoErro,
    isSaving: salvarMutation.isPending,
    salvar,
  };
};

export type { MedicalRecordControl };
export default useMedicalRecordControl;
