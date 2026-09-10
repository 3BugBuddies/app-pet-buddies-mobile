import AsyncStorage from '@react-native-async-storage/async-storage';
import { deriveSignals, resolveCheckIn } from '../model/careRules';
import type {
  Badge,
  CarePlan,
  CareScore,
  CareTask,
  CheckInEscalationResult,
  CheckInInterpretation,
  CheckInResult,
} from '../model/care';
import type { Prescription } from '../model/legacyPrescription';

// Enquanto o backend da faculdade nao esta pronto, deixamos USE_API em false.
// Sem endpoint de plano de cuidado ainda (ver schema-sprint-3-08.md — Java
// ainda nao projeta T_PB_EVENTO_PLANO), entao USE_API fica sempre false aqui.
const USE_API = false;

const TASKS_KEY = 'CARE_TASKS';
const SCORE_KEY = 'CARE_SCORE';

// Referencia usada só pela simulação de check-in (dose de hoje). Não é a
// mesma prescrição da Fase 4 (assinada de verdade via prescriptionRepository)
// — unificar os dois exigiria portar esse motor de regras pro schema novo
// (persistência de sinal, hoje sem equivalente em T_PB_REGRA_PRESCRICAO).
const DOSE_RANGE_TASK_ID = 'lactulona';
const REFERENCE_PRESCRIPTION: Prescription = {
  id: 'presc-lactulona-luna',
  petId: 'pet-luna',
  medicationName: 'Lactulona',
  route: 'via oral',
  frequencyLabel: '1×/dia · 20:00',
  durationLabel: '14 dias',
  doseMin: 1,
  doseMax: 2,
  doseUnit: 'ml',
  status: 'DRAFT',
  vetName: 'Dra. Ana Ribeiro',
  vetCrmv: 'CRMV-SP 12.345',
  prescriptionDateLabel: '28 ago',
  rules: [{ id: 'rule-fezes-moles', signal: 'FEZES_MOLES', persistence: 'HOJE', action: 'MENOR_DOSE' }],
};

const initialTasks: CareTask[] = [
  { id: 'lactulona', title: 'Lactulona', description: '1–2 ml · 2x ao dia — administrar via oral, de preferência com o alimento.', time: '08:00', points: 20, completed: false, adherencePct: 96 },
  { id: 'vermifugo', title: 'Vermífugo', description: '1 comprimido · dose única — repetir a cada 3 meses conforme prescrição.', time: '08:00', points: 20, completed: false, adherencePct: 100 },
  { id: 'curativo', title: 'Troca de curativo', description: 'Trocar o curativo da pata traseira e higienizar com solução antisséptica.', time: '20:00', points: 30, completed: false, adherencePct: 88 },
  { id: 'dipirona', title: 'Dipirona', description: '0,5 ml · se necessário — em caso de dor ou febre acima de 39°C, máx. 3x ao dia.', time: '20:00', points: 20, completed: false, adherencePct: 100 },
];

const CARE_PLAN_INFO: Omit<CarePlan, 'tasks'> = {
  petId: 'pet-luna',
  weekLabel: 'Plano vivo · semana 12',
  currentWeekNumber: 12,
  totalWeeks: 24,
  weekDays: [
    { label: 'S', dayNumber: 1, isActive: false, dotColor: 'CUIDADO' },
    { label: 'T', dayNumber: 2, isActive: false, dotColor: 'CUIDADO' },
    { label: 'Q', dayNumber: 3, isActive: false, dotColor: 'CASA' },
    { label: 'Q', dayNumber: 4, isActive: true, dotColor: 'CASA' },
    { label: 'S', dayNumber: 5, isActive: false, dotColor: 'NONE' },
    { label: 'S', dayNumber: 6, isActive: false, dotColor: 'NONE' },
    { label: 'D', dayNumber: 7, isActive: false, dotColor: 'NONE' },
  ],
  milestones: [
    { title: 'Revisão de peso · sem. 12', whenLabel: 'hoje · registrar após a vacina', tagLabel: 'hoje', done: false },
    { title: 'Encerramento · sem. 24', whenLabel: '28 nov · exame de sangue', done: false },
  ],
};

const initialScore: CareScore = {
  totalPoints: 1240,
  pointsToday: 0,
  tier: 'Prata',
  nextTier: 'Ouro',
  pointsToNextTier: 260,
  progressPct: 83,
  streakDays: 21,
  appointmentsCount: 4,
  homeAdherencePct: 96,
};

const BADGES: Badge[] = [
  { id: 'primeira-consulta', name: 'Primeira consulta', unlocked: true },
  { id: 'vacinas-em-dia', name: 'Vacinas em dia', unlocked: true },
  { id: '7-dias', name: '7 dias seguidos', unlocked: true },
  { id: '21-dias', name: '21 dias seguidos', unlocked: true },
  { id: 'peso-ideal', name: 'Peso ideal', unlocked: true },
  { id: 'checkup-anual', name: 'Check-up anual', unlocked: false },
  { id: '60-dias', name: '60 dias seguidos', unlocked: false },
  { id: 'castracao', name: 'Castração', unlocked: false },
  { id: 'tier-ouro', name: 'Tier Ouro', unlocked: false },
];

const loadTasks = async (): Promise<CareTask[]> => {
  try {
    const strList = await AsyncStorage.getItem(TASKS_KEY);
    if (strList != null) return JSON.parse(strList);
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(initialTasks));
    return initialTasks;
  } catch (err: any) {
    console.log('Erro ao carregar itens do plano: ' + err.message);
    return initialTasks;
  }
};

const saveTasks = (tasks: CareTask[]) => {
  AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

const loadScore = async (): Promise<CareScore> => {
  try {
    const str = await AsyncStorage.getItem(SCORE_KEY);
    if (str != null) return JSON.parse(str);
    await AsyncStorage.setItem(SCORE_KEY, JSON.stringify(initialScore));
    return initialScore;
  } catch (err: any) {
    console.log('Erro ao carregar pontuação: ' + err.message);
    return initialScore;
  }
};

const saveScore = (score: CareScore) => {
  AsyncStorage.setItem(SCORE_KEY, JSON.stringify(score));
};

const getPlan = async (_petId: string): Promise<CarePlan> => {
  const tasks = await loadTasks();
  return { ...CARE_PLAN_INFO, tasks };
};

const toggleTask = async (taskId: string): Promise<void> => {
  const tasks = await loadTasks();
  const newTasks = tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task));
  saveTasks(newTasks);
};

const confirmCheckIn = async (params: { interpretation: CheckInInterpretation }): Promise<CheckInResult> => {
  const tasks = await loadTasks();
  const task = tasks.find((t) => t.id === DOSE_RANGE_TASK_ID);
  const now = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date());
  return resolveCheckIn({
    prescription: REFERENCE_PRESCRIPTION,
    signals: deriveSignals(params.interpretation),
    confirmedAtLabel: `Condição confirmada por você às ${now}.`,
    points: task?.points ?? 20,
  });
};

// Sinal global garante que resolveCheckIn sempre devolve ESCALATION aqui.
const getEscalationPreview = async (): Promise<CheckInEscalationResult> => {
  return resolveCheckIn({
    prescription: REFERENCE_PRESCRIPTION,
    signals: ['SANGUE_NAS_FEZES'],
    confirmedAtLabel: '',
    points: 0,
  }) as CheckInEscalationResult;
};

// Marca uma tarefa especifica como concluida (fim do fluxo narrado, que
// resolve uma tarefa por vez) e credita os pontos dela.
const completeCheckInTask = async (taskId: string): Promise<void> => {
  const [tasks, score] = await Promise.all([loadTasks(), loadScore()]);
  const task = tasks.find((t) => t.id === taskId);
  if (task && !task.completed) {
    saveScore({ ...score, totalPoints: score.totalPoints + task.points, pointsToday: score.pointsToday + task.points });
  }
  saveTasks(tasks.map((t) => (t.id === taskId ? { ...t, completed: true } : t)));
};

const getScore = async (_petId: string): Promise<CareScore> => {
  return loadScore();
};

const getBadges = async (_petId: string): Promise<Badge[]> => {
  return BADGES;
};

export {
  getPlan,
  toggleTask,
  confirmCheckIn,
  getEscalationPreview,
  completeCheckInTask,
  getScore,
  getBadges,
};
