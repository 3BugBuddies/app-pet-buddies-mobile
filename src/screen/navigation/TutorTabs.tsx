import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePets } from '../../control/usePetsControl';
import { colors, radii } from '../../styles/theme';
import { AgendaTabStack } from './tutor-tabs/AgendaTabStack';
import { HomeTabStack } from './tutor-tabs/HomeTabStack';
import { PetTabStack } from './tutor-tabs/PetTabStack';
import { PlanoTabStack } from './tutor-tabs/PlanoTabStack';
import type { TutorTabParamList } from './types';
import { TAB_BAR_HEIGHT, useTabBarBottom } from './useTabBarSpace';

const Tab = createBottomTabNavigator<TutorTabParamList>();

export function TutorTabs() {
  const { data: pets } = usePets();
  const petName = pets?.[0]?.nome ?? 'Pet';
  const tabBarBottom = useTabBarBottom();

  return (
    <Tab.Navigator
      // A barra flutua: o recuo do safe-area dentro dela empurrava os rótulos para fora.
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.action,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [
          styles.tabBar,
          { bottom: tabBarBottom }
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
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('PlanoTab', { screen: 'CarePlan' });
          },
        })}
        options={{
          tabBarLabel: 'Cuidados',
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
    height: TAB_BAR_HEIGHT,
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