export function buildApiErrorMessage(
  error: any,
  fallback = 'Não foi possível concluir a operação. Tente novamente.',
): string {
  if (error?.response?.data) {
    console.log('[API Error Data]:', JSON.stringify(error.response.data, null, 2));
  }

  const status: number | undefined = error?.response?.status;
  
  // Extrai mensagens ou array de erros de validação (ex: Spring Validation errors / erros)
  let apiMsg: string | undefined =
    error?.response?.data?.message ??
    error?.response?.data?.erro ??
    error?.response?.data?.error;

  if (Array.isArray(error?.response?.data?.erros)) {
    const list = error.response.data.erros
      .map((e: any) => (typeof e === 'string' ? e : `${e.campo || e.field || ''}: ${e.mensagem || e.message || ''}`))
      .filter(Boolean);
    if (list.length > 0) {
      apiMsg = list.join('\n');
    }
  } else if (Array.isArray(error?.response?.data?.errors)) {
    const list = error.response.data.errors
      .map((e: any) => (typeof e === 'string' ? e : `${e.field || ''}: ${e.defaultMessage || e.message || ''}`))
      .filter(Boolean);
    if (list.length > 0) {
      apiMsg = list.join('\n');
    }
  }

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
