import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { buildApiErrorMessage } from '../../control/apiErrorHelper';
import { HeroCard } from '../../component/pet-profile/HeroCard';
import { InfoTintCard } from '../../component/pet-profile/InfoTintCard';
import { StatsRow } from '../../component/pet-profile/StatsRow';
import { VaccineListCard } from '../../component/pet-profile/VaccineListCard';
import { Button } from '../../component/ui/Button';
import { ErrorState } from '../../component/ui/ErrorState';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useLogoutControl } from '../../control/authControl';
import { useActivePetId, useDeletePet, usePet, usePets } from '../../control/usePetsControl';
import { useProcedures } from '../../control/useProcedureControl';
import useMedicalRecordControl from '../../control/useMedicalRecordControl';
import type { PetVaccine } from '../../model/care';
import type { PetTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';

type Props = NativeStackScreenProps<PetTabParamList, 'PetProfile'>;

function formatDataBR(dataISO?: string | null): string {
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

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
  const { sair } = useLogoutControl();
  const { data: pets, isLoading: isLoadingPets, isError: isPetsError } = usePets();
  const { activePetId } = useActivePetId();
  const petId = route.params?.petId ?? activePetId ?? '';
  const { data: pet, isLoading: isLoadingPet, isError: isPetError } = usePet(petId);
  const { data: procedimentos, isLoading: isLoadingProcedimentos } = useProcedures(petId);
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

  // Mapeia vacinas reais vindas da API
  const vaccinesList = (procedimentos || [])
    .filter((p) => p.tipo === 'VACINACAO')
    .map((p): PetVaccine => {
      const aplicada = p.status === 'REALIZADO';
      return {
        id: p.id.toString(),
        name: p.nome,
        status: aplicada ? 'APPLIED' : 'SCHEDULED',
        dateLabel: `${formatDataBR(p.dataPrevistaInicio)} • ${aplicada ? 'aplicada' : 'agendada'}`,
      };
    });

  if (deletePet.isPending) return <LoadingIndicator label="Excluindo pet..." />;

  if (isLoadingPets || isLoadingPet || isLoadingProcedimentos || carregandoRegistros) {
    return <LoadingIndicator label="Carregando o perfil..." />;
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
  const sexoLabel = pet.sexo === 'MACHO' ? 'Macho' : 'Fêmea';
  const castradoLabel = pet.castrado ? 'Sim' : 'Não';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 80 },
      ]}
    >
      <Text style={styles.allPetsLink} onPress={() => navigation.navigate('MeusPets')}>
        Ver todos os pets
      </Text>

      <HeroCard
        petName={pet.nome}
        breedLabel={`${pet.raca} · ${pet.especie} · ${sexoLabel}`}
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

      {vaccinesList.length > 0 && <VaccineListCard vaccines={vaccinesList} />}

      <View style={styles.tintRow}>
        <InfoTintCard
          label="Alergias"
          value={pet.alergia || 'Nenhuma registrada'}
          subLabel="histórico do pet"
          tone="alert"
        />
        <InfoTintCard
          label="Condição Crônica"
          value={pet.condicaoCronica ? 'Sim' : 'Não'}
          subLabel="histórico do pet"
          tone="casa"
        />
      </View>

      <Text style={styles.sectionTitle}>Histórico Clínico</Text>

      {!registros || registros.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma consulta registrada.</Text>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {registros.map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <Text style={styles.recordDate}>{formatDataBR(record.dataAtendimento)}</Text>
              <Text style={styles.recordTitle}>{record.diagnostico}</Text>
              <Text style={styles.recordBody}>{record.tratamento}</Text>
              {record.observacao ? (
                <Text style={styles.recordNote}>{record.observacao}</Text>
              ) : null}
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

      <Pressable style={styles.logoutButton} onPress={sair}>
        <Text style={styles.logoutText}>Sair da conta</Text>
      </Pressable>
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
  allPetsLink: {
    alignSelf: 'flex-end',
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  tintRow: {
    flexDirection: 'row',
    gap: spacing.md,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  recordDate: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 4,
  },
  recordBody: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  recordNote: {
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.textMuted,
    marginTop: 8,
  },
  logoutButton: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.error,
  },
});
