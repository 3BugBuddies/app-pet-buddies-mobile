// Espelha T_PB_USUARIO (schema-sprint-3-08.md): quem logou, com que perfil, e o
const PERFIS = ['TUTOR', 'VET'] as const;

type Perfil = (typeof PERFIS)[number];

interface AuthSession {
  token: string;
  usuarioId: string;
  nome: string;
  perfil: Perfil;
  responsavelId?: number | string | null;
  veterinarioId?: number | string | null;
}

export { PERFIS };
export type { Perfil, AuthSession };
