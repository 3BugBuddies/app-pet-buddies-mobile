export function buildApiErrorMessage(
  error: any,
  fallback = 'Não foi possível concluir a operação. Tente novamente.',
): string {
  const status: number | undefined = error?.response?.status;
  const apiMsg: string | undefined =
    error?.response?.data?.message ??
    error?.response?.data?.erro ??
    error?.response?.data?.error;

  if (status === 400) return `Dados inválidos (400).${apiMsg ? `\n${apiMsg}` : ''}`;
  if (status === 401) return 'Sessão expirada. Faça login novamente.';
  if (status === 403) return 'Sem permissão para realizar esta ação (403).';
  if (status === 404) return 'Recurso não encontrado na API (404).';
  if (status === 409) return apiMsg ?? 'Conflito: operação já realizada ou recurso duplicado (409).';
  if (status && status >= 500) return `Erro no servidor (${status}). Tente novamente em instantes.`;
  if (!status) return `Sem resposta da API. Verifique sua conexão.\n(${error?.message ?? 'Erro desconhecido'})`;
  if (apiMsg) return apiMsg;
  return fallback;
}
