import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './navigation/AppNavigator';
import { AuthContext } from '../context/authContext';
import type { AuthSession } from '../model/session';

const queryClient = new QueryClient();

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);

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
          <StatusBar style="auto" />
        </AuthContext.Provider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
