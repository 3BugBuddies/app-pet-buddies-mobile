import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../ui/Button';
import { petArticle } from '../../model/pet';
import { colors, radii, spacing } from '../../styles/theme';
import { useTabBarSpace } from '../../screen/navigation/useTabBarSpace';

interface NoPlanStateProps {
  petName: string;
  petSex?: string | null;
  onSchedule?: () => void;
}

export function NoPlanState({ petName, petSex, onSchedule }: NoPlanStateProps) {
  const tabBarSpace = useTabBarSpace();
  const article = petArticle(petSex);
  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: tabBarSpace }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>{`Cuidados ${article} ${petName}`}</Text>
      <View style={styles.card}>
        <Image
          source={require('../../../assets/images/tarsila-curiosa.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>{`O plano ${article} ${petName} ainda não foi criado.`}</Text>
        <Text style={styles.body}>
          Ele nasce na consulta: a clínica monta o preventivo ou a veterinária prescreve um tratamento.
        </Text>
      </View>
      {onSchedule ? (
        <Button
          label="Agendar consulta"
          backgroundColor={colors.action}
          textColor={colors.textLight}
          onPress={onSchedule}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  header: {
    fontFamily: 'Sora',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: `${colors.action}1A`,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  image: { width: 176, height: 150 },
  title: {
    fontFamily: 'Sora',
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: { fontFamily: 'Inter', fontSize: 15, lineHeight: 22, color: colors.textSecondary, textAlign: 'center' },
});
