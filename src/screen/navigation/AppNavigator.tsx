import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme, useNavigationContainerRef } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { AuthContext } from '../../context/authContext';
import { useSessionBootstrap } from '../../control/authControl';
import { useNotificationRouting } from '../../control/useNotificationRouting';
import type { NotificationDestination } from '../../model/notification';
import { makeStyles, useTheme } from '../../styles/useTheme';
import { AuthStack } from './AuthStack';
import { TutorTabs } from './TutorTabs';
import { VetTabs } from './VetTabs';
import type { TutorTabParamList } from './types';

export function AppNavigator() {
  const { session, setSession } = useContext(AuthContext);
  const sessaoSalva = useSessionBootstrap();
  const { colors, scheme } = useTheme();
  const styles = useStyles();

  // O React Navigation pinta cabeçalhos, fundos e bordas com o próprio tema: ele recebe a paleta do app.
  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.action,
        background: colors.background,
        card: colors.surface,
        text: colors.textPrimary,
        border: colors.border,
      },
    };
  }, [colors, scheme]);
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} onReady={() => setNavegacaoPronta(true)} theme={navigationTheme}>
      {!session ? <AuthStack /> : session.perfil === 'VET' ? <VetTabs /> : <TutorTabs />}
    </NavigationContainer>
  );
}

const useStyles = makeStyles((colors) => ({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
