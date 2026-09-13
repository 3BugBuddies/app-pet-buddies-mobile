import { useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { AuthContext } from '../context/authContext';
import { useCreatePet, usePet, useUpdatePet } from './usePetsControl';
import { petSchema, ESPECIES, PORTES, SEXOS } from '../model/pet';

// Aplica máscara DD/MM/AAAA enquanto o usuário digita
function aplicarMascaraData(text: string): string {
  const digitos = text.replace(/\D/g, '').slice(0, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

// Converte DD/MM/AAAA → AAAA-MM-DD para o petSchema.
// Se o ano estiver incompleto (< 4 dígitos) retorna a máscara crua para que o
// Regex do petSchema gere a mensagem de erro amigável em vez de falha silenciosa.
function mascaraParaIso(mascara: string): string {
  const partes = mascara.split('/');
  if (partes.length !== 3 || partes[2].length !== 4) return mascara;
  return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

// Converte AAAA-MM-DD → DD/MM/AAAA para preencher o campo visual
function isoParaMascara(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function usePetFormControl(onSuccess: (petId: string) => void, petId?: string) {
  const { session } = useContext(AuthContext);
  const { data: petToEdit, isLoading: isFetchingPet } = usePet(petId ?? '');
  const createPet = useCreatePet();
  const updatePet = useUpdatePet();

  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState<string>('CACHORRO');
  const [raca, setRaca] = useState('');
  const [porte, setPorte] = useState<string | null>(null);
  const [sexo, setSexo] = useState<string>('');
  const [peso, setPeso] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');

  const handlePesoChange = (text: string) => {
    // Permite apenas números e UMA vírgula
    let formatado = text.replace(/[^0-9,]/g, '');
    const partes = formatado.split(',');
    if (partes.length > 2) {
      formatado = partes[0] + ',' + partes.slice(1).join('');
    }
    setPeso(formatado);
  };
  const [castrado, setCastrado] = useState(false);
  const [condicaoCronica, setCondicaoCronica] = useState(false);
  const [alergia, setAlergia] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    if (petToEdit) {
      setNome(petToEdit.nome);
      setEspecie(petToEdit.especie);
      setRaca(petToEdit.raca ?? '');
      setPorte(petToEdit.porte ?? null);
      setSexo(petToEdit.sexo);
      setPeso(petToEdit.peso ? String(petToEdit.peso).replace('.', ',') : '');
      setCastrado(petToEdit.castrado ?? false);
      setCondicaoCronica(petToEdit.condicaoCronica ?? false);
      setAlergia(petToEdit.alergia ?? '');
      if (petToEdit.dataNascimento) {
        setDataNascimento(isoParaMascara(petToEdit.dataNascimento));
      }
    }
  }, [petToEdit]);

  const handleDataChange = (text: string) => {
    setDataNascimento(aplicarMascaraData(text));
  };

  const salvar = async () => {
    setErros({});

    const pesoRaw = peso.trim().replace(',', '.');
    const pesoNum = pesoRaw ? parseFloat(pesoRaw) : null;

    const dataNascimentoIso: string | null = dataNascimento.trim()
      ? mascaraParaIso(dataNascimento)
      : null;

    try {
      const dadosValidados = await petSchema.validate(
        {
          id: petId || null,
          nome,
          especie,
          raca: raca.trim() || null,
          porte: porte || null,
          sexo,
          peso: pesoNum !== null && !isNaN(pesoNum) ? pesoNum : null,
          dataNascimento: dataNascimentoIso,
          castrado,
          condicaoCronica,
          alergia: alergia.trim() || null,
          foto: null,
          observacoes: null,
          responsavelId: String(session?.responsavelId ?? ''),
        },
        { abortEarly: false }
      );

      const petSalvo = petId
        ? await updatePet.mutateAsync(dadosValidados)
        : await createPet.mutateAsync(dadosValidados);

      Alert.alert(
        'Sucesso!',
        petId
          ? 'Dados do pet atualizados com sucesso.'
          : 'Seu novo companheiro foi cadastrado com sucesso.',
        [{ text: 'Continuar', onPress: () => onSuccess(petSalvo?.id ?? petId ?? '') }]
      );
    } catch (error: any) {
      if (error?.inner) {
        const errosAtuais: Record<string, string> = {};
        error.inner.forEach((e: any) => {
          errosAtuais[e.path] = e.message;
        });
        setErros(errosAtuais);
      } else {
        Alert.alert(
          'Tropeçamos na coleira',
          'Não foi possível salvar as informações no momento. Tente novamente.'
        );
      }
    }
  };

  return {
    nome, setNome,
    especie, setEspecie,
    raca, setRaca,
    porte, setPorte,
    sexo, setSexo,
    peso, setPeso, handlePesoChange,
    dataNascimento,
    handleDataChange,
    castrado, setCastrado,
    condicaoCronica, setCondicaoCronica,
    alergia, setAlergia,
    erros,
    salvar,
    isFetchingPet,
    isSaving: createPet.isPending || updatePet.isPending,
    ESPECIES,
    PORTES,
    SEXOS,
  };
}
