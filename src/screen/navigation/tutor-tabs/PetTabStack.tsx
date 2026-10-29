import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, View } from 'react-native';
import { PetProfileScreen } from '../../tutor/PetProfileScreen';
import { MeusPetsScreen } from '../../tutor/MeusPetsScreen';
import { NovoPetScreen } from '../../tutor/NovoPetScreen';
import { BrandMark } from '../../../component/ui/BrandMark';
import { makeStyles, useTheme } from '../../../styles/useTheme';
import type { PetTabParamList } from '../types';

const Stack = createNativeStackNavigator<PetTabParamList>();

export function PetTabStack() {
  const { colors } = useTheme();
  const styles = useStyles();
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
              <BrandMark />
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

const useStyles = makeStyles((colors) => ({
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
}));
