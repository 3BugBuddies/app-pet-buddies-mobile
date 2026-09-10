import { StyleSheet, Text, View } from 'react-native';

export function AgendamentoTutorScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Agendamento em construção</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: '#475569',
  },
});
