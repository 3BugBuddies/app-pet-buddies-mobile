import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PetProfileScreen } from '../../tutor/PetProfileScreen';
import { MeusPetsScreen } from '../../tutor/MeusPetsScreen';
import { NovoPetScreen } from '../../tutor/NovoPetScreen';
import type { PetTabParamList } from '../types';

const Stack = createNativeStackNavigator<PetTabParamList>();

export function PetTabStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PetProfile" component={PetProfileScreen} options={{ title: 'Perfil' }} />
      <Stack.Screen name="MeusPets" component={MeusPetsScreen} options={{ title: 'Meus Pets' }} />
      <Stack.Screen name="NovoPet" component={NovoPetScreen} options={{ title: 'Novo Pet' }} />
    </Stack.Navigator>
  );
}
