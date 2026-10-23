import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AgendaClinicaScreen } from '../../vet/AgendaClinicaScreen';
import { AtenderAgoraScreen } from '../../vet/AtenderAgoraScreen';
import type { HojeTabParamList } from '../types';

const Stack = createNativeStackNavigator<HojeTabParamList>();

export function HojeTabStack() {
  return (
    <Stack.Navigator screenOptions={{ headerBackTitle: 'Voltar' }}>
      <Stack.Screen
        name="AgendaClinica"
        component={AgendaClinicaScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AtenderAgora"
        component={AtenderAgoraScreen}
        options={{ title: 'Atender agora', headerBackTitle: 'Hoje', headerShadowVisible: false }}
      />
    </Stack.Navigator>
  );
}
