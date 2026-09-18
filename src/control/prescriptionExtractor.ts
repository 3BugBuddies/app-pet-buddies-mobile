/**
 * Extrator inteligente de prescrições em linguagem natural.
 * Analisa a fala ou digitação do veterinário e extrai os campos estruturados
 * (medicamento, doses, unidade, frequência, duração e orientações clínicas).
 * 
 * Funciona como acelerador de IA no cliente e fallback infalível caso o endpoint
 * do servidor Java encontre inconsistências de validação (ex: registroAtendimentoId ausente).
 */

export interface PrescricaoExtraida {
  medicamento: string;
  doseMin: number;
  doseMax: number;
  unidade: string;
  frequenciaDia: number;
  duracaoDias: number;
  orientacao: string;
}

export function extrairPrescricaoDaNarrativa(texto: string): PrescricaoExtraida {
  const lower = texto.toLowerCase();

  // 1. Frequência diária
  let frequenciaDia = 1;
  if (/(\b12\s*em\s*12\b|\ba\s*cada\s*12\s*horas?\b|\b2\s*vezes\b|\bduas\s*vezes\b|\b2x\b)/i.test(lower)) {
    frequenciaDia = 2;
  } else if (/(\b8\s*em\s*8\b|\ba\s*cada\s*8\s*horas?\b|\b3\s*vezes\b|\btr[êe]s\s*vezes\b|\b3x\b)/i.test(lower)) {
    frequenciaDia = 3;
  } else if (/(\b6\s*em\s*6\b|\ba\s*cada\s*6\s*horas?\b|\b4\s*vezes\b|\bquatro\s*vezes\b|\b4x\b)/i.test(lower)) {
    frequenciaDia = 4;
  } else if (/(\b24\s*em\s*24\b|\ba\s*cada\s*24\s*horas?\b|\b1\s*vez\b|\buma\s*vez\b|\b1x\b)/i.test(lower)) {
    frequenciaDia = 1;
  }

  // 2. Duração em dias
  let duracaoDias = 7; // padrão razoável de tratamento
  const mesesMatch = lower.match(/(\d+|um|dois|tr[êe]s|quatro|seis)\s*m[eê]s(?:es)?/i);
  if (mesesMatch) {
    const qtdMeses = converterNumeroPorExtenso(mesesMatch[1]);
    duracaoDias = qtdMeses * 30;
  } else {
    const semanasMatch = lower.match(/(\d+|uma|duas|tr[êe]s)\s*semanas?/i);
    if (semanasMatch) {
      const qtdSemanas = converterNumeroPorExtenso(semanasMatch[1]);
      duracaoDias = qtdSemanas * 7;
    } else {
      const diasMatch = lower.match(/(\d+|um|dois|tr[êe]s|quatro|cinco|sete|dez|quinze)\s*dias?/i);
      if (diasMatch) {
        duracaoDias = converterNumeroPorExtenso(diasMatch[1]);
      }
    }
  }

  // 3. Unidade e Dose
  let unidade = 'mg';
  let doseMin = 1;
  let doseMax = 1;

  if (lower.includes('gotas') || lower.includes('gota')) {
    unidade = 'gotas';
  } else if (lower.includes('ml') || lower.includes('mililitro')) {
    unidade = 'ml';
  } else if (lower.includes('comp') || lower.includes('comprimido')) {
    unidade = 'comp';
  } else if (lower.includes('mg/kg')) {
    unidade = 'mg/kg';
  } else if (lower.includes('mg') || lower.includes('miligrama')) {
    unidade = 'mg';
  }

  const doseMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:a\s*(\d+(?:[.,]\d+)?))?\s*(mg\/kg|mg|ml|gotas?|comprimidos?|comp)/i);
  if (doseMatch) {
    doseMin = parseFloat(doseMatch[1].replace(',', '.'));
    doseMax = doseMatch[2] ? parseFloat(doseMatch[2].replace(',', '.')) : doseMin;
    if (doseMatch[3]) {
      const u = doseMatch[3].toLowerCase();
      if (u.startsWith('gota')) unidade = 'gotas';
      else if (u.startsWith('comp')) unidade = 'comp';
      else unidade = u;
    }
  }

  // 4. Medicamento
  let medicamento = '';
  // Lista de medicamentos veterinários comuns para detecção rápida
  const medicamentosComuns = [
    'gaviscon', 'gavis', 'amoxicilina', 'cefalexina', 'enrofloxacina',
    'prednisolona', 'dexametasona', 'metronidazol', 'omeprazol',
    'ranitidina', 'ondansetrona', 'cerenia', 'maropitant', 'meloxicam',
    'dipirona', 'tramadol', 'apoquel', 'cytopoint', 'drontal',
    'simparic', 'bravecto', 'nexgard', 'capstar', 'vetmedin'
  ];

  for (const med of medicamentosComuns) {
    if (new RegExp(`\\b${med}\\b`, 'i').test(lower)) {
      medicamento = med.charAt(0).toUpperCase() + med.slice(1);
      break;
    }
  }

  // Se não estiver na lista fixa, tenta capturar após verbos típicos: "dar X", "prescrever X", "administrar X"
  if (!medicamento) {
    const acaoMatch = lower.match(/(?:dar|prescrever|administrar|iniciar|usar)\s+([a-zA-Záéíóúâêîôûãõç]+)/i);
    if (acaoMatch && !['o', 'a', 'os', 'as', 'um', 'uma'].includes(acaoMatch[1].toLowerCase())) {
      const captured = acaoMatch[1];
      medicamento = captured.charAt(0).toUpperCase() + captured.slice(1);
    }
  }

  if (!medicamento) {
    medicamento = '';
  }

  // 5. Orientações
  const orientacoesPossiveis = [
    'antes das refeições',
    'após as refeições',
    'junto com a refeição',
    'junto com o alimento',
    'com a comida',
    'em jejum',
    'agitar antes de usar',
    'apenas se houver vômito',
    'apenas se apresentar dor',
    'manter na geladeira',
    'não interromper o tratamento'
  ];

  let orientacao = '';
  for (const ori of orientacoesPossiveis) {
    if (lower.includes(ori)) {
      orientacao = ori.charAt(0).toUpperCase() + ori.slice(1) + '.';
      break;
    }
  }

  if (!orientacao && lower.includes('refei')) {
    orientacao = 'Administrar próximo aos horários de alimentação.';
  }

  return {
    medicamento,
    doseMin,
    doseMax,
    unidade,
    frequenciaDia,
    duracaoDias,
    orientacao,
  };
}

function converterNumeroPorExtenso(str: string): number {
  const num = parseInt(str, 10);
  if (!isNaN(num)) return num;
  switch (str.toLowerCase()) {
    case 'um':
    case 'uma':
      return 1;
    case 'dois':
    case 'duas':
      return 2;
    case 'três':
    case 'tres':
      return 3;
    case 'quatro':
      return 4;
    case 'cinco':
      return 5;
    case 'seis':
      return 6;
    case 'sete':
      return 7;
    case 'oito':
      return 8;
    case 'nove':
      return 9;
    case 'dez':
      return 10;
    case 'quinze':
      return 15;
    case 'vinte':
      return 20;
    case 'trinta':
      return 30;
    default:
      return 1;
  }
}
