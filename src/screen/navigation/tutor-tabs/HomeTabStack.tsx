import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeTutorScreen } from '../../tutor/HomeTutorScreen';
import { PataSeguraScreen } from '../../tutor/PataSeguraScreen';
import { MinhaContaScreen } from '../../tutor/MinhaContaScreen';
import { TrocarSenhaScreen } from '../../tutor/TrocarSenhaScreen';
import type { HomeTabParamList } from '../types';

const Stack = createNativeStackNavigator<HomeTabParamList>();

export function HomeTabStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeTutor" component={HomeTutorScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PataSegura" component={PataSeguraScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MinhaConta" component={MinhaContaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TrocarSenha" component={TrocarSenhaScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
