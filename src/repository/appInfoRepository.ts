import Constants from 'expo-constants';
import type { AppInfo, BuildMeta } from '../model/appInfo';

const UNKNOWN_BUILD: BuildMeta = { commitHash: 'desconhecido', dirty: false, builtAt: '' };

// Lê o manifesto embutido no app (app.json + app.config.ts), resolvido na hora do build.
const getAppInfo = (): AppInfo => {
  const config = Constants.expoConfig;
  const build = (config?.extra?.build ?? {}) as Partial<BuildMeta>;
  return {
    version: config?.version ?? '',
    build: { ...UNKNOWN_BUILD, ...build },
  };
};

export { getAppInfo };
