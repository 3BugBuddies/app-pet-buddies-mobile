import { useContext, useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Appearance, ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthContext } from '../../context/authContext';
import { useSessionBootstrap } from '../../control/authControl';
import { AuthStack } from './AuthStack';
import { TutorTabs } from './TutorTabs';
import { VetTabs } from './VetTabs';

export function AppNavigator() {
  const { session, setSession } = useContext(AuthContext);
  const sessaoSalva = useSessionBootstrap();

  useEffect(() => {
    if (sessaoSalva.data) {
      setSession(sessaoSalva.data);
    }
  }, [sessaoSalva.data, setSession]);

  // Sem isso, reabrir o app com sessao salva mostra a AuthStack por 1 frame
  // antes do useEffect acima sincronizar o contexto e trocar pras abas.
  const hidratandoContexto = !!sessaoSalva.data && !session;

  if (sessaoSalva.isLoading || hidratandoContexto) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={Appearance.getColorScheme() === 'dark' ? DarkTheme : DefaultTheme}>
      {!session ? <AuthStack /> : session.perfil === 'VET' ? <VetTabs /> : <TutorTabs />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
