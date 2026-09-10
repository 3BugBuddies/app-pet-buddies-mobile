import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii } from '../../styles/theme';
import { HojeTabStack } from './vet-tabs/HojeTabStack';
import { PacientesTabStack } from './vet-tabs/PacientesTabStack';
import { ClinicaTabStack } from './vet-tabs/ClinicaTabStack';
import type { VetTabParamList } from './types';

const Tab = createBottomTabNavigator<VetTabParamList>();

export function VetTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary, // Azul Marinho ativado
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="HojeTab"
        component={HojeTabStack}
        options={{
          tabBarLabel: 'Hoje',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'today' : 'today-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PacientesTab"
        component={PacientesTabStack}
        options={{
          tabBarLabel: 'Pacientes',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ClinicaTab"
        component={ClinicaTabStack}
        options={{
          tabBarLabel: 'Protocolos',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={size} color={color} />
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