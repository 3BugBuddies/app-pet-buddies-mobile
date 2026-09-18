# PetBuddies · Onde a integração quebra

**Sprint 3 · app mobile × API Java**

> Cada fluxo do app, chamada por chamada: o que o app manda, o que a API Java espera, e onde as duas pontas não se encontram.

**Referências de código:**
- `app-pet-buddies-mobile` @ `766aae8`
- `PetBuddies-AI` @ `149e89b`
- Main congelada de 13/09 · lida em 14/09/2026

**Fonte original:** `.claude/docs/analysis/2026-09-14-base-sprint-4-mobile-e-apis.md`

---

## Legenda de estados

| Marca | Estado | Significado |
|---|---|---|
| 🔺 | **Quebrado** | O usuário não termina o fluxo. |
| ⚠️ | **Errado** | Termina, mas com dado ou comportamento incorreto. |
| ◐ | **Incompleto** | Metade existe. |
| ○ (tracejado) | **Não existe** | Deveria existir e não há código. |
| ● | **Funciona** | Sem problemas identificados. |

---

## Visão geral: as duas jornadas, tela a tela

Em nenhum dos dois perfis o caminho principal chega ao fim sem erro:

- **Tutor:** o check-in e o agendamento quebram.
- **Veterinário:** o fechamento do atendimento e o rascunho de prescrição gerado por IA quebram.

### Jornada do tutor
`Login (errado)` → `Home (errado)` → `Meus pets (errado)` → `Check-in (quebrado)` / `Agendar (quebrado)` → `Plano (errado)` → `Pontos (não existe)` / `Minhas consultas (não existe)`

### Jornada do veterinário
`Login (errado)` → `Agenda (incompleto)` → `Atendido (quebrado)` → `Paciente (incompleto)` → `Prontuário (errado)` / `Cancelar (errado)` → `Rascunho IA (quebrado)` → `Assinar (incompleto)`

---

## 1. Sessão e autenticação

*Tutor e veterinário.* O login é real e a sessão persiste. O problema aparece quando o token vence: o app apaga o disco, mas continua usando a sessão que está na memória.

| Estado | App | Chamada | API Java |
|---|---|---|---|
| ✅ Funciona | Login e cadastro reais; ao reabrir, a sessão salva é restaurada e escolhe as abas pelo perfil. (`authRepository.ts:50`, `AppNavigator.tsx:34`) | `POST /auth/login` · `/auth/registro` | Rotas públicas; devolvem o JWT com o perfil. (`AuthController.java:36,54`) |
| ⚠️ Errado | Com 401, apaga o storage e mostra "Sessão expirada", mas a sessão continua no `useState`: o usuário segue navegando com um token morto. (`apiClient.ts:36-39`, `App.tsx:12`) | resposta `401` | O token vale 8 horas; depois disso toda chamada volta 401. (`application.properties:53`) |
| ⚠️ Errado | O interceptor também pega o login: senha errada dispara "Sessão expirada" antes da mensagem de credencial. (`apiClient.ts:36-39`, `authRepository.ts:57`) | resposta `401 CREDENCIAIS_INVALIDAS` | Credencial inválida responde 401, o mesmo código de token vencido. (`GlobalExceptionHandler.java:88-90`) |
| ◐ Incompleto | Token em `AsyncStorage`. `expo-secure-store` está instalado e declarado nos plugins, e nunca é importado. (`apiClient.ts:10`, `app.json`) | sem chamada | — |
| ○ Não existe | Nada renova a sessão: passadas 8 horas, o usuário cai no meio do uso. | renovação de token | Não há refresh token. |

**Correção:** o interceptor deve chamar o `clearSession` do contexto e ignorar `/auth/login`; token armazenado no SecureStore.

---

## 2. Pets e Home

*Tutor.* O CRUD de animal fala com a API de verdade. Dois campos não batem, e um fallback troca o id de uma pessoa pelo de outra — sem a API conferir o dono.

| Estado | App | Chamada | API Java |
|---|---|---|---|
| ✅ Funciona | Lista, cria, edita e remove pet, lendo a coleção em `_embedded`. (`petRepository.ts:12,31,44`) | `GET/POST/PUT/DELETE /animal` | CRUD com HATEOAS; só a remoção confere se o tutor é o dono. (`AnimalService.java:100-103`) |
| ⚠️ Errado | Sem `responsavelId` na sessão, filtra por `usuarioId` — outro id, que pode coincidir com o de outro tutor. (`usePetsControl.ts:22`) | `GET /animal?responsavelId=` | Filtra pelo que vier; sem filtro, devolve todos os animais. (`AnimalService.java:72`) |
| ⚠️ Errado | Tutor ainda sem pet: a Home busca consultas passando o id do usuário como se fosse de veterinário. (`useAppointmentsControl.ts:22,26`, `appointmentRepository.ts:41`) | `GET /consulta?veterinarioId=<usuarioId>` | Aceita qualquer `veterinarioId` de qualquer token. (`ConsultaController.java:53-55`) |
| ⚠️ Errado | Envia `alergia`, no singular. (`pet.ts:33`) | `POST/PUT /animal` | O campo é `alergias`: o valor do tutor é descartado sem erro. (`AnimalRequest.java:57`) |
| ⚠️ Errado | `porte` e `dataNascimento` são opcionais no formulário. (`pet.ts:19-26`) | `POST /animal` | Os dois são `@NotNull`: deixar em branco dá 400. (`AnimalRequest.java:34-42`) |
| ○ Não existe | O app depende do filtro que ele mesmo manda. | escopo por dono | O filtro de autenticação guarda só o `subject` e o perfil; o vínculo do tutor fica fora do contexto. (`TokenAuthenticationFilter.java:67-69`) |

**Correção:** `alergias` e campos obrigatórios no `yup`; remover o fallback para `usuarioId`. Na API: colocar o vínculo no contexto e derivar "meus animais" do token.

---

## 3. Check-in e plano de cuidado (fluxo central)

*Tutor.* A IA extrai certo e a API grava o check-in. O app não lê a resposta corretamente, não liga o relato à tarefa, e marca como feito o que a API nunca concluiu.

| Estado | App | Chamada | API Java |
|---|---|---|---|
| ✅ Funciona | Envia a narrativa do tutor e mostra o que a IA entendeu. (`CheckInEntryScreen.tsx:41`) | `POST /checkin/extracao` | Devolve condições, `redFlags` e `degradado`. (`CheckinController.java:37`, `CheckinExtracaoResponse.java:20-21`) |
| ⚠️ Errado | Decide sozinho que houve escalação: `degradado \|\| redFlags.length > 0`. (`CheckInConfirmScreen.tsx:27`) | sem chamada | `degradado` quer dizer "caia para as perguntas fixas"; quem diz se escalou é `escalado`, na resposta do check-in. (`CheckinExtracaoResponse.java:9`, `CheckinResponse.java:25`) |
| ◐ Incompleto | Confirma mandando animal, narrativa e condições — sem `itemPlanoCuidadoId`. (`CheckInConfirmScreen.tsx:52-60`) | `POST /checkin` | O campo existe e é o que liga o desfecho ao item do plano. (`CheckinRequest.java:30`) |
| 🔺 Quebrado | Escolhe a próxima tela por `result.status` — `'ESCALATION'` ou `'NO_RULE'`. O campo não vem, então sempre abre o resultado comum, com valores de reserva. (`CheckInConfirmScreen.tsx:67-73`) | resposta `201 CheckinResponse` | Responde `desfechos[]` (dose e unidade por regra) e `escalado`. Não existe `status`. (`CheckinResponse.java:24-25`) |
| ⚠️ Errado | Conclui a tarefa de id fixo `'lactulona'` e marca todas as tarefas do plano como feitas — só no cache. (`CheckInConfirmScreen.tsx:65`, `useCheckInControl.ts:19-24`) | sem chamada | Nada muda no banco; o próximo refetch desfaz a marcação. |
| ⚠️ Errado | Considera feita a tarefa com status `'CONCLUIDO'`, calcula "hoje" em UTC e dá 10 pontos fixos por tarefa. (`careRepository.ts:30,40-41`) | `GET /motor/plano/{animalId}` | Status de item é `PENDENTE`, `REALIZADO`, `CANCELADO` ou `ATRASADO`. (`StatusItem.java:9`) |
| ○ Não existe | Mesmo com o status certo, nenhuma tarefa apareceria concluída. | item vira `REALIZADO` | Nenhum código grava `REALIZADO`: o item nasce e fica `PENDENTE`. (`MotorPlanoService.java:324`) |
| ◐ Incompleto | Mostra um plano por animal. (`careRepository.ts:26`) | `GET /motor/plano/{animalId}` | Com preventivo e tratamento ativos ao mesmo tempo, devolve só o de maior prioridade. (`MotorPlanoService.java:141-153`) |

**Correção:** ler `desfechos` e `escalado`, mandar `itemPlanoCuidadoId`, remover `'lactulona'` e o marca-tudo. Quando o item vira `REALIZADO` é decisão de produto (ver **D1**).

---

## 4. Agendamento

*Tutor.* O tutor escolhe dia e hora numa grade gerada no celular. A consulta é marcada numa janela cujo id sai de uma conta fixada em 13/09 — em novembro, nenhuma delas existe.

| Estado | App | Chamada | API Java |
|---|---|---|---|
| 🔺 Quebrado | Grade de 14 dias a partir de hoje; o id da janela é `41 + deslocamento`, calculado para 13 a 26/09. (`AgendamentoTutorScreen.tsx:64-70`) | `POST /consulta/agendamento {janelaId}` | Data e hora vêm da janela: id errado marca outro horário ou falha. (`ConsultaController.java:106-109`) |
| ◐ Incompleto | Nunca pergunta quais janelas estão livres. | `GET /janela-atendimento/livres` (sem chamada) | A rota está pronta, por veterinário e data. (`JanelaAtendimentoController.java:45`) |
| ⚠️ Errado | Manda o texto do tutor em `motivo`. (`appointmentRepository.ts:82`) | `POST /consulta/agendamento` | O request tem `observacao`; `motivo` na consulta é o do cancelamento. (`AgendamentoRequest.java:25`, `ConsultaService.java:150`) |
| ✅ Funciona | Deriva o tipo da consulta do texto escolhido. (`appointmentRepository.ts:26-33`) | no mesmo POST | Os valores batem com `TipoConsulta`. (`TipoConsulta.java`) |
| ○ Não existe | A aba Agenda do tutor só cria: não lista nem cancela as próprias consultas, embora o README prometa. (`AgendaTabStack.tsx:10-14`) | minhas consultas | Só por `animalId` ou `veterinarioId` em query. |

**Correção:** grade vinda de `/livres`; texto em `observacao`; lista do tutor com cancelamento, se a decisão **D4** confirmar que ele cancela.

---

## 5. Agenda, atendimento e cancelamento (veterinário)

O veterinário vê a lista. Os dois gestos que mudam o estado da consulta mandam corpo vazio ou usam a rota que apaga o histórico.

| Estado | App | Chamada | API Java |
|---|---|---|---|
| ◐ Incompleto | Lista todas as consultas do veterinário, sem recorte do dia. (`appointmentRepository.ts:41`) | `GET /consulta?veterinarioId=` | Os filtros são só `animalId` e `veterinarioId`; não há data. (`ConsultaController.java:53-55`) |
| 🔺 Quebrado | "Atendido" manda `{}`. O hook não tem `onError`: o botão falha sem avisar. (`appointmentRepository.ts:121`, `useAppointmentsControl.ts:74-82`) | `POST /consulta/{id}/fechamento` | `registroAtendimento` é `@NotNull`: 400. O fechamento grava registro, prescrições e regras numa transação e marca a consulta como REALIZADA. (`FechamentoAtendimentoRequest.java:27`, `FechamentoAtendimentoService.java:79`) |
| ⚠️ Errado | "Cancelar" e "Reagendar" apagam a consulta. (`appointmentRepository.ts:132`, `DetalhesPetScreen.tsx:82,96`) | `DELETE /consulta/{id}` | DELETE some com o histórico e dá 409 se já há registro ou plano. Cancelar é `POST /{id}/cancelamento`, que guarda o motivo e libera a janela. (`ConsultaService.java:102-112,144-156`) |
| ◐ Incompleto | `useUpdateAppointment` existe e nenhuma tela o chama. (`useAppointmentsControl.ts:62`) | `PUT /consulta/{id}` (sem chamada) | Rota pronta, sem uso. |

**Correção:** cancelar por `/cancelamento` com motivo. O que "atendido" deve chamar depende da decisão **D2**.

---

## 6. Prontuário e prescrição por IA (veterinário)

O veterinário registra o atendimento, pede um rascunho à IA e assina. A IA responde — e a tela quebra ao desenhar as regras que ela propôs.

| Estado | App | Chamada | API Java |
|---|---|---|---|
| ⚠️ Errado | Liga o registro à primeira consulta da lista — ou à consulta `'1'`, se o pet não tiver nenhuma. (`useMedicalRecordControl.ts:85-87`) | `POST /registro-atendimento` | Consulta de outro animal é recusada com 400. (`RegistroAtendimentoService.java:96`) |
| 🔺 Quebrado | Lê `r.acao` e chama `rotuloCongelado.toLowerCase()` em cada regra proposta. (`PrescricaoScreen.tsx:88-93,244`) | resposta `200 RascunhoPrescricaoResponse` | `regrasPropostas` tem `acaoDose` e não tem rótulo: TypeError na renderização sempre que a IA propõe regra. (`RascunhoPrescricaoResponse.java:27`, `RegraPrescricaoRequest.java:34`) |
| ◐ Incompleto | Sete condições clínicas com ids 1 a 7 escritos no código. (`prescriptionRule.ts:6-14`) | `GET /condicao-clinica` (sem chamada) | A rota existe; o seed `V2` não cria condição, então o id só vale se alguém cadastrou à mão. (`CondicaoClinicaController.java:31`, `V2__seed_demonstracao.sql`) |
| ◐ Incompleto | A regra sai sem `operador` e `limite`: condição numérica não tem como ser expressa. (`prescriptionRuleRepository.ts:24-30`) | `POST /regra-prescricao` | Obrigatórios quando a condição é numérica. (`RegraPrescricaoRequest.java:27-31`) |
| ◐ Incompleto | Assinar é uma prescrição e depois N regras, uma chamada por vez: se a terceira falha, as anteriores ficam gravadas. (`usePrescriptionControl.ts:129-140`) | `POST /prescricao` → `/regra-prescricao ×N` | O fechamento faz o mesmo numa transação só. (`FechamentoAtendimentoService.java:79`) |
| ⚠️ Errado | Tipos e status de procedimento com outros nomes (`EXAME`, `AGENDADO`); a aba Exames é um texto fixo. (`procedure.ts:1-2`, `DetalhesPetScreen.tsx:258`) | `GET /procedimento?animalId=` | `PENDENTE`; `EXAME_LABORATORIAL` e `EXAME_IMAGEM`. (`StatusProcedimento.java:5`, `TipoProcedimento.java:5`) |

**Correção:** mapear `acaoDose` e buscar o rótulo em `/condicao-clinica`. Se a assinatura virar o fechamento atômico, a decisão **D2** resolve este trilho e o da agenda juntos.

---

## 7. Telas que não conversam com a API

*Tutor e veterinário.* Estão na navegação e foram entregues na Sprint 3. Na Sprint 4, remover a tela custa −100 pontos: elas precisam passar a funcionar, não sair.

| Estado | App | Chamada | API Java |
|---|---|---|---|
| ○ Não existe | **Pontos e selos.** A tela não importa nenhum hook; o repository devolve constantes. (`ScoreScreen.tsx:1-10`, `careRepository.ts:155-163`) | saldo e selos (sem chamada) | Não há endpoint de pontos. A regra de pontuação vive no .NET e ninguém a lê. |
| ◐ Incompleto | **Aviso do assistente.** "Continuar" e "Falar com a clínica" só abrem um alerta dizendo que não está disponível. (`AssistantNoticeScreen.tsx:42,48`) | sem chamada | — |
| ◐ Incompleto | **Perfil clínico do pet** (vacinas, orientação em casa): dado local, com o perfil fixo de um pet de exemplo. (`petRepository.ts:64-67`) | visão agregada do pet (sem chamada) | Os dados existem espalhados em procedimento e registro; não há uma leitura única. |
| ⚠️ Errado | **Paciente.** A lista vem de `/animal` tipada como paciente; o nome do tutor sai sempre "N/A". (`patientRepository.ts:14-15`, `DetalhesPetScreen.tsx:69,148`) | `GET /animal` | Animal traz o id do responsável, não o nome. |
| ⚠️ Errado | **Depois de assinar,** "Compartilhar via WhatsApp" só volta para a agenda. (`AssinarPrescricaoScreen.tsx:39-40`) | sem chamada | WhatsApp saiu do produto. |

---

## 8. O que o app precisa e a API não oferece

Cada item responde a um fallback ou mock existente no app. Os nomes abaixo são **propostas para a spec**, não rotas que já existem.

| Rota proposta | Descrição | Onde é usado |
|---|---|---|
| `GET /me` | Vínculo do usuário lido do token: responsável, veterinário e clínica. | Tira os fallbacks para `usuarioId` em pets e consultas. |
| minhas consultas | Consultas do tutor logado, com cancelamento. | Aba Agenda do tutor. |
| `GET /consulta?veterinarioId=&data=` | A agenda do dia do veterinário. | Tela Agenda do vet. |
| planos ativos do animal | Todos os planos ativos, não só o de maior prioridade. | Plano e Home do tutor. |
| item `PENDENTE` → `REALIZADO` | A transição que nenhum código escreve hoje. | Plano, recorrência e pontos (**D1**). |
| pontos e selos | Saldo, extrato e a regra de pontuação vigente. | `ScoreScreen`. |
| perfil clínico do pet | Vacinas, alergias e orientação numa leitura só. | Perfil do pet. |
| renovação de token | Refresh antes das 8 horas vencerem. | Sessão. |

---

## 9. O que quebra se ninguém decidir

Quatro correções não têm resposta técnica única — cada linha é uma escolha de produto que muda o que o app e a API precisam fazer. (Numeração conforme a análise de 14/09; **D3**, sobre onboarding, fica fora por não ser integração.)

| Decisão | Caminho A | Caminho B | Se ficar como está |
|---|---|---|---|
| **D1** · Quando um item do plano vira `REALIZADO` | O check-in do tutor conclui o item, sem pontuar. | Só a consulta efetivada conclui; o check-in registra o desfecho. | O plano nunca mostra progresso e a tela de pontos segue fixa. |
| **D2** · Como fechar o atendimento | O app usa o fechamento atômico: uma tela monta registro, prescrições e regras. | O app mantém as chamadas separadas e a API ganha "marcar realizada". | "Atendido" responde 400 e a consulta nunca fica REALIZADA. |
| **D4** · O tutor cancela consulta? | Sim, por `/cancelamento`, a partir da lista dele. | Só o veterinário cancela. | O README promete e o app não entrega. |
| **Escopo por dono** | Vínculo no contexto de autenticação e checagem nos services. | Rotas "meus" que derivam o filtro do token. | O fallback para `usuarioId` lê dado de outra pessoa. |

---

## Resumo executivo

- **Nenhum fluxo principal** (tutor ou veterinário) chega ao fim sem erro no estado atual do main congelado.
- Os pontos mais críticos (🔺 **Quebrado**) estão em: sessão (implícito via 401), check-in (leitura de `status` inexistente), agendamento (id de janela hardcoded), fechamento de atendimento (corpo vazio) e renderização do rascunho de prescrição por IA (`acaoDose` sem rótulo).
- Há **falhas de segurança/escopo** relevantes: fallback de `usuarioId` no lugar de `responsavelId` pode expor dados de outro tutor, e a API não confere o dono em várias rotas.
- Duas telas inteiras (**Pontos/selos** e **Perfil clínico do pet**) não têm nenhum backend por trás — são mocks apresentados como funcionais.
- Quatro decisões de produto (D1, D2, D4, escopo por dono) precisam ser tomadas antes de qualquer especificação técnica adicional, pois definem o contrato entre app e API.

---

*Documento gerado a partir do artefato "PetBuddies · Onde a integração quebra" (14/09/2026), leitura do main congelado da Sprint 3 em clones de 14/09.*
