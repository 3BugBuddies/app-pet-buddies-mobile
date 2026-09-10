import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CarePlanScreen } from '../../tutor/CarePlanScreen';
import { CheckInEntryScreen } from '../../tutor/CheckInEntryScreen';
import { CheckInConfirmScreen } from '../../tutor/CheckInConfirmScreen';
import { CheckInResultScreen } from '../../tutor/CheckInResultScreen';
import { CheckInEscalationScreen } from '../../tutor/CheckInEscalationScreen';
import { CheckInNoRuleScreen } from '../../tutor/CheckInNoRuleScreen';
import { AssistantNoticeScreen } from '../../tutor/AssistantNoticeScreen';
import type { PlanoTabParamList } from '../types';

const Stack = createNativeStackNavigator<PlanoTabParamList>();

export function PlanoTabStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CarePlan" component={CarePlanScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="CheckInEntry"
        component={CheckInEntryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CheckInConfirm"
        component={CheckInConfirmScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CheckInResult"
        component={CheckInResultScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CheckInEscalation"
        component={CheckInEscalationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CheckInNoRule"
        component={CheckInNoRuleScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AssistantNotice"
        component={AssistantNoticeScreen}
        options={{ title: 'Tirar dúvidas' }}
      />
    </Stack.Navigator>
  );
}
