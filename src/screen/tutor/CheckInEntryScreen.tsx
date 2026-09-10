import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { NarrativeInput } from '../../component/checkin/NarrativeInput';
import { QuickChips } from '../../component/checkin/QuickChips';
import { Button } from '../../component/ui/Button';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { usePet } from '../../control/usePetsControl';
import type { PlanoTabParamList } from '../navigation/types';
import { colors, spacing } from '../../styles/theme';
import { interpretNarrative } from '../../model/careRules';

const QUICK_OPTIONS = ['Deu o remédio', 'Comeu bem', 'Comeu pouco', 'Evacuou', 'Fezes moles', 'Não evacuou'];

type Props = NativeStackScreenProps<PlanoTabParamList, 'CheckInEntry'>;

export function CheckInEntryScreen({ route }: Props) {
  const { petId } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PlanoTabParamList>>();
  const { data: pet, isLoading: isLoadingPet } = usePet(petId);
  const [narrative, setNarrative] = useState('');

  if (isLoadingPet) {
    return <LoadingIndicator label="Carregando check-in..." />;
  }

  if (!pet) {
    return <LoadingIndicator label="Pet não encontrado." />;
  }

  const handleContinue = () => {
    const interpretation = interpretNarrative(narrative);
    navigation.navigate('CheckInConfirm', { petId, narrative, interpretation });
  };

  const appendChip = (text: string) => {
    setNarrative((current) => (current.trim() ? `${current.trim()}. ${text}` : text));
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <CheckInTopBar title="Check-in" subtitle="Cuidados de hoje" stepLabel="1 / 3" />

        <View style={styles.headline}>
          <Text style={styles.h1}>Como {pet.nome} passou hoje?</Text>
          <Text style={styles.p}>
            Conte do seu jeito. A dose de hoje sai da regra que a vet escreveu.
          </Text>
        </View>

        <NarrativeInput
          value={narrative}
          onChangeText={setNarrative}
          placeholder="ex.: dei o remédio, mas ela comeu pouco e as fezes tavam moles"
        />

        <QuickChips options={QUICK_OPTIONS} onSelect={appendChip} />

        <Button
          label="Continuar"
          backgroundColor={colors.textPrimary}
          textColor={colors.textLight}
          disabled={!narrative.trim()}
          onPress={handleContinue}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  headline: {
    gap: spacing.xs,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 32,
    color: colors.textPrimary,
  },
  p: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textSecondary,
  },
});
