# Pet Buddies — Aplicativo Mobile (Sprint 3)

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

## Vídeo de Apresentação

▶️ [Assista no YouTube](<!-- inserir link aqui -->)

---

## Problema e Solução

Tutores de pets com condições crônicas frequentemente não sabem quando e como administrar medicamentos, e veterinários não têm visibilidade sobre a adesão do paciente entre consultas. O **Pet Buddies** resolve isso oferecendo:

- **Para o tutor**: plano de cuidado personalizado, check-in diário inteligente com dose calculada automaticamente, agenda de consultas e histórico do pet
- **Para o veterinário**: painel de pacientes em acompanhamento, registro de prontuários, criação de planos e prescrições com regras de dose adaptativas

---

## Tecnologias

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| React Native | 0.86.3 | Framework mobile |
| Expo | ~57.0.20 | Toolchain e build |
| TypeScript | ~6.0.3 | Tipagem estática |
| TanStack Query | ^5.102.8 | Gerenciamento de estado e cache de API |
| React Navigation | ^7.x | Navegação entre telas (Bottom Tabs + Stack) |
| Axios | ^1.20.0 | Cliente HTTP para a API |
| AsyncStorage | 2.2.0 | Persistência de sessão local |
| Yup | ^1.7.1 | Validação de formulários |

**Backend:** API Java Spring (HATEOAS) em `http://petbuddies-java-rm563925.eastus.azurecontainer.io:8080/api`

---

## Arquitetura do Projeto

```
src/
├── component/          # Componentes de UI reutilizáveis
│   ├── ui/             # Primitivos (Button, Card, Input, LoadingIndicator…)
│   ├── home/           # Cards da tela Home do tutor
│   ├── pet-profile/    # Cards do perfil do pet
│   ├── care-plan/      # Componentes do plano de cuidado
│   ├── checkin/        # Componentes do fluxo de check-in
│   └── vet-agenda/     # Componentes da agenda do veterinário
├── control/            # Hooks de lógica de negócio (TanStack Query)
├── model/              # Tipos e schemas de validação (Yup)
├── repository/         # Camada de acesso à API (Axios)
├── context/            # Contexto de autenticação (AuthContext)
├── screen/             # Telas do aplicativo
│   ├── auth/           # Login, Cadastro, Onboarding
│   ├── tutor/          # Telas do perfil Tutor
│   ├── vet/            # Telas do perfil Veterinário
│   └── navigation/     # Configuração de rotas e stacks
└── styles/             # Tema global (cores, tipografia, espaçamentos)
```

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- Expo Go instalado no dispositivo móvel **ou** emulador Android/iOS configurado

---

## Como Executar

```bash
# 1. Clone o repositório
git clone <URL_DO_REPOSITÓRIO>
cd app-pet-buddies-sprint3

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npx expo start
```

Com o servidor rodando:
- **Dispositivo físico**: escaneie o QR Code com o app **Expo Go**
- **Emulador Android**: pressione `a`
- **Emulador iOS**: pressione `i`

> A API backend já está em produção. Nenhuma configuração adicional de ambiente é necessária.

---

## Funcionalidades Implementadas

### Perfil Tutor
| Funcionalidade | Integração |
|----------------|-----------|
| Cadastro e login | API Java (`/auth/registro`, `/auth/login`) |
| Gerenciar pets (CRUD completo) | API Java (`/animal`) |
| Agendar e cancelar consultas | API Java (`/consulta`) |
| Plano de cuidado e check-in diário | API Java (`/motor/plano`, `/checkin`) |
| Histórico de evolução | API Java |
| Perfil e pontuação do pet | Local (Score — Sprint 4) |

### Perfil Veterinário
| Funcionalidade | Integração |
|----------------|-----------|
| Agenda de consultas do dia | API Java (`/consulta`) |
| Registro de prontuário | API Java (`/registro-atendimento`) |
| Criação de prescrição com regras | API Java (`/prescricao`) |
| Lista de pacientes | API Java |

---

## Fluxo de Autenticação

1. Ao abrir o app, a sessão salva é lida do AsyncStorage
2. Se existe sessão válida, o usuário é redirecionado diretamente às abas (sem tela de login)
3. Sessão expirada (401 da API) limpa o storage e redireciona ao login
4. Logout remove a sessão do storage e do contexto React

---

## Telas Disponíveis

**Auth Stack:** Onboarding · Login · Cadastro

**Tutor (4 abas):**
- **Início:** Resumo do pet ativo, próxima consulta, tarefas do dia
- **Evolução:** Plano de cuidado, check-in narrado, resultado da dose
- **Agenda:** Lista de consultas, agendamento de nova consulta, cancelamento
- **Pet:** Lista de pets, perfil detalhado, adicionar pet, excluir pet

**Veterinário (2 abas):**
- **Hoje:** Agenda do dia, registro de prontuário, prescrição com regras adaptativas
- **Pacientes:** Lista de pacientes em acompanhamento, plano do paciente

---

## Observações Técnicas

- **Dados de Score e Badges** são exibidos localmente nesta sprint. Os endpoints `/pontuacao` e `/badges` estão previstos para a Sprint 4 da API Java
- **Protocolos veterinários** são dados do back-office .NET, não consumidos diretamente pelo app mobile (arquitetura definida em conjunto com a equipe de backend)
- Toda chamada HTTP usa Bearer Token injetado automaticamente via interceptor do Axios
