import { apiJava, USE_API } from './apiClient';
import type { PrescriptionTemplate } from '../model/prescription';

const mapTemplate = (t: any): PrescriptionTemplate => ({
  id: Number(t.id),
  titulo: t.titulo,
  medicamento: t.medicamento,
  doseMin: Number(t.doseMin),
  doseMax: Number(t.doseMax),
  unidade: t.unidade,
  frequenciaDia: Number(t.frequenciaDia),
  duracaoDias: Number(t.duracaoDias),
  orientacao: t.orientacao ?? null,
  versao: Number(t.versao),
  regras: (t.regras ?? []).map((r: any) => ({
    id: Number(r.id),
    condicaoClinicaId: Number(r.condicaoClinicaId),
    condicaoRotulo: r.condicaoRotulo,
    condicaoTipoDado: r.condicaoTipoDado === 'NUMERICO' ? 'NUMERICO' : 'BOOLEANO',
    condicaoUnidade: r.condicaoUnidade ?? null,
    operador: r.operador ?? null,
    limite: r.limite != null ? Number(r.limite) : null,
    acaoDose: r.acaoDose,
    ordem: r.ordem ?? null,
  })),
});

// Receitas-modelo ativas da clínica da vet (GET /receita-modelo, só VET). Lista vazia pode vir
// sem `_embedded`; a chave da lista não foi conferida, então lê o primeiro array de `_embedded`.
const getPrescriptionTemplates = async (): Promise<PrescriptionTemplate[]> => {
  if (!USE_API) return [];
  const response = await apiJava.get('/receita-modelo');
  const embedded: Record<string, unknown> = response.data?._embedded ?? {};
  const lista = Object.values(embedded).find(Array.isArray) as any[] | undefined;
  return (lista ?? []).map(mapTemplate);
};

export { getPrescriptionTemplates };
