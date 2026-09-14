import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // <-- ADICIONE AQUI
import { usePets } from '../../control/usePetsControl';
import { colors, radii } from '../../styles/theme';
import { AgendaTabStack } from './tutor-tabs/AgendaTabStack';
import { HomeTabStack } from './tutor-tabs/HomeTabStack';
import { PetTabStack } from './tutor-tabs/PetTabStack';
import { PlanoTabStack } from './tutor-tabs/PlanoTabStack';
import type { TutorTabParamList } from './types';

const Tab = createBottomTabNavigator<TutorTabParamList>();

export function TutorTabs() {
  const { data: pets } = usePets();
  const petName = pets?.[0]?.nome ?? 'Pet';
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.action,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [
          styles.tabBar,
          { bottom: Math.max(insets.bottom, 16) + 16 }
        ],
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeTabStack}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PlanoTab"
        component={PlanoTabStack}
        options={{
          tabBarLabel: 'Evolucao',
          unmountOnBlur: true,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'time' : 'time-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AgendaTab"
        component={AgendaTabStack}
        options={{
          tabBarLabel: 'Agenda',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PetTab"
        component={PetTabStack}
        options={{
          tabBarLabel: petName,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'paw' : 'paw-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    height: 64,
    borderRadius: radii.pill,
    borderTopWidth: 0,
    backgroundColor: colors.surface,
    shadowColor: colors.surfaceDark,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  tabItem: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});