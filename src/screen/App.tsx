import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './navigation/AppNavigator';
import { AuthContext } from '../context/authContext';
import type { AuthSession } from '../model/session';
import { SessionExpiredModal } from '../component/auth/SessionExpiredModal';
import { initNotifications } from '../repository/notificationService';
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

  useEffect(() => {
    initNotifications();
  }, []);
  const [fontsLoaded] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    Inter_400Regular,
    Inter_500Medium,
  });
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF8400" />
      </View>
    );
  }
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            session,
            setSession,
            clearSession: () => setSession(null),
          }}
        >
          <AppNavigator />
          <SessionExpiredModal />
          <StatusBar style="auto" />

        </AuthContext.Provider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
