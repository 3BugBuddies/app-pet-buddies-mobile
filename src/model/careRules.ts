import type {
  CheckinDesfecho,
  CheckinResponse,
  CheckInDoseResult,
  CheckInEscalationResult,
  CheckInInterpretation,
  CheckInNoRuleResult,
  CheckInResult,
} from './care';
import {
  GLOBAL_ALARM_SIGNALS,
  RULE_ACTION_RESULT_LABEL,
  type ConditionSignal,
  type Prescription,
} from './legacyPrescription';
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

interface ResolveCheckInParams {
  prescription: Prescription;
  signals: ConditionSignal[];
  confirmedAtLabel: string;
  points: number;
}

// Regra do produto: sinal de alarme global sempre
// escala, mesmo sem regra cadastrada. Senão, a primeira regra da prescrição
// cujo sinal bate decide a ação. Sem nenhuma correspondência, nunca "chuta"
// uma dose — cai em "confirmar com a clínica".
//
// Persistência (hoje/2 dias/48h/3+) é só metadado exibido na regra; não é
// aplicada aqui, pois exigiria histórico do sinal ao longo de vários dias.
export function resolveCheckIn({
  prescription,
  signals,
  confirmedAtLabel,
  points,
}: ResolveCheckInParams): CheckInResult {
  const globalAlarm = signals.find((signal) => GLOBAL_ALARM_SIGNALS.includes(signal));
  if (globalAlarm) {
    const escalation: CheckInEscalationResult = {
      status: 'ESCALATION',
      reasonLabel: CONDITION_SIGNAL_LABEL_LOWER[globalAlarm],
      ruleDescription: `${CONDITION_SIGNAL_LABEL_LOWER[globalAlarm]} → sem dose · emergência`,
      vetName: prescription.vetName,
      vetCrmv: prescription.vetCrmv,
      suggestedSlotLabel: 'hoje 17:40',
    };
    return escalation;
  }

  const matchedRule = prescription.rules.find((rule) => signals.includes(rule.signal));

  if (!matchedRule) {
    const noRule: CheckInNoRuleResult = {
      status: 'NO_RULE',
      vetName: prescription.vetName,
      vetCrmv: prescription.vetCrmv,
    };
    return noRule;
  }

  if (matchedRule.action === 'SEM_DOSE_CLINICA' || matchedRule.action === 'SEM_DOSE_EMERGENCIA') {
    const escalation: CheckInEscalationResult = {
      status: 'ESCALATION',
      reasonLabel: CONDITION_SIGNAL_LABEL_LOWER[matchedRule.signal],
      ruleDescription: `${CONDITION_SIGNAL_LABEL_LOWER[matchedRule.signal]} → ${RULE_ACTION_RESULT_LABEL[matchedRule.action]}`,
      vetName: prescription.vetName,
      vetCrmv: prescription.vetCrmv,
      suggestedSlotLabel: 'hoje 17:40',
    };
    return escalation;
  }

  const doseValue = matchedRule.action === 'MENOR_DOSE' ? prescription.doseMin : prescription.doseMax;
  const doseRangeLabel = `${formatDose(prescription.doseMin)}–${formatDose(prescription.doseMax)} ${prescription.doseUnit}`;

  const dose: CheckInDoseResult = {
    status: 'DOSE',
    doseLabel: `${formatDose(doseValue)} ${prescription.doseUnit}`,
    doseRangeLabel,
    ruleDescription: `${CONDITION_SIGNAL_LABEL_LOWER[matchedRule.signal]} → ${RULE_ACTION_RESULT_LABEL[matchedRule.action]}`,
    ruleConfirmedAtLabel: confirmedAtLabel,
    vetName: prescription.vetName,
    vetCrmv: prescription.vetCrmv,
    prescriptionDateLabel: prescription.prescriptionDateLabel,
    pointsEarned: points,
  };
  return dose;
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

export function resolveCheckInResponse(
  response: CheckinResponse,
  redFlags: string[],
): CheckInResult {
  const desfechos = response.desfechos ?? [];
  const acionar = desfechos.find((d) => d.desfecho === 'ACIONAR_CLINICA');

  if (response.escalado) {
    const { vetName, vetCrmv } = prescriber(acionar ?? desfechos[0]);
    const escalation: CheckInEscalationResult = {
      status: 'ESCALATION',
      reasonLabel: redFlags.length > 0 ? redFlags.join(', ') : 'um sinal de alerta',
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

const CONDITION_SIGNAL_LABEL_LOWER: Record<ConditionSignal, string> = {
  FEZES_MOLES: 'fezes moles',
  NAO_EVACUOU: 'não evacuou',
  COMEU_POUCO: 'comeu pouco',
  VOMITO: 'vômito',
  SANGUE_NAS_FEZES: 'sangue nas fezes',
  APATIA: 'apatia',
  DIFICULDADE_RESPIRATORIA: 'dificuldade respiratória',
};

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
