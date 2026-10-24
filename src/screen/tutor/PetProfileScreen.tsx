import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { buildApiErrorMessage } from '../../control/apiErrorHelper';
import { HeroCard } from '../../component/pet-profile/HeroCard';
import { StatsRow } from '../../component/pet-profile/StatsRow';
import { TreatmentCard } from '../../component/pet-profile/TreatmentCard';
import { NoPetState } from '../../component/pet/NoPetState';
import { Button } from '../../component/ui/Button';
import { ErrorState } from '../../component/ui/ErrorState';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useActivePetId, useDeletePet, usePet, usePets } from '../../control/usePetsControl';
import { usePlanSummary } from '../../control/usePatientsControl';
import useMedicalRecordControl from '../../control/useMedicalRecordControl';
import { formatShortDate } from '../../model/formatDate';
import { speciesLabel, breedLabel, sexLabel } from '../../model/pet';
import type { PetTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';

import { useTabBarSpace } from '../navigation/useTabBarSpace';
type Props = NativeStackScreenProps<PetTabParamList, 'PetProfile'>;

function calcIdadeLabel(dataNascimento?: string | null): string {
  if (!dataNascimento) return 'Idade desconhecida';
  const nascimento = new Date(dataNascimento);
  if (isNaN(nascimento.getTime())) return 'Idade desconhecida';
  const hoje = new Date();
  const anos = hoje.getFullYear() - nascimento.getFullYear();
  const ajuste =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())
      ? 1
      : 0;
  const idadeAnos = anos - ajuste;
  if (idadeAnos < 1) {
    const meses =
      (hoje.getFullYear() - nascimento.getFullYear()) * 12 +
      (hoje.getMonth() - nascimento.getMonth());
    return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  }
  return `${idadeAnos} ${idadeAnos === 1 ? 'ano' : 'anos'}`;
}

export function PetProfileScreen({ route }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<PetTabParamList>>();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const { data: pets, isLoading: isLoadingPets, isError: isPetsError } = usePets();
  const { activePetId } = useActivePetId();
  const petId = route.params?.petId ?? activePetId ?? '';
  const { data: pet, isLoading: isLoadingPet, isError: isPetError } = usePet(petId);
  const { data: summary } = usePlanSummary(petId);
  const { registros, carregandoRegistros } = useMedicalRecordControl(petId);
  const deletePet = useDeletePet();

  const handleDelete = () => {
    Alert.alert(
      'Excluir Pet',
      `Tem certeza que deseja remover ${pet?.nome} do seu perfil?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePet.mutateAsync(petId);
              navigation.navigate('MeusPets');
            } catch (error: any) {
              Alert.alert('Erro ao excluir pet', buildApiErrorMessage(error));
            }
          },
        },
      ]
    );
  };

  if (deletePet.isPending) return <LoadingIndicator label="Excluindo pet..." />;

  if (isLoadingPets || isLoadingPet || carregandoRegistros) {
    return <LoadingIndicator label="Carregando o perfil..." />;
  }

  if (!petId && pets && pets.length === 0) {
    return (
      <View style={[styles.screen, styles.noPet, { paddingTop: Math.max(insets.top, 16) }]}>
        <NoPetState onRegister={() => navigation.navigate('NovoPet')} />
      </View>
    );
  }

  if (isPetsError || isPetError || !pet || !petId) {
    return (
      <ErrorState
        type="500"
        message="Não foi possível carregar o perfil deste pet."
        onRetry={() => navigation.navigate('MeusPets')}
        retryLabel="Voltar para Meus Pets"
      />
    );
  }

  const pesoLabel = pet.peso ? `${pet.peso.toString().replace('.', ',')} kg` : 'N/A';
  const idadeLabel = calcIdadeLabel(pet.dataNascimento);
  const inTreatment = summary?.category === 'TRATAMENTO' || summary?.category === 'POS_CIRURGICO';
  const castradoLabel = pet.castrado ? 'Sim' : 'Não';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 16), paddingBottom: tabBarSpace },
      ]}
    >
      <Text style={styles.allPetsLink} onPress={() => navigation.navigate('MeusPets')}>
        Ver todos os pets
      </Text>

      <HeroCard
        petName={pet.nome}
        breedLabel={`${breedLabel(pet.raca)} · ${speciesLabel(pet.especie).toLowerCase()} · ${sexLabel(pet.sexo).toLowerCase()}`}
        planStatusLabel="Perfil do pet"
        imageUrl={pet.foto}
      />

      <StatsRow
        stats={[
          { label: 'Idade', value: idadeLabel },
          { label: 'Peso', value: pesoLabel },
          { label: 'Castrado', value: castradoLabel },
        ]}
      />

      {inTreatment && summary?.treatmentName ? (
        <TreatmentCard name={summary.treatmentName} until={summary.endDate ? formatShortDate(summary.endDate) : null} />
      ) : null}

      <Text style={styles.sectionTitle}>Histórico</Text>

      {!registros || registros.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma consulta registrada.</Text>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {registros.map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <Text style={styles.recordDate}>{formatShortDate(record.dataAtendimento)}</Text>
              <View style={styles.recordText}>
                <Text style={styles.recordTitle}>Atendimento</Text>
                {record.tratamento ? (
                  <Text style={styles.recordBody} numberOfLines={1}>{record.tratamento}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ gap: spacing.md, marginTop: spacing.md }}>
        <Button
          label="Editar dados do Pet"
          variant="secondary"
          onPress={() => navigation.navigate('NovoPet', { petId })}
        />
        <Button
          label="Excluir Pet"
          variant="secondary"
          textColor={colors.error}
          onPress={handleDelete}
          loading={deletePet.isPending}
        />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  noPet: { padding: spacing.lg },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  allPetsLink: {
    alignSelf: 'flex-end',
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  recordCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  recordDate: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  recordText: {
    flex: 1,
    gap: 2,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  recordBody: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
