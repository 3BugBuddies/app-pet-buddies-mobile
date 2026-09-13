import { useContext, useState } from 'react';
import { Alert } from 'react-native';
import { AuthContext } from '../context/authContext';
import { useCreatePet } from './usePetsControl';
import { petSchema, ESPECIES, PORTES, SEXOS } from '../model/pet';

// Aplica máscara DD/MM/AAAA enquanto o usuário digita
function aplicarMascaraData(text: string): string {
  const digitos = text.replace(/\D/g, '').slice(0, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

// Converte DD/MM/AAAA → AAAA-MM-DD para o petSchema
function mascaraParaIso(mascara: string): string | null {
  const partes = mascara.split('/');
  if (partes.length !== 3 || partes[2].length !== 4) return null;
  return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

export function usePetFormControl(onSuccess: () => void) {
  const { session } = useContext(AuthContext);
  const createPet = useCreatePet();

  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState<string>('CACHORRO');
  const [raca, setRaca] = useState('');
  const [porte, setPorte] = useState<string | null>(null);
  const [sexo, setSexo] = useState<string>('');
  const [peso, setPeso] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [castrado, setCastrado] = useState(false);
  const [condicaoCronica, setCondicaoCronica] = useState(false);
  const [alergia, setAlergia] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});

  const handleDataChange = (text: string) => {
    setDataNascimento(aplicarMascaraData(text));
  };

  const salvar = async () => {
    setErros({});

    const pesoRaw = peso.trim().replace(',', '.');
    const pesoNum = pesoRaw ? parseFloat(pesoRaw) : null;

    // Converte máscara visual → ISO antes de validar
    const dataNascimentoIso = dataNascimento.trim()
      ? mascaraParaIso(dataNascimento)
      : null;

    try {
      const dadosValidados = await petSchema.validate(
        {
          id: null,
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

      await createPet.mutateAsync(dadosValidados);

      Alert.alert(
        'Sucesso!',
        'Seu novo companheiro foi cadastrado com sucesso.',
        [{ text: 'Continuar', onPress: onSuccess }]
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
    peso, setPeso,
    dataNascimento,
    handleDataChange,
    castrado, setCastrado,
    condicaoCronica, setCondicaoCronica,
    alergia, setAlergia,
    erros,
    salvar,
    isSaving: createPet.isPending,
    ESPECIES,
    PORTES,
    SEXOS,
  };
}
