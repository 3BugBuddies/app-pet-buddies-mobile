import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../ui/Button';
import { colors, spacing } from '../../styles/theme';

interface NoPlanStateProps {
  petName: string;
  onSchedule?: () => void;
}

export function NoPlanState({ onSchedule }: NoPlanStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>O plano nasce na consulta: a veterinária monta os cuidados e eles aparecem aqui.</Text>
      {onSchedule ? (
        <Button
          label="Agendar consulta"
          backgroundColor={colors.action}
          textColor={colors.textLight}
          onPress={onSchedule}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: spacing.md, padding: spacing.lg },
  title: {
    fontFamily: 'Sora',
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
