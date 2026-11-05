# Pet Buddies — Aplicativo Mobile (Sprint 4)

Aplicativo mobile desenvolvido em React Native / Expo para a plataforma **Clyvo Vet**, que conecta tutores de pets e veterinários em uma jornada contínua de cuidado animal. O app permite gerenciar consultas, planos de cuidado, check-ins clínicos e prontuários de forma integrada com o backend Java Spring.

---

## Integrantes do Grupo

| Nome | RM | Turma |
|------|-----|-------|
| Felipe Yuiti Ishii | 565339 | 2TDS Fevereiro |
| Gabriel Nogueira Peixoto | 563925 | 2TDS Fevereiro |
| Giovanna Neri dos Santos | 566154 | 2TDS Fevereiro |
| Mariana Inoue | 565834 | 2TDS Fevereiro |

---

## Links da Entrega

| Item | Link |
|------|------|
| Vídeo de apresentação da Sprint 4 (YouTube) | [Assistir](https://youtu.be/n4j2Izv2WmQ) |
| App publicado (Firebase App Distribution) | [Baixar o APK](https://appdistribution.firebase.google.com/testerapps/1:457611068502:android:938edafa9299e8693e27f7/releases/7qhonf9cnl228) |
| Backend (API Java Spring) | `https://petbuddies-java-rm563925.azurewebsites.net/api` |
| Vídeos da Sprint 3 (YouTube) | [Apresentação](https://youtu.be/EoOUXdXF3Ow) · [Demonstração](https://youtu.be/LHx-mDUD38M) |

A aba **Sobre** mostra o hash do commit da versão instalada. Veja [Rastreabilidade da versão publicada](#rastreabilidade-da-versão-publicada).

---

## Problema e Solução

Tutores de pets com condições crônicas frequentemente não sabem quando e como administrar medicamentos, e veterinários não têm visibilidade sobre a adesão do paciente entre consultas. O **Pet Buddies** resolve isso oferecendo:

- **Para o tutor**: plano de cuidado personalizado, check-in diário inteligente com dose calculada automaticamente, agenda de consultas, lembretes e histórico do pet
- **Para o veterinário**: agenda e painel de pacientes em acompanhamento, registro de prontuários, criação de planos e prescrições com regras de dose adaptativas

---

## Funcionalidades

### Perfil Tutor

| Funcionalidade | Integração |
|----------------|-----------|
| Cadastro, login e sessão persistida | API Java (`/auth/registro`, `/auth/login`) |
| Minha conta: editar perfil, trocar senha e sair | API Java (`/responsavel`, `/auth/senha`) |
| Pets: cadastrar, editar, listar e excluir | API Java (`/animal`) |
| Agendar consulta (dias e horários livres do veterinário) | API Java (`/consulta/agendamento`, `/janela-atendimento`) |
| Plano de cuidado (aba Cuidados): tratamento, semana e histórico | API Java (`/motor/plano`) |
| Check-in diário por texto ou voz, com a dose calculada pelas regras da receita | API Java (`/checkin/extracao`, `/checkin`) |
| Pata Segura: saldo de pontos (soma dos pets) e extrato com os pontos de cada consulta | API Java (`/pontuacao/saldo`, `/pontuacao/extrato`) |
| Notificação ao agendar e lembretes 2 h, 1 h e 30 min antes da consulta | Local (`expo-notifications`) |
| Tema claro, escuro ou automático | Local |

### Perfil Veterinário

| Funcionalidade | Integração |
|----------------|-----------|
| Hoje: agenda do dia e atendimento imediato (sem agenda) | API Java (`/consulta`) |
| Agenda da semana com horários livres e ocupados | API Java (`/janela-atendimento`) |
| Lista de pacientes e plano de cuidado de cada paciente | API Java (`/animal`, `/motor/plano`) |
| Prontuário, com a evolução do animal (Melhorou, Estável ou Piorou), receita (por texto, voz ou receita-modelo), regras de dose, assinatura e fechamento do atendimento | API Java (`/registro-atendimento`, `/prescricao`, `/receita-modelo`, `/condicao-clinica`, `/consulta/{id}/fechamento`) |
| Pontos do atendimento concluído (aviso de envio e, com a chave de detalhe, quanto o responsável ganhou) | API Java (`/pontuacao/consulta/{id}/memoria`) |

---

## Requisitos da Sprint 4

| Requisito | Onde está no app |
|-----------|------------------|
| Telas funcionais | 28 telas (3 de autenticação, 15 do tutor, 9 do veterinário e 1 compartilhada); as que exibem ou gravam dados usam a API Java |
| Publicação | Firebase App Distribution (link acima) e aba **Sobre** com o hash do commit |
| Notificações | Local: confirmação ao agendar e lembretes 2 h, 1 h e 30 min antes; o toque abre a aba Agenda |
| Arquitetura | `model` / `repository` / `control` / `screen`, sem chamada HTTP nas telas |
| Tema claro/escuro | Automático, Claro ou Escuro, escolhido na aba **Sobre** |

---

## Tecnologias

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| React Native | 0.88.1 | Framework mobile |
| Expo | ~58.0.23 | Toolchain e build |
| TypeScript | ~6.0.3 | Tipagem estática |
| TanStack Query | ^5.102.8 | Estado e cache de API (`useQuery` / `useMutation`) |
| React Navigation | ^7 | Navegação (Bottom Tabs + Native Stack) |
| Axios | ^1.20.0 | Cliente HTTP, com interceptors |
| Yup | ^1.7.1 | Validação de formulários |
| expo-secure-store | ~58.0.2 | Sessão do usuário (token) |
| expo-notifications | ~58.1.8 | Notificações locais |
| expo-audio | ~58.0.11 | Gravação de voz (check-in e receita) |
| AsyncStorage | 2.2.0 | Preferência de tema |

**Backend:** API Java Spring (HATEOAS) em `https://petbuddies-java-rm563925.azurewebsites.net/api`

---

## Arquitetura do Projeto

```
src/
├── component/          # Componentes de UI reutilizáveis, por área (ui, home, care-plan, checkin, closing…)
├── control/            # Lógica de negócio em hooks (TanStack Query, formulários, tema, notificações)
├── model/              # Tipos, schemas de validação (Yup) e regras puras
├── repository/         # Acesso a dados: API (Axios), SecureStore, AsyncStorage, notificações
├── context/            # Contextos React (AuthContext, ThemeContext)
├── screen/             # Telas
│   ├── auth/           # Onboarding, Login, Cadastro
│   ├── tutor/          # Telas do perfil Tutor
│   ├── vet/            # Telas do perfil Veterinário
│   ├── shared/         # Aba Sobre (os dois perfis)
│   └── navigation/     # Rotas, abas e stacks
└── styles/             # Tema (paletas clara e escura, espaçamentos, tipografia) e hooks de tema
```

As telas só renderizam e chamam hooks de `control/`. Os hooks de `control/` usam as funções de `repository/`, que são as únicas a conversar com a API.

---

## Autenticação

1. O login e o cadastro usam a API Java; a sessão (token JWT e dados do perfil) é guardada no **SecureStore** (armazenamento criptografado do aparelho)
2. Ao abrir o app, a sessão salva é lida: se existe, o usuário vai direto às abas, sem tela de login
3. As rotas são protegidas pelo navegador: sem sessão só existe a pilha de autenticação, e o perfil define as abas (Tutor ou Veterinário)
4. Todas as chamadas à API levam o token via interceptor do Axios. Uma resposta 401 mostra o aviso de sessão expirada e leva ao login
5. Sair da conta apaga a sessão, o cache de dados e os lembretes agendados

---

## Notificações

- **Evento gerador:** o tutor confirma o agendamento de uma consulta
- **Na hora:** "Consulta agendada · *pet*", com o motivo, o dia e o horário
- **Lembretes:** 2 h, 1 h e 30 min antes da consulta, cada um com "Faltam …". Só são agendados os que ainda cabem: uma consulta daqui a 90 min ganha os de 1 h e 30 min, e uma daqui a menos de 30 min recebe só a confirmação. A frase da confirmação ("Vamos te lembrar …") lista apenas os lembretes que existem
- **Toque na notificação:** abre a aba **Agenda** do tutor, com o app aberto, em segundo plano ou fechado
- Ao sair da conta, os lembretes agendados são cancelados, para não chegarem à próxima conta usada no aparelho

---

## Tema claro e escuro

O app tem duas paletas. Na aba **Sobre → Aparência** o usuário escolhe **Automático** (segue o tema do aparelho), **Claro** ou **Escuro**. A escolha fica salva no aparelho.

---

## Rastreabilidade da versão publicada

A aba **Sobre** (presente nos dois perfis) mostra a versão, o **hash do commit** e a data de geração do build. Esses dados são gravados na hora do build por `app.config.ts`.

Para o app publicado corresponder exatamente ao código entregue: gerar o build a partir de uma árvore **sem alterações pendentes** (`git status` limpo). Se o build sair com alterações não commitadas, a tela avisa.

**APK entregue:** foi gerado a partir do commit `faa8e0f`, o mesmo hash que a aba **Sobre** mostra. Os commits seguintes na `main` alteram apenas o `README.md` (contas de teste, links da entrega e a lista de funcionalidades), sem mudar o código do app.

---

## Inteligência Artificial no app

O app usa IA em dois pontos, alinhados ao componente de IA da disciplina *Disruptive Architectures*:

| Recurso | Como funciona |
|---------|---------------|
| **Transcrição de voz** (check-in do tutor e receita do veterinário) | O áudio gravado com `expo-audio` é enviado por HTTP à API de transcrição Whisper da Groq (`whisper-large-v3-turbo`), e o texto volta para o formulário |
| **Extração de dados do texto** | O texto narrado vira campos estruturados (medicamento, dose, frequência, duração, regras). A extração principal é feita pelo servidor Java (`/checkin/extracao`, `/prescricao/rascunho`); o app tem um extrator local (`prescriptionExtractor.ts`) como alternativa quando o servidor não consegue interpretar o texto |

Não foi adicionada nenhuma biblioteca de IA ao app: a transcrição é uma chamada HTTP comum, e a gravação usa o `expo-audio`.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) **22.13 ou superior** (testado com 24)
- Expo Go compatível com o **SDK 58** instalado no dispositivo, **ou** emulador Android/iOS configurado

---

## Como Executar

```bash
# 1. Clone o repositório
git clone https://github.com/3BugBuddies/app-pet-buddies-mobile.git
cd app-pet-buddies-mobile

# 2. Instale as dependências
npm install

# 3. (Opcional) crie o arquivo de variáveis de ambiente
cp .env.example .env

# 4. Inicie o servidor de desenvolvimento
npx expo start
```

Com o servidor rodando:
- **Dispositivo físico**: escaneie o QR Code com o app **Expo Go**
- **Emulador Android**: pressione `a`
- **Emulador iOS**: pressione `i`

Para checar os tipos: `npx tsc --noEmit`.

### Variáveis de ambiente (opcionais)

| Variável | Para que serve |
|----------|----------------|
| `EXPO_PUBLIC_API_BASE_URL` | URL da API. Sem ela, o app usa a API de produção (Azure) |
| `EXPO_PUBLIC_GROQ_API_KEY` | Chave da Groq para a transcrição de voz. Sem ela, o botão de voz avisa que a transcrição não está configurada e o texto pode ser digitado |
| `EXPO_PUBLIC_PONTOS` | Liga as telas de pontos. `api` lê saldo, extrato e memória de cálculo do Java. Sem ela, a tela Pata Segura mostra "Em breve" |
| `EXPO_PUBLIC_PONTOS_DETALHE` | `on` mostra o detalhe do cálculo: o "O que contou" em cada consulta do extrato do tutor e quanto o responsável ganhou no atendimento concluído do vet. Precisa do MongoDB do .NET configurado; sem a chave, o extrato mostra só o total de cada consulta e o vet vê só "Pontos enviados" |

> As variáveis `EXPO_PUBLIC_*` são embutidas no app na hora do build. Use uma chave da Groq que possa ser revogada.
>
> O `.env` está no `.gitignore` e não vai para o build na nuvem. No `eas.json`, os perfis `preview` e `production` já definem `EXPO_PUBLIC_API_BASE_URL` e `EXPO_PUBLIC_PONTOS=api`. A chave da Groq **não** fica no `eas.json`, que vai para o git: cadastre-a como variável do EAS (`eas env:set --name EXPO_PUBLIC_GROQ_API_KEY --environment preview --visibility sensitive`, ou pelo site do Expo), no ambiente do perfil que for gerar o APK. Sem ela, a transcrição de voz fica indisponível no APK.

### Gerar o APK

```bash
eas build --platform android --profile preview
```

---

## Telas Disponíveis

**Autenticação:** Onboarding · Login · Cadastro

**Tutor (5 abas):**
- **Início:** resumo do pet ativo, próxima consulta, tarefas do dia, Pata Segura, Minha conta
- **Cuidados:** plano de cuidado, check-in por texto ou voz, resultado da dose
- **Agenda:** próxima consulta e agendamento de nova consulta
- **Pet:** lista de pets, perfil, cadastro, edição e exclusão
- **Sobre:** para que serve o app, versão e hash do commit, equipe, aparência e créditos

**Veterinário (4 abas):**
- **Hoje:** agenda do dia, atendimento imediato, prontuário com a evolução do animal e prescrição com regras de dose
- **Agenda:** semana com horários livres e ocupados
- **Pacientes:** lista de pacientes em acompanhamento e plano do paciente
- **Sobre:** a mesma tela do tutor (versão e hash do commit, equipe, aparência e créditos)

### Telas da Sprint 3 que mudaram na Sprint 4

| Tela da Sprint 3 | O que aconteceu | Onde está agora |
|---|---|---|
| `ScoreScreen` (pontos e selos) | Era uma tela sem backend. Foi trocada pela versão ligada à API de pontuação | `PataSeguraScreen` (saldo e extrato) |
| `NovaRegraScreen` (nova regra de dose) | Foi incorporada à prescrição, para o vet cadastrar a regra sem sair do fluxo | `PrescricaoScreen` (`useNovaRegraControl`) |
| `AssistantNoticeScreen` (aviso antes do check-in) | Foi retirada: levava a uma conversa com o assistente que não existe e seus botões eram só avisos de "em breve". O encaminhamento para a clínica continua no app, com ligação de verdade | `CheckInEscalationScreen` (botão "Ligar para a clínica") |

---

## Perfil teste

Contas de teste para avaliar o app instalado, uma de cada perfil:

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Tutor | maria@email.com | petbuddies123 |
| Veterinário | ana@email.com | petbuddies123 |

---

## Observações Técnicas

- **Pata Segura (pontuação):** o tutor vê o saldo, que soma todos os pets dele, e o extrato, com os pontos de cada consulta. O "O que contou" (as parcelas do cálculo) fica escondido e só aparece com `EXPO_PUBLIC_PONTOS_DETALHE=on`, porque depende do MongoDB do .NET. O vet vê, ao concluir um atendimento, o aviso "Pontos enviados"; com a mesma chave, ele mostra quanto o responsável ganhou. Os dados vêm do Java (`/api/pontuacao/saldo`, `/extrato` e `/consulta/{id}/memoria`), que busca no PetBuddies-API (.NET) com o token de quem pediu. As telas só aparecem com `EXPO_PUBLIC_PONTOS=api`; sem a chave, a Pata Segura mostra "Em breve". Só há pontos, sem nível. Os pontos dependem do .NET no ar e das regras de pontuação cadastradas pela clínica: sem elas, toda consulta vale 0. Saldo e extrato buscam de novo quando a tela ganha foco
- **Evolução no fechamento:** o vet marca Melhorou, Estável ou Piorou, de forma opcional, na linha Consulta. O valor vai em `registroAtendimento.evolucao`, e só Melhorou rende ponto ao tutor
- **Protocolos veterinários** são dados do back-office .NET, não consumidos diretamente pelo app mobile (arquitetura definida em conjunto com a equipe de backend)
- Toda chamada HTTP usa Bearer Token injetado automaticamente via interceptor do Axios
- O aplicativo é voltado a Android e iOS. A execução no navegador não é suportada (SecureStore, gravação de áudio e notificações não existem na web)
