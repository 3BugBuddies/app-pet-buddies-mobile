import type { ComponentProps } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii } from '../../styles/theme';
import { HojeTabStack } from './vet-tabs/HojeTabStack';
import { PacientesTabStack } from './vet-tabs/PacientesTabStack';
import type { VetTabParamList } from './types';

const Tab = createBottomTabNavigator<VetTabParamList>();

interface TabIconProps {
  name: ComponentProps<typeof Ionicons>['name'];
  color: string;
  size: number;
  focused: boolean;
}

// A pílula do item ativo fica atrás do ícone, não no item inteiro.
function TabIcon({ name, color, size, focused }: TabIconProps) {
  return (
    <View style={[styles.iconPill, focused && styles.iconPillActive]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

export function VetTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [styles.tabBar, { bottom: Math.max(insets.bottom, 16) }],
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
            <TabIcon name={focused ? 'today' : 'today-outline'} size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="PacientesTab"
        component={PacientesTabStack}
        options={{
          tabBarLabel: 'Pacientes',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name={focused ? 'people' : 'people-outline'} size={size} color={color} focused={focused} />
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
  // O contêiner do ícone tem largura fixa; padding aqui zerava a largura do ícone.
  iconPill: {
    width: 56,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  iconPillActive: {
    backgroundColor: colors.cardChia,
  },
  tabLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});