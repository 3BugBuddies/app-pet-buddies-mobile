import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PacientesScreen } from '../../vet/PacientesScreen';
import { DetalhesPetScreen } from '../../tutor/DetalhesPetScreen';
import { ProntuarioFormScreen } from '../../vet/ProntuarioFormScreen';
import { PlanoPacienteScreen } from '../../vet/PlanoPacienteScreen';
import { PrescricaoScreen } from '../../vet/PrescricaoScreen';
import { NovaRegraScreen } from '../../vet/NovaRegraScreen';
import { AssinarPrescricaoScreen } from '../../vet/AssinarPrescricaoScreen';
import type { PacientesTabParamList } from '../types';

const Stack = createNativeStackNavigator<PacientesTabParamList>();

export function PacientesTabStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Pacientes"
        component={PacientesScreen}
        options={{ title: 'Pacientes' }}
      />
      <Stack.Screen
        name="DetalhesPet"
        component={DetalhesPetScreen}
        options={{ title: 'Prontuário' }}
      />
      <Stack.Screen
        name="ProntuarioForm"
        component={ProntuarioFormScreen}
        options={{ title: 'Registrar atendimento' }}
      />
      <Stack.Screen
        name="PlanoPaciente"
        component={PlanoPacienteScreen}
        options={{ title: 'Plano do paciente' }}
      />
      <Stack.Screen
        name="Prescricao"
        component={PrescricaoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="NovaRegra" component={NovaRegraScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="AssinarPrescricao"
        component={AssinarPrescricaoScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
