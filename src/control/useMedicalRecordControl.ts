import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MedicalRecord, medicalRecordSchema } from '../model/medicalRecord';
import { createRecord, getRecordsByPetId } from '../repository/medicalRecordRepository';

const registrosQueryKey = (animalId: string) => ['prontuario', 'registros', animalId];

interface MedicalRecordControl {
  registros: MedicalRecord[] | undefined;
  carregandoRegistros: boolean;
  anamnese: string;
  setAnamnese: (value: string) => void;
  diagnostico: string;
  setDiagnostico: (value: string) => void;
  tratamento: string;
  setTratamento: (value: string) => void;
  observacao: string;
  setObservacao: (value: string) => void;
  weight: string;
  setWeight: (value: string) => void;
  homeInstructionOn: boolean;
  setHomeInstructionOn: (value: boolean) => void;
  homeInstructionText: string;
  setHomeInstructionText: (value: string) => void;
  diagnosticoErro: string | null;
  tratamentoErro: string | null;
  isSaving: boolean;
  salvar: () => void;
}

const useMedicalRecordControl = (
  animalId: string,
  onSaved?: (registro: MedicalRecord) => void
): MedicalRecordControl => {
  const queryClient = useQueryClient();

  // Historico do prontuario do pet — DetalhesPetScreen usa so essa leitura,
  // sem passar onSaved (nao salva nada, so mostra o historico).
  const registrosQuery = useQuery({
    queryKey: registrosQueryKey(animalId),
    queryFn: () => getRecordsByPetId(animalId),
  });

  const [anamnese, setAnamnese] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamento, setTratamento] = useState('');
  const [observacao, setObservacao] = useState('');
  const [weight, setWeight] = useState('');
  const [homeInstructionOn, setHomeInstructionOn] = useState(false);
  const [homeInstructionText, setHomeInstructionText] = useState('');

  const [diagnosticoErro, setDiagnosticoErro] = useState<string | null>(null);
  const [tratamentoErro, setTratamentoErro] = useState<string | null>(null);

  const salvarMutation = useMutation({
    mutationFn: async () => {
      const extra = [
        weight ? `Peso: ${weight} kg` : null,
        homeInstructionOn && homeInstructionText
          ? `Orientação para casa: ${homeInstructionText}`
          : null,
      ]
        .filter(Boolean)
        .join(' · ');

      const registro = await medicalRecordSchema.validate(
        {
          id: `rec-${Date.now()}`,
          animalId,
          dataAtendimento: new Date().toISOString().slice(0, 10),
          anamnese: anamnese || undefined,
          diagnostico,
          tratamento,
          observacao: [observacao, extra].filter(Boolean).join(' · ') || undefined,
        },
        { abortEarly: false }
      );

      return createRecord(registro);
    },
    onSuccess: (registroSalvo) => {
      queryClient.invalidateQueries({ queryKey: registrosQueryKey(animalId) });
      onSaved?.(registroSalvo);
    },
    onError: (error: any) => {
      if (!error?.inner) return;
      for (const erro of error.inner) {
        if (erro.path === 'diagnostico') setDiagnosticoErro(erro.message);
        if (erro.path === 'tratamento') setTratamentoErro(erro.message);
      }
    },
  });

  const salvar = () => {
    setDiagnosticoErro(null);
    setTratamentoErro(null);
    salvarMutation.mutate();
  };

  return {
    registros: registrosQuery.data,
    carregandoRegistros: registrosQuery.isLoading,
    anamnese,
    setAnamnese,
    diagnostico,
    setDiagnostico,
    tratamento,
    setTratamento,
    observacao,
    setObservacao,
    weight,
    setWeight,
    homeInstructionOn,
    setHomeInstructionOn,
    homeInstructionText,
    setHomeInstructionText,
    diagnosticoErro,
    tratamentoErro,
    isSaving: salvarMutation.isPending,
    salvar,
  };
};

export type { MedicalRecordControl };
export default useMedicalRecordControl;
