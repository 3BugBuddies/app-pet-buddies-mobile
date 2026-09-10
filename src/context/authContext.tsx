import { createContext } from 'react';
import { AuthSession } from '../model/session';

interface Auth {
  session: AuthSession | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
}

const authVazio: Auth = {
  session: null,
  setSession: () => undefined,
  clearSession: () => undefined,
};

const AuthContext = createContext(authVazio);

export { AuthContext, Auth, authVazio };
