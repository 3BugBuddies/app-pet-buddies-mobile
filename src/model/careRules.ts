import type {
  CheckinDesfecho,
  CheckinResponse,
  CheckInDoseResult,
  CheckInEscalationResult,
  CheckInInterpretation,
  CheckInNoRuleResult,
  CheckInResult,
} from './care';
import type { ConditionSignal } from './legacyPrescription';
import { formatShortDate } from './formatDate';

// Heurística local por palavras-chave, no lugar do serviço de IA que a vet
// usaria para interpretar a narrativa. Trocar por uma chamada real de NLP/IA
// quando o backend tiver esse serviço.
export function interpretNarrative(text: string): CheckInInterpretation {
  const lower = text.toLowerCase();

  const hasBlood = /sangue/.test(lower);
  const stoolConsistency: CheckInInterpretation['stoolConsistency'] = hasBlood
    ? 'BLOOD'
    : /mole/.test(lower)
      ? 'SOFT'
      : 'NORMAL';

  const defecated = !/n[ãa]o evacuou/.test(lower);

  const appetite: CheckInInterpretation['appetite'] = /n[ãa]o comeu/.test(lower)
    ? 'NONE'
    : /comeu pouco/.test(lower)
      ? 'LOW'
      : 'NORMAL';

  const medicationGiven = !/n[ãa]o deu (o )?rem[ée]dio/.test(lower);
  const vomited = /v[ôo]mito|vomitou/.test(lower);
  const apathetic = /ap[áa]tic|sem energia|deitad[ao] o dia todo/.test(lower);
  const breathingDifficulty = /respira[çc][ãa]o|falta de ar|ofegante/.test(lower);

  return {
    medicationGiven,
    appetite,
    defecated,
    stoolConsistency,
    alarmSign: hasBlood,
    vomited,
    apathetic,
    breathingDifficulty,
  };
}

// Converte a interpretação (campos estruturados) nos sinais de condição que a
// prescrição usa nas regras SE→ENTÃO. Um relato pode acionar vários sinais.
export function deriveSignals(interpretation: CheckInInterpretation): ConditionSignal[] {
  const signals: ConditionSignal[] = [];
  if (interpretation.stoolConsistency === 'BLOOD') signals.push('SANGUE_NAS_FEZES');
  if (interpretation.stoolConsistency === 'SOFT') signals.push('FEZES_MOLES');
  if (!interpretation.defecated) signals.push('NAO_EVACUOU');
  if (interpretation.appetite === 'LOW' || interpretation.appetite === 'NONE') {
    signals.push('COMEU_POUCO');
  }
  if (interpretation.vomited) signals.push('VOMITO');
  if (interpretation.apathetic) signals.push('APATIA');
  if (interpretation.breathingDifficulty) signals.push('DIFICULDADE_RESPIRATORIA');
  return signals;
}

function formatDose(value: number): string {
  return String(value).replace('.', ',');
}

const CLINICA_PADRAO = 'Clínica Veterinária';

// Traduz a resposta real de POST /checkin (`escalado` + `desfechos[]`) para o resultado que
// as telas desenham. A API não devolve faixa de dose nem pontos. Nome, CRMV e data da
// prescrição vêm do desfecho (campos opcionais); na ausência, as telas usam o texto padrão.
function prescriber(d: CheckinDesfecho | undefined): { vetName: string; vetCrmv: string; prescriptionDateLabel: string } {
  return {
    vetName: d?.veterinarioNome || d?.clinicaNome || CLINICA_PADRAO,
    vetCrmv: d?.veterinarioCrmv ?? '',
    prescriptionDateLabel: d?.prescritaEm ? formatShortDate(d.prescritaEm) : '',
  };
}

// Fallback para respostas sem `clinica`: o telefone vem dentro da mensagem.
export function extractPhone(text: string): string | undefined {
  return text.match(/\(\d{2}\)\s?\d{4,5}-\d{4}/)?.[0];
}

export function resolveCheckInResponse(
  response: CheckinResponse,
  redFlags: string[],
  alarmLabels: string[] = [],
): CheckInResult {
  const desfechos = response.desfechos ?? [];
  const acionar = desfechos.find((d) => d.desfecho === 'ACIONAR_CLINICA');

  if (response.escalado) {
    const { vetName, vetCrmv } = prescriber(acionar ?? desfechos[0]);
    const escalation: CheckInEscalationResult = {
      status: 'ESCALATION',
      reasonLabel:
        alarmLabels.length > 0 ? alarmLabels.join(', ') : redFlags.length > 0 ? redFlags.join(', ') : 'um sinal de alerta',
      reasonFromConditions: alarmLabels.length > 0,
      clinicName: response.clinica?.nome,
      clinicPhone: response.clinica?.telefone ?? extractPhone(JSON.stringify(response)),
      ruleDescription: acionar
        ? `Regra de ${acionar.medicamento} · acionar a clínica`
        : 'Regra da prescrição · acionar a clínica',
      vetName,
      vetCrmv,
      suggestedSlotLabel: '',
    };
    return escalation;
  }

  const comDose = desfechos.filter(
    (d) => d.desfecho === 'DOSE_CALCULADA' && d.doseAplicada != null,
  );

  const semDose = desfechos.filter((d) => d.desfecho === 'SEM_DOSE');

  if (comDose.length === 0 && semDose.length > 0) {
    const medications = semDose.map((d) => d.medicamento).join(', ');
    const suspended: CheckInDoseResult = {
      status: 'DOSE',
      doseLabel: 'Sem dose hoje',
      doseRangeLabel: '',
      ruleDescription: `Regra da prescrição · ${medications} · suspende a dose de hoje`,
      ruleConfirmedAtLabel: response.registradoEm
        ? new Date(response.registradoEm).toLocaleDateString('pt-BR')
        : '',
      ...prescriber(semDose[0]),
      pointsEarned: 0,
      ruleApplied: semDose.some((d) => d.regraAplicadaId != null),
      medicationLabel: medications,
      itemClosed: semDose.some((d) => d.itemPlanoCuidadoId != null),
      suspended: true,
    };
    return suspended;
  }

  if (comDose.length === 0) {
    const { vetName, vetCrmv } = prescriber(desfechos[0]);
    const noRule: CheckInNoRuleResult = {
      status: 'NO_RULE',
      vetName,
      vetCrmv,
    };
    return noRule;
  }

  const rotulos = comDose.map((d) => {
    const dose = `${formatDose(d.doseAplicada as number)}${d.unidade ? ` ${d.unidade}` : ''}`;
    return comDose.length > 1 ? `${d.medicamento}: ${dose}` : dose;
  });

  const dose: CheckInDoseResult = {
    status: 'DOSE',
    doseLabel: rotulos.join(' · '),
    doseRangeLabel: '',
    ruleDescription: `Regra da prescrição · ${comDose.map((d) => d.medicamento).join(', ')}`,
    ruleConfirmedAtLabel: response.registradoEm
      ? new Date(response.registradoEm).toLocaleDateString('pt-BR')
      : '',
    ...prescriber(comDose[0]),
    pointsEarned: 0,
    ruleApplied: comDose.some((d) => d.regraAplicadaId != null),
    medicationLabel: comDose.map((d) => d.medicamento).join(', '),
    itemClosed: comDose.some((d) => d.itemPlanoCuidadoId != null),
  };
  return dose;
}

export function parseDoseRange(label: string): { min: number; max: number; unit: string } {
  const match = label.match(/([\d.,]+)\s*[–-]\s*([\d.,]+)\s*(\w+)/);
  if (!match) {
    return { min: 0, max: 0, unit: '' };
  }
  return {
    min: Number(match[1].replace(',', '.')),
    max: Number(match[2].replace(',', '.')),
    unit: match[3],
  };
}
