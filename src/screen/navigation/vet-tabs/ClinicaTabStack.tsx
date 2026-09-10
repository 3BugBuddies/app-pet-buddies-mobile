import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClinicaScreen } from '../../vet/ClinicaScreen';
import type { ClinicaTabParamList } from '../types';

const Stack = createNativeStackNavigator<ClinicaTabParamList>();

export function ClinicaTabStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Clinica" component={ClinicaScreen} options={{ title: 'Clínica' }} />
    </Stack.Navigator>
  );
}
