import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { VaccineListCard } from '../../component/pet-profile/VaccineListCard';
import { Button } from '../../component/ui/Button';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import useMedicalRecordControl from '../../control/useMedicalRecordControl';
import { usePet, usePetProfileDetails } from '../../control/usePetsControl';
import type { PacientesTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';

type Props = NativeStackScreenProps<PacientesTabParamList, 'DetalhesPet'>;

type TabKey = 'HISTORICO' | 'VACINAS' | 'EXAMES' | 'PLANO';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'HISTORICO', label: 'Histórico' },
  { key: 'VACINAS', label: 'Vacinas' },
  { key: 'EXAMES', label: 'Exames' },
  { key: 'PLANO', label: 'Plano' },
];

export function DetalhesPetScreen({ route }: Props) {
  const { petId } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList>>();
  const { data: pet, isLoading: isLoadingPet, isError: isPetError } = usePet(petId);
  const { data: profile } = usePetProfileDetails(petId);
  const { registros: records, carregandoRegistros: isLoadingRecords } = useMedicalRecordControl(petId);
  const [activeTab, setActiveTab] = useState<TabKey>('HISTORICO');

  if (isLoadingPet) {
    return <LoadingIndicator label="Carregando o pet..." />;
  }

  if (isPetError || !pet) {
    return <LoadingIndicator label="Não foi possível carregar o pet." />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{pet.nome.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.heroText}>
          <Text style={styles.name}>{pet.nome}</Text>
          <Text style={styles.detail}>
            {pet.raca} · {profile?.sexLabel ?? pet.especie} · {profile?.ageLabel ?? '—'}
            {profile?.weightLabel ? ` · ${profile.weightLabel}` : ''}
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
          <Text style={styles.statLabel}>Alergia</Text>
          <Text style={styles.statValue}>{profile?.allergy ?? '—'}</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statLabel}>Última consulta</Text>
          <Text style={styles.statValue}>{records?.[0]?.dataAtendimento ?? '—'}</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={[styles.statValue, styles.statValueSuccess]}>—</Text>
          <Text style={styles.statLabel}>Adesão</Text>
        </View>
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
        profile ? (
          <VaccineListCard vaccines={profile.vaccines} />
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
