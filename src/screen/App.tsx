import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './navigation/AppNavigator';
import { AuthContext } from '../context/authContext';
import { ThemeContext } from '../context/themeContext';
import { useThemeControl } from '../control/useThemeControl';
import type { AuthSession } from '../model/session';
import { SessionExpiredModal } from '../component/auth/SessionExpiredModal';
import { cancelAllReminders, initNotifications } from '../repository/notificationService';
import { clearSession as clearStoredSession } from '../repository/authRepository';
import {
  useFonts,
  Sora_600SemiBold,
  Sora_700Bold
} from '@expo-google-fonts/sora';
import {
  Inter_400Regular,
  Inter_500Medium
} from '@expo-google-fonts/inter';
import { ActivityIndicator, View } from 'react-native';

const queryClient = new QueryClient();

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const { theme, ready: themeReady } = useThemeControl();

  useEffect(() => {
    initNotifications();
  }, []);
  const [fontsLoaded] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    Inter_400Regular,
    Inter_500Medium,
  });
  if (!fontsLoaded || !themeReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF8400" />
      </View>
    );
  }
  return (
    <SafeAreaProvider>
      <ThemeContext.Provider value={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            session,
            setSession,
            // Troca de conta no mesmo aparelho: nada do cache da sessão anterior pode sobrar.
            clearSession: () => {
              queryClient.clear();
              cancelAllReminders().catch(() => undefined);
              setSession(null);
              void clearStoredSession();
            },
          }}
        >
          <AppNavigator />
          <SessionExpiredModal />
          <StatusBar style="auto" />

        </AuthContext.Provider>
      </QueryClientProvider>
      </ThemeContext.Provider>
    </SafeAreaProvider>
  );
}
