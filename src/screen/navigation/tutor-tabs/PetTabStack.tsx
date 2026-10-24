import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { PetProfileScreen } from '../../tutor/PetProfileScreen';
import { MeusPetsScreen } from '../../tutor/MeusPetsScreen';
import { NovoPetScreen } from '../../tutor/NovoPetScreen';
import { colors } from '../../../styles/theme';
import type { PetTabParamList } from '../types';

const Stack = createNativeStackNavigator<PetTabParamList>();

export function PetTabStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PetProfile"
        component={PetProfileScreen}
        options={({ navigation }) => ({
          title: 'Perfil',
          headerTitleAlign: 'center',
          headerBackVisible: false,
          headerLeft: () => (
            <View style={styles.headerLeft}>
              {navigation.canGoBack() && (
                <Pressable onPress={navigation.goBack} hitSlop={8}>
                  <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
              )}
              <Image
                source={require('../../../../assets/images/logo-header-principal-trasparente.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          ),
        })}
      />
      <Stack.Screen name="MeusPets" component={MeusPetsScreen} options={{ title: 'Meus Pets' }} />
      <Stack.Screen
        name="NovoPet"
        component={NovoPetScreen}
        options={({ route }) => ({ title: route.params?.petId ? 'Editar pet' : 'Novo pet' })}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 76, height: 38 },
});
