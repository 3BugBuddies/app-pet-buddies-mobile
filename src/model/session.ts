// Espelha T_PB_USUARIO (schema-sprint-3-08.md): quem logou, com que perfil, e o
// JWT emitido pelo servico Java (o mesmo token vale nas duas APIs).
const PERFIS = ['TUTOR', 'VET'] as const;

type Perfil = (typeof PERFIS)[number];

interface AuthSession {
  token: string;
  usuarioId: string;
  nome: string;
  perfil: Perfil;
}

export { PERFIS };
export type { Perfil, AuthSession };
