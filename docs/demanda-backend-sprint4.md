# Demanda para o Back-end · Sprint 4

**App mobile × PetBuddies-AI (Java) × PetBuddies-API (.NET)**

Base da análise: `PetBuddies-AI` @ `149e89b` e `PetBuddies-API` @ `2c1b29c` (branch main), comparados com o código atual do app (`src/repository/`).

Cada item tem: **o que falta**, **por quê** (qual tela do app depende) e **contrato proposto**. Nomes de rota e campos novos são **propostas**: o back pode ajustar, desde que avise o mobile.

Legenda de prioridade: 🔴 bloqueia fluxo principal · 🟠 tela entregue sem backend · 🟡 melhoria / opcional.

---

## 0. Decisões de produto que travam itens abaixo

Precisamos de resposta do time antes de implementar os itens marcados.

| Id | Pergunta | Afeta |
|---|---|---|
| **D1** | Quando um item do plano vira `REALIZADO`: o **check-in do tutor** conclui o item, ou só a **consulta efetivada** conclui? | J1, N1 |
| **D2** | Fechamento do atendimento: o app usa o **fechamento atômico** (`POST /consulta/{id}/fechamento`) ou chamadas separadas + "marcar realizada"? **Recomendação do mobile: fechamento atômico.** | J6 |
| **D4** | O tutor pode **cancelar** a própria consulta? | J3 |
| **D5** | **Pontos e selos** ficam no .NET (ledger próprio) ou no Java? | N1 |
| **D6** | **Protocolos salvos** (templates de prescrição do veterinário) entram na Sprint 4 ou saem do escopo? | J9 |
| **D7** | Vacina no atendimento: usar `procedimentos[]` com `tipo = VACINACAO` (já existe) ou criar campos novos no registro? **Recomendação: usar `procedimentos[]`, sem campos novos.** | J6 |

---

## 1. Java (PetBuddies-AI)

### J1 · 🔴 Concluir item do plano (`PENDENTE → REALIZADO`)

**Situação:** nenhum código grava `StatusItem.REALIZADO` em `ItemPlanoCuidadoEntity`. O único uso é filtro de leitura (`MotorPlanoService:237`). O item nasce `PENDENTE` e nunca muda; `ATRASADO` também não é gravado (o DTO calcula `vencido`).

**Por quê:** o plano do tutor nunca mostra progresso; histórico e pontos ficam travados.

**Proposta (conforme D1):**
- **A) Check-in conclui:** em `POST /api/checkin`, quando vier `itemPlanoCuidadoId`, marcar o item `REALIZADO` na mesma transação.
- **B) Rota explícita:** `POST /api/motor/plano/itens/{itemId}/concluir` → `200` com o `ItemPlanoCuidadoDto` atualizado; `409` se já estiver `REALIZADO`/`CANCELADO`.

O app hoje só simula localmente (`fakePlanToggleTask`) e não consegue persistir.

---

### J2 · 🔴 Escopo por dono ("meus dados") derivado do token

**Situação:**
- O JWT já tem as claims `perfil`, `usuarioId`, `responsavelId` (TUTOR) ou `veterinarioId` + `clinicaId` (VET), e o `AuthResponse` devolve `responsavelId`/`veterinarioId`.
- Mas `TokenAuthenticationFilter` só coloca `subject` e perfil no contexto; o vínculo fica de fora.
- `GET /api/animal` sem filtro devolve **todos** os animais; `GET /api/consulta?veterinarioId=` aceita **qualquer** id com qualquer token.

**Por quê:** vazamento de dado entre tutores/veterinários. O app filtra por `responsavelId`, mas o servidor não confere.

**Proposta:**
1. Guardar `responsavelId`/`veterinarioId`/`clinicaId` no principal da autenticação.
2. Quando o perfil for TUTOR: `GET /animal` devolve só os animais do `responsavelId` do token; `GET /animal/{id}`, `PUT`, `DELETE`, `GET /consulta`, `/checkin`, `/motor/plano/{animalId}`, `/prescricao`, `/registro-atendimento`, `/procedimento` conferem que o `animalId` pertence ao tutor (`403`/`404` caso contrário).
3. Quando o perfil for VET: `veterinarioId` do query deve ser igual ao do token (ou ser ignorado e substituído pelo do token).

O app deixa de depender do parâmetro que ele mesmo manda.

---

### J3 · 🔴 Listagem de consultas do tutor e da agenda do vet

**Situação:** `GET /api/consulta` só filtra por `animalId` e `veterinarioId`. Não há data nem tutor.

**Proposta:** novos parâmetros opcionais em `GET /api/consulta`:

| Parâmetro | Tipo | Uso |
|---|---|---|
| `responsavelId` | Long | consultas dos animais do tutor (ou derivar do token, conforme J2) |
| `data` | `AAAA-MM-DD` | recorte do dia (agenda do vet) |
| `status` | `StatusConsulta` | filtrar `AGENDADA`, `CONFIRMADA`… |

Resposta continua `ConsultaResponse`. Para a lista do tutor ficar útil, incluir no response `animalNome` (e, para o vet, `tutorNome`), evitando N chamadas extras.

Se **D4 = tutor cancela**: `POST /consulta/{id}/cancelamento` deve aceitar perfil TUTOR, conferindo que o animal é dele.

---

### J4 · 🟠 Dados do tutor para paciente e rota (Maps/Waze)

**Situação:** `ResponsavelResponse` tem `nome`, `telefone`, `email`. `AnimalResponse` tem só `responsavelId`. **Não existe endereço** em lugar nenhum (nem entidade, nem seed).

**Por quê:** lista de pacientes do vet mostra "N/A" no nome do tutor; botão "Abrir rota" da tela de detalhes precisa de endereço.

**Proposta:**
- Acrescentar `endereco` (string formatada, ou campos separados) em `ResponsavelRequest`/`ResponsavelResponse` + migration.
- Endpoint de leitura para o VET: `GET /api/pacientes` (ou `?expandirResponsavel=true` em `/animal`) devolvendo:

```json
{
  "animalId": 12,
  "animalNome": "Rex",
  "especie": "CAO",
  "tutorId": 3,
  "tutorNome": "Maria Oliveira",
  "telefone": "11999990000",
  "endereco": "Rua X, 100 - São Paulo/SP",
  "ultimaConsulta": "2026-09-30T14:00:00"
}
```

Escopo: só pacientes de consultas daquele veterinário/clínica (J2).

---

### J5 · 🟠 Perfil clínico do pet e "flash histórico"

**Situação:** vacinas, alergias e orientação em casa existem espalhadas (`procedimento`, `registro-atendimento`, `animal.alergias`). O app usa dado fixo (`FAKE_PROFILES`).

**Proposta:** `GET /api/animal/{id}/perfil-clinico`:

```json
{
  "animalId": 12,
  "alergias": "frango",
  "ultimoPeso": 12.4,
  "dataUltimoPeso": "2026-09-30",
  "vacinas": [
    { "nome": "V10", "data": "2026-03-10", "proxima": "2027-03-10" }
  ],
  "ultimoAtendimento": { "data": "2026-09-30T14:00:00", "diagnostico": "Otite" },
  "proximoRetorno": "2026-10-30",
  "orientacoesEmCasa": ["Medicar 2x ao dia por 7 dias"]
}
```

Leitura única, sem o app baixar todos os prontuários (over-fetching). Fontes sugeridas: `procedimento` com tipo `VACINACAO`, `registro-atendimento.proximaVacina/proximoRetorno`, prescrições ativas.

---

### J6 · 🟠 Fechamento do atendimento (confirmar contrato)

**Situação:** `POST /api/consulta/{id}/fechamento` já existe e é atômico. Hoje `registroAtendimento` é obrigatório e **`diagnostico` já é opcional** (só `@Size`). O app mandava `{}` e recebia 400.

**O que o mobile vai passar a enviar (D2 = atômico):**

```json
{
  "registroAtendimento": {
    "dataAtendimento": "2026-10-16T14:30:00",
    "anamnese": "Tutor relata vômito há 2 dias",
    "diagnostico": null,
    "tratamento": "Aplicação de vacina V10",
    "observacao": "Sem intercorrências",
    "proximoRetorno": "2026-11-16",
    "proximaVacina": "2027-10-16"
  },
  "procedimentos": [
    { "tipo": "VACINACAO", "nome": "V10", "observacao": "Lote L-2210" }
  ],
  "prescricoes": []
}
```

**Pedidos ao back:**
1. Confirmar que `diagnostico` nulo é aceito em qualquer tipo de atendimento (sem validação cruzada).
2. Confirmar que o lote da vacina vai em `procedimentos[].observacao` (D7) ou, se preferirem campo próprio, informar o nome.
3. Documentar no Swagger os exemplos acima.

Se o time escolher criar `TipoAtendimento`/`nomeVacina`/`loteVacina` em vez disso, avisar: o mobile ajusta.

---

### J7 · 🟡 Autenticação: erros distintos e renovação

1. **Token vencido** hoje responde `401` com **corpo vazio** (entry point do Spring), e senha errada responde `401` com `{"code":"CREDENCIAIS_INVALIDAS","message":"..."}` (`ErrorDto`). Sugestão: token ausente/vencido também devolver `ErrorDto` com `code = "TOKEN_EXPIRADO"` / `"TOKEN_INVALIDO"`, para o app tratar sem depender da URL.
2. **Refresh token (opcional):** `POST /api/auth/refresh` com o token ainda válido (ou refresh token) devolvendo novo `AuthResponse`. Hoje o token vale 8h e não há renovação. Sem isso o usuário cai no meio do uso.

---

### J8 · 🟡 Plano com mais de um tratamento ativo

`GET /api/motor/plano/{animalId}` devolve **um** plano (o de maior prioridade) quando há preventivo e tratamento ativos ao mesmo tempo (`MotorPlanoService:141-153`).

**Proposta:** `GET /api/motor/plano/{animalId}/ativos` → lista de planos ativos, cada um com os itens/eventos. O app mostra todos na Home/Plano.

---

### J9 · 🟡 Protocolos salvos do veterinário (depende de D6)

Modal "Usar protocolo salvo" na tela de prescrição. Hoje mock local (`FAKE_PROTOCOLS`). **Atenção:** o `/api/protocolo` do .NET é o **catálogo de plano de cuidado**, não templates de prescrição.

Se **D6 = entra**:
- Tabelas `T_PB_PROTOCOLO_PRESCRICAO` (`id`, `nome`, `categoria`, `veterinario_id`) e `T_PB_PROTOCOLO_PRESCRICAO_ITEM` (`id`, `protocolo_id`, `medicamento`, `dose_min`, `dose_max`, `unidade`, `frequencia_dia`, `duracao_dias`, `orientacao`).
- `GET /api/protocolo-prescricao` (do veterinário logado), `POST`, `DELETE /{id}`.

Se **D6 = sai**: o mobile remove o modal.

---

### J10 · 🟠 Seed de demonstração

`V2__seed_demonstracao.sql` cria clínica e veterinário, mas **não cria**:
- **Condições clínicas** (`/condicao-clinica`): o app usava ids 1–7 fixos. Precisa de seed com as condições usadas nas regras (ex.: vômito, diarreia, sangue nas fezes…) **e** um endpoint de listagem já existe, então o app passa a ler dele.
- **Janelas de atendimento** futuras (`/janela-atendimento`): sem janela livre, o tutor não consegue agendar. Seed com janelas dos próximos dias (ou rotina que as gere), para o veterinário de demonstração.
- Um **tutor** e um **animal** de demonstração vinculados ao veterinário, para o fluxo ponta a ponta.

---

### J12 · 🟠 Rascunho de prescrição por IA sem registro de atendimento gravado

**Situação:** `POST /api/prescricao/rascunho` exige `registroAtendimentoId` (`@NotNull`) de um registro **já gravado**. Mas o fluxo adotado (D2, fechamento atômico) só grava o registro na assinatura, junto com a prescrição. Resultado: na primeira consulta de um paciente (ou antes de assinar) não há registro para referenciar.

**Hoje no app:** usa um registro **anterior** do animal só como referência; se não houver nenhum, cai no extrator local (sem IA do servidor). O app não grava mais registro avulso para contornar (isso duplicaria o registro no fechamento).

**Proposta:** trocar `registroAtendimentoId` por `animalId` (+ `consultaId` opcional) no `NarrativaPrescricaoRequest`. O service usa o registro apenas para obter o animal e o veterinário, e ambos já estão na consulta.

```json
{ "animalId": 12, "consultaId": 45, "narrativa": "Amoxicilina 10 mg duas vezes ao dia por sete dias..." }
```

---

### J11 · 🟡 Contratos a documentar/alinhar

| Tema | Java hoje | O que o app fazia (será corrigido no mobile) |
|---|---|---|
| Status de item do plano | `PENDENTE`, `REALIZADO`, `CANCELADO`, `ATRASADO` | `CONCLUIDO` |
| Resposta do check-in | `desfechos[]` + `escalado` | `status: 'ESCALATION' \| 'NO_RULE'` |
| Procedimento | `VACINACAO`, `VERMIFUGACAO`, `EXAME_LABORATORIAL`, `EXAME_IMAGEM`, `CIRURGIA`, `INTERNACAO`, `OUTRO` | `EXAME`, `AGENDADO` |
| Consulta | `StatusConsulta`: `AGENDADA`, `CONFIRMADA`, `REALIZADA`, `CANCELADA`, `NAO_COMPARECEU`; `TipoConsulta`: `ROTINA`, `VACINACAO`, `EXAME`, `RETORNO`, `EMERGENCIA` | ok |
| Regra de prescrição | `acaoDose`: `DOSE_MIN`, `DOSE_MAX`, `DOSE_PADRAO`, `ACIONAR_CLINICA`, `SUSPENDER`; `operador` e `limite` obrigatórios para condição numérica | enviava só `acao` |
| Agendamento | `AgendamentoRequest { janelaId, animalId, tipo, observacao }` | mandava `motivo` |

**Pedido:** rótulo legível da condição (`condicaoClinicaNome`) dentro de `RascunhoPrescricaoResponse.regrasPropostas[]`, para a tela não precisar cruzar com `/condicao-clinica`.

---

## 2. .NET (PetBuddies-API)

**Estado atual:** só `protocolo`, `regra-protocolo`, `oferta`, `regra-pontuacao`, `health` e `dev/token`. Todos exigem perfil **VET**. O mobile **não chama nenhum** deles hoje.

### N1 · 🟠 Pontos e selos (depende de D5 e D1)

**Situação:** existe só a **política** (`regra-pontuacao`: quanto cada gesto vale, por clínica e vigência). Não há saldo, extrato, selos nem registro do evento pontuável. A tela de Pontos usa constantes (`FAKE_SCORE`, `FAKE_BADGES`).

**Proposta (se D5 = .NET):**
- Tabelas de lançamento: `T_PB_LANCAMENTO_PONTOS` (`id`, `responsavel_id`, `animal_id`, `gesto`, `pontos`, `origem_id`, `created_at`) e `T_PB_SELO` / `T_PB_SELO_CONQUISTADO`.
- `GET /api/pontuacao/{animalId}` → saldo e nível:

```json
{ "animalId": 12, "saldo": 140, "nivel": "Bronze", "proximoNivelEm": 60 }
```

- `GET /api/pontuacao/{animalId}/extrato` → lista de lançamentos.
- `GET /api/selos?animalId=12` → selos com `conquistado` (bool) e `conquistadoEm`.
- Gatilho: quem lança o ponto? (check-in concluído, consulta realizada). Precisa de chamada Java → .NET ou evento. **Definir junto com o back.**

### N2 · 🟠 Leitura para o tutor

`oferta` e `regra-pontuacao` exigem `Roles = "VET"`. Se o app for exibir ofertas ou "quanto vale cada gesto" ao tutor, é preciso rota de leitura liberada para TUTOR (`GET` apenas, filtrada pela clínica do tutor).

### N3 · 🟡 CORS/URL base

O app tem uma única `baseURL` (Java, Azure Container). Se o .NET for consumido pelo mobile, informar a URL base de produção e confirmar CORS/HTTPS (o app Android precisa de HTTPS ou cleartext liberado).

---

## 3. Ordem sugerida

| Ordem | Itens | Motivo |
|---|---|---|
| 1 | **J10** (seed), **J2** (escopo por token), **J1** (concluir item) | destravam o fluxo ponta a ponta e fecham o risco de vazamento |
| 2 | **J3** (consultas por tutor/dia), **J6** (confirmar fechamento), **J11** (rótulo da condição) | agenda do vet e do tutor, prescrição por IA |
| 3 | **J4**, **J5**, **J7** | pacientes, perfil clínico, sessão |
| 4 | **N1**, **N2**, **J8**, **J9** | pontos e selos, planos múltiplos, protocolos |

## 4. Já existe e o mobile vai passar a consumir (sem trabalho no back)

`GET /janela-atendimento/livres?veterinarioId=&data=` · `POST /consulta/agendamento` · `POST /consulta/{id}/cancelamento` · `POST /consulta/{id}/fechamento` · `GET /condicao-clinica` · `POST /prescricao/rascunho` · `POST /checkin/extracao` · `POST /checkin` · `GET /motor/plano/{animalId}` · `POST /auth/login` · `POST /auth/registro`.

Se algum desses mudar de contrato, avisar o mobile.
