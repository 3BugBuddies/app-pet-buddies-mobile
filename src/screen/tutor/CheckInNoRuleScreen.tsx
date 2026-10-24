import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { Button } from '../../component/ui/Button';
import type { PlanoTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';

import { useTabBarSpace } from '../navigation/useTabBarSpace';
type Props = NativeStackScreenProps<PlanoTabParamList, 'CheckInNoRule'>;

export function CheckInNoRuleScreen({ route }: Props) {
  const { petId, narrative } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PlanoTabParamList>>();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: tabBarSpace }]}>
      <CheckInTopBar title="Check-in" stepLabel="3 de 3" />

      <View style={styles.waitBlock}>
        <Image
          source={require('../../../assets/images/logo-cat-transparente.png')}
          style={styles.waitImage}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Sua veterinária vai ler este relato.</Text>
      <Text style={styles.body}>
        Nenhuma regra da prescrição cobre o que você contou. Nada muda na dose até a clínica responder.
      </Text>

      <View style={styles.quoteCard}>
        <Text style={styles.label}>Seu relato</Text>
        <Text style={styles.quote}>"{narrative}"</Text>
      </View>

      <Button
        label="Entendi · voltar ao plano"
        backgroundColor={colors.action}
        textColor={colors.textLight}
        onPress={() => navigation.navigate('CarePlan', { petId })}
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
  waitBlock: {
    backgroundColor: '#DCEFFD',
    borderRadius: radii.lg,
    padding: 20,
    alignItems: 'center',
  },
  waitImage: {
    width: 150,
    height: 150,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textPrimary,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  quoteCard: {
    backgroundColor: colors.cardMax,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  quote: {
    fontSize: 15,
    lineHeight: 20,
    fontStyle: 'italic',
    color: colors.textPrimary,
  },
});
