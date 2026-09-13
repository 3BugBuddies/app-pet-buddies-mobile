import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { HeroCard } from '../../component/pet-profile/HeroCard';
import { InfoTintCard } from '../../component/pet-profile/InfoTintCard';
import { StatsRow } from '../../component/pet-profile/StatsRow';
import { VaccineListCard } from '../../component/pet-profile/VaccineListCard';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useLogoutControl } from '../../control/authControl';
import { usePet, usePetProfileDetails, usePets } from '../../control/usePetsControl';
import type { PetTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../styles/theme';

type Props = NativeStackScreenProps<PetTabParamList, 'PetProfile'>;

export function PetProfileScreen({ route }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<PetTabParamList>>();
  const insets = useSafeAreaInsets();
  const { sair } = useLogoutControl();
  const { data: pets, isLoading: isLoadingPets, isError: isPetsError } = usePets();
  const petId = route.params?.petId ?? pets?.[0]?.id ?? '';
  const { data: pet, isLoading: isLoadingPet, isError: isPetError } = usePet(petId);
  const { data: profile, isLoading: isLoadingProfile, isError: isProfileError } =
    usePetProfileDetails(petId);

  if (isLoadingPets || isLoadingPet || isLoadingProfile) {
    return <LoadingIndicator label="Carregando o perfil..." />;
  }

  if (isPetsError || isPetError || isProfileError || !pet || !profile || !petId) {
    return <LoadingIndicator label="Não foi possível carregar o perfil." />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 80 }]}>
      <Text style={styles.allPetsLink} onPress={() => navigation.navigate('MeusPets')}>
        Ver todos os pets
      </Text>

      <HeroCard
        petName={pet.nome}
        breedLabel={`${pet.raca} · ${profile.sexLabel}`}
        planStatusLabel={profile.planStatusLabel}
      />

      <StatsRow
        stats={[
          { label: 'Idade', value: profile.ageLabel },
          { label: 'Peso', value: profile.weightLabel },
          { label: 'Castrada', value: profile.neuteredLabel },
        ]}
      />

      <VaccineListCard vaccines={profile.vaccines} />

      <View style={styles.tintRow}>
        <InfoTintCard
          label="Alergias"
          value={profile.allergy ?? 'Nenhuma registrada'}
          subLabel="registrado pela vet"
          tone="alert"
        />
        <InfoTintCard
          label="Em casa"
          value={profile.homeInstruction}
          subLabel="orientação da vet"
          tone="casa"
        />
      </View>

      <Text style={styles.footnote}>
        Checklist mostra a orientação escrita pela vet em cada item. No check-in de tratamento
        você narra como foi; a IA só interpreta a narrativa — a dose vem sempre da faixa e das
        regras que a vet autorou.
      </Text>

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
  footnote: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    marginHorizontal: spacing.xs,
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
