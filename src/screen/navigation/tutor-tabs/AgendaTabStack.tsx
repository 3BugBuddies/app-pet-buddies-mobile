import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AgendamentoTutorScreen } from '../../tutor/AgendamentoTutorScreen';
import type { AgendaTabParamList } from '../types';

const Stack = createNativeStackNavigator<AgendaTabParamList>();

export function AgendaTabStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AgendamentoTutor"
        component={AgendamentoTutorScreen}
        options={{ title: 'Agenda' }}
      />
    </Stack.Navigator>
  );
}
