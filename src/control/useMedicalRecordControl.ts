import { useState } from 'react';
import { Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MedicalRecord, medicalRecordSchema } from '../model/medicalRecord';
import { createRecord, getRecordsByPetId } from '../repository/medicalRecordRepository';
import { getAllAppointments } from '../repository/appointmentRepository';
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
  handleWeightChange: (text: string) => void;
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

  const handleWeightChange = (text: string) => {
    let formatado = text.replace(/[^0-9,]/g, '');
    const partes = formatado.split(',');
    if (partes.length > 2) {
      formatado = partes[0] + ',' + partes.slice(1).join('');
    }
    setWeight(formatado);
  };
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
        .join(' | ') || undefined;

      // BUSCA A CONSULTA ATIVA DO PET PARA SATISFAZER O BACKEND
      const consultasDoPet = await getAllAppointments(animalId);
      // Pega a consulta mais recente, ou usa fallback '1' para evitar crash se não houver agendamento prévio
      const consultaAtualId = consultasDoPet.length > 0 ? consultasDoPet[0].id : '1';

      const registro = await medicalRecordSchema.validate(
        {
          id: `rec-${Date.now()}`,
          animalId,
          consultaId: String(consultaAtualId), // <--- INJEÇÃO DA CHAVE ESTRANGEIRA AQUI
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
      Alert.alert('Sucesso', 'O prontuário foi salvo corretamente.');
      if (precisaPrescrever) {
        onSaved?.(registro);
      } else {
        onSavedWithoutPrescription?.();
      }
    },
    onError: (error: any) => {
      // Se for erro de validação do Yup (front-end)
      if (error?.inner) {
        for (const erro of error.inner) {
          if (erro.path === 'diagnostico') setDiagnosticoErro(erro.message);
        }
        return;
      }

      // Se for erro da API (backend)
      const apiMessage = error?.response?.data?.message || error?.response?.data || error?.message || 'Erro desconhecido';
      Alert.alert('Erro ao salvar', `O servidor recusou o prontuário.\n\nDetalhe: ${apiMessage}`);
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
    handleWeightChange,
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
