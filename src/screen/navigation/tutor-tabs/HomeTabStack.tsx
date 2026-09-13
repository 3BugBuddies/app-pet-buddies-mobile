import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeTutorScreen } from '../../tutor/HomeTutorScreen';
import { ScoreScreen } from '../../tutor/ScoreScreen';
import type { HomeTabParamList } from '../types';

const Stack = createNativeStackNavigator<HomeTabParamList>();

export function HomeTabStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeTutor" component={HomeTutorScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Score" component={ScoreScreen} options={{ title: 'Score e selos' }} />
    </Stack.Navigator>
  );
}
