import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../auth/LoginScreen';
import { RegisterScreen } from '../auth/RegisterScreen';
import type { AuthStackParamList } from './types';
import OnboardingScreen from '../auth/OnboardingScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: true, title: 'Criar conta' }}
      />
    </Stack.Navigator>
  );
}
