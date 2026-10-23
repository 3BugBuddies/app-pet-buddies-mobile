import { StackActions } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { VetTabParamList } from './types';

// Abre o fechamento sobre a stack de Pacientes limpa, sem restos de uma ficha ou fluxo anterior.
export function openClosing(
  tabs: BottomTabNavigationProp<VetTabParamList>,
  params: { petId: string; consultaId?: string }
) {
  const patients = tabs.getState().routes.find((route) => route.name === 'PacientesTab');
  if (patients?.state?.key) {
    tabs.dispatch({ ...StackActions.popToTop(), target: patients.state.key });
  }
  tabs.navigate('PacientesTab', { screen: 'ProntuarioForm', params, initial: false });
}
