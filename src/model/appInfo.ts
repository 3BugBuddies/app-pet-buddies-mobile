// Gravado em extra.build pelo app.config.ts na hora de gerar o app.
interface BuildMeta {
  commitHash: string;
  dirty: boolean;
  builtAt: string; // ISO; vazio quando o app foi gerado sem esses metadados
}

interface AppInfo {
  version: string;
  build: BuildMeta;
}

const HASH_REGEX = /^[0-9a-f]{7,40}$/i;

// Hash abreviado como o git (7 caracteres); texto que não é hash (ex.: "desconhecido") fica como está.
const shortCommit = (hash: string): string => (HASH_REGEX.test(hash) ? hash.slice(0, 7) : hash);

const formatBuildDate = (iso: string): string => {
  const date = new Date(iso);
  if (!iso || Number.isNaN(date.getTime())) return 'Não informada';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export { AppInfo, BuildMeta, shortCommit, formatBuildDate };
