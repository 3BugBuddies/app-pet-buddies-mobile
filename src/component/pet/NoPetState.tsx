import { Image, StyleSheet, Text, View } from 'react-native';
import { Button } from '../ui/Button';
import { colors, radii, spacing } from '../../styles/theme';

interface NoPetStateProps {
  onRegister: () => void;
}

export function NoPetState({ onRegister }: NoPetStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require('../../../assets/images/amigos-tranparentes.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>Cadastre o primeiro pet para a clínica montar o plano.</Text>
        <Text style={styles.body}>Com o pet cadastrado, o plano preventivo aparece aqui.</Text>
      </View>
      <Button label="Cadastrar pet" backgroundColor={colors.action} textColor={colors.textLight} onPress={onRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  card: {
    backgroundColor: `${colors.action}1A`,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  image: { width: '100%', height: 150 },
  title: {
    fontFamily: 'Sora',
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: { fontFamily: 'Inter', fontSize: 15, lineHeight: 22, color: colors.textSecondary, textAlign: 'center' },
});
