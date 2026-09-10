import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AgendaClinicaScreen } from '../../vet/AgendaClinicaScreen';
import type { HojeTabParamList } from '../types';

const Stack = createNativeStackNavigator<HojeTabParamList>();

export function HojeTabStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AgendaClinica"
        component={AgendaClinicaScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
