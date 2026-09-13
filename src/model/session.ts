// Espelha T_PB_USUARIO (schema-sprint-3-08.md): quem logou, com que perfil, e o
// JWT emitido pelo servico Java (o mesmo token vale nas duas APIs).
const PERFIS = ['TUTOR', 'VET'] as const;

type Perfil = (typeof PERFIS)[number];

interface AuthSession {
  token: string;
  usuarioId: string;
  nome: string;
  perfil: Perfil;
  // Vínculos retornados pelo Java — null quando o perfil não tem o vínculo
  responsavelId?: number | string | null;
  veterinarioId?: number | string | null;
}

export { PERFIS };
export type { Perfil, AuthSession };
