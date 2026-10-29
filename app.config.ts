/// <reference types="node" />
import { execSync } from 'node:child_process';
import type { ConfigContext, ExpoConfig } from 'expo/config';

// Roda um comando do git; devolve null se o git não existir ou o projeto não tiver .git
// (ex.: build em um ambiente que recebe só os arquivos).
const git = (args: string): string | null => {
  try {
    return execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || null;
  } catch {
    return null;
  }
};

// Identifica o código que gerou este app, para a tela "Sobre o app" provar qual commit foi publicado.
// No EAS Build o hash vem da variável do build; fora dele, do git local.
const commitHash = process.env.EAS_BUILD_GIT_COMMIT_HASH ?? git('rev-parse HEAD') ?? 'desconhecido';
const branch = git('rev-parse --abbrev-ref HEAD');
// Arquivos alterados e ainda não commitados: o app não corresponderia exatamente ao commit.
const dirty = (git('status --porcelain') ?? '') !== '';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  // name e slug sempre existem no app.json; o tipo do contexto só não sabe disso.
  name: config.name!,
  slug: config.slug!,
  extra: {
    ...config.extra,
    build: {
      commitHash,
      branch,
      dirty,
      builtAt: new Date().toISOString(),
    },
  },
});
