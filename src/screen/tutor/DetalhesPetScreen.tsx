import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { VaccineListCard } from '../../component/pet-profile/VaccineListCard';
import { Button } from '../../component/ui/Button';
import { ErrorState } from '../../component/ui/ErrorState';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import useMedicalRecordControl from '../../control/useMedicalRecordControl';
import { usePet, usePetProfileDetails } from '../../control/usePetsControl';
import { useProcedures } from '../../control/useProcedureControl';
import type { PetVaccine } from '../../model/care';
import type { PacientesTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';

type Props = NativeStackScreenProps<PacientesTabParamList, 'DetalhesPet'>;

type TabKey = 'HISTORICO' | 'VACINAS' | 'EXAMES' | 'PLANO';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'HISTORICO', label: 'Histórico' },
  { key: 'VACINAS', label: 'Vacinas' },
  { key: 'EXAMES', label: 'Exames' },
  { key: 'PLANO', label: 'Plano' },
];

function formatDataBR(dataISO?: string | null): string {
  if (!dataISO) return '—';
  const [ano, mes, dia] = dataISO.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

function calcIdadeLabel(dataNascimento?: string | null): string {
  if (!dataNascimento) return 'Idade desconhecida';
  const nascimento = new Date(dataNascimento);
  if (isNaN(nascimento.getTime())) return 'Idade desconhecida';
  const hoje = new Date();
  const anos = hoje.getFullYear() - nascimento.getFullYear();
  const ajuste = hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate()) ? 1 : 0;
  const idadeAnos = anos - ajuste;
  if (idadeAnos < 1) {
    const meses = (hoje.getFullYear() - nascimento.getFullYear()) * 12 +
      (hoje.getMonth() - nascimento.getMonth());
    return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  }
  return `${idadeAnos} ${idadeAnos === 1 ? 'ano' : 'anos'}`;
}

export function DetalhesPetScreen({ route }: Props) {
  const { petId } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList>>();
  const insets = useSafeAreaInsets();
  const { data: pet, isLoading: isLoadingPet, isError: isPetError } = usePet(petId);
  const { data: profile } = usePetProfileDetails(petId);
  const { data: procedimentos, isLoading: isLoadingProcedimentos } = useProcedures(petId);
  const { registros: records, carregandoRegistros: isLoadingRecords } = useMedicalRecordControl(petId);
  const [activeTab, setActiveTab] = useState<TabKey>('HISTORICO');

  const vaccinesList = useMemo((): PetVaccine[] => {
    if (!procedimentos) return [];
    return procedimentos
      .filter((p) => p.tipo === 'VACINACAO')
      .map((p) => {
        const aplicada = p.status === 'REALIZADO';
        const dataFormatada = formatDataBR(p.dataPrevistaInicio);
        return {
          id: p.id.toString(),
          name: p.nome,
          status: aplicada ? 'APPLIED' : 'SCHEDULED',
          dateLabel: `${dataFormatada} · ${aplicada ? 'aplicada' : 'agendada'}`,
        };
      });
  }, [procedimentos]);

  if (isLoadingPet || isLoadingProcedimentos) {
    return <LoadingIndicator label="Carregando o pet..." />;
  }

  if (isPetError || !pet) {
    return (
      <ErrorState
        type="500"
        message="Não foi possível carregar as informações do pet."
        onRetry={() => navigation.goBack()}
        retryLabel="Voltar"
      />
    );
  }

  const pesoLabel = pet.peso ? `${pet.peso.toString().replace('.', ',')} kg` : null;
  const idadeLabel = calcIdadeLabel(pet.dataNascimento);
  const castradoLabel = pet.castrado ? 'Sim' : 'Não';
  const breedLabel = `${pet.raca || pet.especie} · ${pet.sexo}`;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 80 }]}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{pet.nome.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.heroText}>
          <Text style={styles.name}>{pet.nome}</Text>
          <Text style={styles.detail}>
            {breedLabel} · {idadeLabel}
            {pesoLabel ? ` · ${pesoLabel}` : ''}
          </Text>
        </View>
        {profile ? (
          <View style={styles.weekTag}>
            <Text style={styles.weekTagText}>{profile.planStatusLabel}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statTile}>
          <Text style={styles.statLabel}>Idade</Text>
          <Text style={styles.statValue}>{idadeLabel}</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statLabel}>Castrado</Text>
          <Text style={styles.statValue}>{castradoLabel}</Text>
        </View>
        {/* Sprint 4: reativar Adesão quando a API fornecer a métrica
        <View style={styles.statTile}>
          <Text style={[styles.statValue, styles.statValueSuccess]}>—</Text>
          <Text style={styles.statLabel}>Adesão</Text>
        </View>
        */}
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tabChip, active && styles.tabChipActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === 'HISTORICO' ? (
        isLoadingRecords ? (
          <LoadingIndicator label="Carregando histórico..." />
        ) : !records || records.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum registro no prontuário ainda.</Text>
        ) : (
          <View style={styles.timeline}>
            {records.map((record) => (
              <View key={record.id} style={styles.timelineRow}>
                <View style={styles.timelineDotCol}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineLine} />
                </View>
                <View style={styles.timelineCard}>
                  <Text style={styles.timelineDate}>{record.dataAtendimento} · consulta</Text>
                  <Text style={styles.timelineTitle}>{record.diagnostico}</Text>
                  <Text style={styles.timelineBody}>{record.tratamento}</Text>
                  {record.observacao ? <Text style={styles.timelineBody}>{record.observacao}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        )
      ) : null}

      {activeTab === 'VACINAS' ? (
        vaccinesList.length > 0 ? (
          <VaccineListCard vaccines={vaccinesList} />
        ) : (
          <Text style={styles.emptyText}>Nenhuma vacina registrada.</Text>
        )
      ) : null}

      {activeTab === 'EXAMES' ? <Text style={styles.emptyText}>Nenhum exame registrado.</Text> : null}

      {activeTab === 'PLANO' ? (
        <View style={styles.planoCard}>
          <Text style={styles.planoText}>
            {profile?.homeInstruction ?? 'Sem orientação de plano registrada.'}
          </Text>
          <Button
            label="Ver plano completo"
            variant="secondary"
            onPress={() => navigation.navigate('PlanoPaciente', { petId })}
          />
        </View>
      ) : null}

      <Button
        label="Iniciar atendimento"
        onPress={() => navigation.navigate('ProntuarioForm', { petId })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  hero: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    backgroundColor: colors.cardMax,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  heroText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  detail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  weekTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: `${colors.success}1F`,
  },
  weekTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statValueSuccess: {
    color: colors.success,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tabChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textLight,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  timeline: {
    gap: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineDotCol: {
    alignItems: 'center',
    width: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.borderStrong,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 4,
  },
  timelineDate: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timelineBody: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  planoCard: {
    gap: spacing.sm,
  },
  planoText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});
