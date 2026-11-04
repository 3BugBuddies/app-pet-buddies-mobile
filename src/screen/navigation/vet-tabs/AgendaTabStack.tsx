import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AgendaSemanaScreen } from '../../vet/AgendaSemanaScreen';
import type { AgendaVetTabParamList } from '../types';

const Stack = createNativeStackNavigator<AgendaVetTabParamList>();

export function AgendaTabStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AgendaSemana" component={AgendaSemanaScreen} />
    </Stack.Navigator>
  );
}
