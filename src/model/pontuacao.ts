// Contrato de pontuação do PetBuddies-API (.NET): GET /api/pontuacao/saldo, /extrato e
// /consulta/{id}/memoria. Só há pontos: o programa não tem nível.

type GestoPontuacao =
  | 'PLANO_CRIADO'
  | 'CONSULTA_AGENDADA'
  | 'CONSULTA_REALIZADA'
  | 'PROCEDIMENTO_EXECUTADO'
  | 'CHECKIN_REGISTRADO'
  | 'ADESAO_COMPLETA'
  | 'EVOLUCAO_POSITIVA';

// Saldo do responsável, somando todas as consultas de todos os pets dele.
interface SaldoPontos {
  responsavelId: number;
  saldo: number;
}

// Uma linha do extrato: quanto o responsável recebeu numa consulta.
interface LancamentoPontos {
  id: number;
  consultaId: number;
  animalId: number;
  clinicaId: number;
  dataConsulta: string;
  pontos: number;
  createdAt: string;
}

// O que cada critério rendeu: quantidade × pontos por unidade (a regra vigente da clínica).
// O gesto chega como texto do Java, então pode ser um que o app ainda não conhece (ver gestoInfo).
interface ParcelaPontos {
  gesto: string;
  quantidade: number;
  pontosPorUnidade: number;
  pontos: number;
  observacao: string;
}

// Memória de cálculo de uma consulta pontuada.
interface MemoriaPontos {
  consultaId: number;
  responsavelId: number;
  animalId: number;
  total: number;
  parcelas: ParcelaPontos[];
}

type StatusPontosConsulta = 'calculando' | 'pronto' | 'indisponivel';

const GESTOS: Record<GestoPontuacao, { label: string; curto: string }> = {
  CONSULTA_REALIZADA: { label: 'Consulta realizada', curto: 'Consulta' },
  CHECKIN_REGISTRADO: { label: 'Check-ins nas doses', curto: 'Check-ins' },
  ADESAO_COMPLETA: { label: 'Adesão completa', curto: 'Adesão' },
  EVOLUCAO_POSITIVA: { label: 'Evolução positiva', curto: 'Evolução' },
  PLANO_CRIADO: { label: 'Plano criado', curto: 'Plano' },
  CONSULTA_AGENDADA: { label: 'Consulta agendada', curto: 'Agendamento' },
  PROCEDIMENTO_EXECUTADO: { label: 'Procedimento executado', curto: 'Procedimento' },
};

// Nome de um gesto. Um gesto novo do .NET não derruba a tela: aparece com o próprio código legível.
const gestoInfo = (gesto: string): { label: string; curto: string } => {
  if (Object.prototype.hasOwnProperty.call(GESTOS, gesto)) return GESTOS[gesto as GestoPontuacao];
  const legivel = gesto.toLowerCase().replace(/_/g, ' ');
  const nome = legivel.charAt(0).toUpperCase() + legivel.slice(1);
  return { label: nome, curto: nome };
};

const formatPontos = (n: number): string => `${n.toLocaleString('pt-BR')} ${n === 1 ? 'ponto' : 'pontos'}`;

const parcelasQuePontuaram = (memoria: MemoriaPontos): ParcelaPontos[] => memoria.parcelas.filter((p) => p.pontos > 0);

// Texto do bloco "Pontos do responsável" no atendimento concluído. Logo após fechar, o .NET pode
// ainda não ter o cálculo; se a memória não vier, o bloco só diz que os pontos foram enviados.
const descreverPontosConsulta = (
  status: StatusPontosConsulta,
  memoria: MemoriaPontos | undefined,
  responsavel: string
): { title: string; sub: string } => {
  const de = responsavel ? `de ${responsavel}` : 'do responsável';
  if (status === 'calculando') {
    return { title: `Calculando os pontos ${de}…`, sub: 'O envio roda em segundo plano.' };
  }
  if (status === 'pronto' && memoria) {
    if (memoria.total === 0) {
      return {
        title: 'Esta consulta não rendeu pontos',
        sub: 'Nenhum critério pontuou ou a clínica ainda não cadastrou as regras de pontuação.',
      };
    }
    return {
      title: `${responsavel || 'O responsável'} ganhou ${formatPontos(memoria.total)}`,
      sub: parcelasQuePontuaram(memoria)
        .map((p) => `${gestoInfo(p.gesto).curto} +${p.pontos}`)
        .join(' · '),
    };
  }
  return { title: 'Pontos enviados', sub: `O detalhe do cálculo aparece no app ${de} quando estiver disponível.` };
};

export type { GestoPontuacao, LancamentoPontos, MemoriaPontos, ParcelaPontos, SaldoPontos, StatusPontosConsulta };
export { descreverPontosConsulta, formatPontos, GESTOS, gestoInfo, parcelasQuePontuaram };
