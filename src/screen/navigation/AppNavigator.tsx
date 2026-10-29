import { useCallback, useContext, useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, useNavigationContainerRef } from '@react-navigation/native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthContext } from '../../context/authContext';
import { useSessionBootstrap } from '../../control/authControl';
import { useNotificationRouting } from '../../control/useNotificationRouting';
import type { NotificationDestination } from '../../model/notification';
import { AuthStack } from './AuthStack';
import { TutorTabs } from './TutorTabs';
import { VetTabs } from './VetTabs';
import type { TutorTabParamList } from './types';

export function AppNavigator() {
  const { session, setSession } = useContext(AuthContext);
  const sessaoSalva = useSessionBootstrap();
  const navigationRef = useNavigationContainerRef<TutorTabParamList>();
  const [navegacaoPronta, setNavegacaoPronta] = useState(false);

  // Toque na notificação de consulta leva o tutor à aba Agenda.
  const abrirDestino = useCallback(
    (destino: NotificationDestination) => {
      if (destino === 'AGENDA_TUTOR') navigationRef.navigate('AgendaTab', { screen: 'AgendamentoTutor' });
    },
    [navigationRef]
  );
  useNotificationRouting(navegacaoPronta && session?.perfil === 'TUTOR', abrirDestino);

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
    <NavigationContainer ref={navigationRef} onReady={() => setNavegacaoPronta(true)} theme={DefaultTheme}>
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
