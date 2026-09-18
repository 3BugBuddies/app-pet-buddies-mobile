import * as FileSystem from 'expo-file-system/legacy';

// Serviço de Transcrição de Áudio (Speech-to-Text) utilizando Whisper API (Groq ou OpenAI).
// Converte o arquivo gravado pelo microfone do dispositivo (.m4a) em texto legível.

export interface TranscriptionConfig {
  apiKey?: string;
  provider?: 'groq' | 'openai';
  prompt?: string;
}

// Configuração padrão. Pode ser preenchida com a chave do usuário ou variável de ambiente.
// Groq (whisper-large-v3-turbo) é recomendado pela velocidade (< 500ms) e custo gratuito/mínimo.
const DEFAULT_PROVIDER: 'groq' | 'openai' = 'groq';

// NOTA: A chave é lida via variável de ambiente (prefixo EXPO_PUBLIC_ do Expo)
export const SPEECH_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';

/**
 * Transcreve um arquivo de áudio gravado no dispositivo.
 * @param audioUri URI local do arquivo gerado pelo expo-audio (ex: "file:///.../recording.m4a")
 * @param config Configuração opcional de provedor e chave de API
 * @returns Texto transcrito da conduta médica
 */
export async function transcribeAudio(
  audioUri: string,
  config?: TranscriptionConfig
): Promise<string> {
  const apiKey = config?.apiKey || SPEECH_API_KEY;
  const provider = config?.provider || DEFAULT_PROVIDER;

  // simula um atraso de rede e retorna uma narrativa realista de prescrição para testes locais.
  if (!apiKey || apiKey.trim() === '') {
    console.warn(
      '[speechTranscriptionService] Nenhuma chave de API Whisper configurada. Usando transcrição simulada para teste de interface.'
    );
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return 'Prescrever Amoxicilina 250mg, 1 comprimido a cada 12 horas por 7 dias. Administrar junto com a refeição.';
  }

  // Validação do arquivo gravado no disco
  const fileInfo = await FileSystem.getInfoAsync(audioUri);
  console.log('[speechTranscriptionService] Informações do arquivo de áudio:', fileInfo);

  if (!fileInfo.exists || (fileInfo.size !== undefined && fileInfo.size < 500)) {
    throw new Error(
      'O áudio gravado está vazio ou muito curto. Por favor, grave falando por pelo menos 2 segundos.'
    );
  }

  const endpoint =
    provider === 'groq'
      ? 'https://api.groq.com/openai/v1/audio/transcriptions'
      : 'https://api.openai.com/v1/audio/transcriptions';

  const model = provider === 'groq' ? 'whisper-large-v3-turbo' : 'whisper-1';

  // Usamos FileSystem.uploadAsync nativo do Expo. Ele transmite o arquivo binário
  // garantindo compatibilidade total com o Android/iOS e com a API do Whisper.
  const uploadResult = await FileSystem.uploadAsync(endpoint, audioUri, {
    fieldName: 'file',
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    mimeType: 'audio/m4a',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    parameters: {
      model,
      language: 'pt',
      prompt:
        config?.prompt ||
        'Relato médico veterinário e cuidados do pet: sintomas, medicamentos, alimentação, fezes e comportamento.',
    },
  });

  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    console.error('[speechTranscriptionService] Erro na API Whisper:', uploadResult.body);
    let errorMessage = `Falha na transcrição do áudio (${uploadResult.status})`;
    try {
      const parsed = JSON.parse(uploadResult.body);
      if (parsed?.error?.message) {
        errorMessage = parsed.error.message;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  const result = JSON.parse(uploadResult.body);
  return result.text ? result.text.trim() : '';
}

