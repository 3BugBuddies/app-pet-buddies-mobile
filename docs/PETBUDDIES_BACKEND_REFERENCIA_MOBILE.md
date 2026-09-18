# PetBuddies — Referência de Back-end para o Mobile

> Documento gerado em 2026-09-17 a partir da análise dos projetos `petbuddies-ai` (Java) e `PetBuddies-API` (.NET).

---

## 1. Visão Geral da Arquitetura

O PetBuddies é composto por **dois serviços independentes** que se comunicam por HTTP:

| Serviço | Tecnologia | Papel |
|---|---|---|
| **petbuddies-ai** (Java) | Spring Boot 3.4.5 / Java 21 | Serviço principal do app mobile — cadastro, atendimento, prescrição, plano de cuidado, check-in e autenticação |
| **PetBuddies-API** (.NET) | ASP.NET Core 8 / EF Core 8 | Back-office da clínica — catálogo de protocolos, ofertas e regras de pontuação. O app **nunca** chama o .NET diretamente |

**Para o desenvolvimento mobile, o único serviço com que o app se comunica é o Java.** O .NET é consumido internamente pelo Java ao montar planos de cuidado.

### Fluxo de comunicação

```
App Mobile
    │
    ▼
petbuddies-ai (Java :8080)   ◄──GET /api/protocolo──►   PetBuddies-API (.NET :5297)
    │ Oracle próprio                                            │ Oracle próprio
    │ Gemini 2.5 Flash (IA)
    ▼
Actuator /health  (consultado pelo .NET como health check)
```

### Base URL

| Ambiente | URL |
|---|---|
| Local | `http://localhost:8080` |
| Produção (Azure) | `http://petbuddies-java-rm563925.eastus.azurecontainer.io:8080` |

### Swagger / OpenAPI

- Swagger UI: `/swagger-ui.html`
- JSON spec: `/api-docs` (não `/v3/api-docs`)

---

## 2. Autenticação JWT

O Java emite tokens **HS256** com o segredo compartilhado `PETBUDDIES_JWT_SECRET` (mínimo 32 bytes). O .NET valida o mesmo token. O app mobile usa apenas os endpoints do Java.

### Obter token

```
POST /api/auth/login
Content-Type: application/json

{ "login": "ana@clinica.com", "senha": "petbuddies123" }
```

### Resposta do login

```json
{
  "token": "eyJ...",
  "perfil": "VET",
  "usuarioId": 1,
  "responsavelId": null,
  "veterinarioId": 1,
  "nome": null
}
```

- `responsavelId` é preenchido para `TUTOR`, nulo para `VET`.
- `veterinarioId` é preenchido para `VET`, nulo para `TUTOR`.
- `nome` só vem preenchido no `/registro`; no `/login` vem `null`.

### Como usar nas requisições

```
Authorization: Bearer <token>
```

### Perfis

| Perfil | Quem é | O que pode na API |
|---|---|---|
| `VET` | Veterinário da clínica | Abre consulta, fecha atendimento, prescreve, cria regras, gerencia clínica e equipe, instancia plano |
| `TUTOR` | Responsável pelo animal | Faz check-in, agenda/cancela consulta, gerencia seus próprios animais |

**Todo `GET` aceita qualquer token válido.** Perfil sem permissão recebe `403`, nunca `401`.

### Registro (novo usuário)

```
POST /api/auth/registro
```

```json
{
  "tipo": "TUTOR",
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "telefone": "11955550001"
}
```

Para `VET`: trocar `tipo` por `"VET"`, remover `telefone` e incluir `"crmv": "SP-54321"`.

**Resposta:** `201` com o mesmo `LoginResponse` acima (inclui `nome`).

### Troca de senha

```
POST /api/auth/senha
Authorization: Bearer <token>

{ "senhaAtual": "...", "novaSenha": "..." }
```

**Resposta:** `204 No Content`.

### Usuários de demonstração (semeados no banco)

| Login | Perfil | Senha |
|---|---|---|
| `ana@clinica.com` | `VET` | `petbuddies123` |
| `maria@email.com` | `TUTOR` | `petbuddies123` |

---

## 3. Endpoints Java (Mobile)

Todas as rotas exigem `Authorization: Bearer <token>` exceto onde indicado. Respostas de recurso vêm em envelope HATEOAS (`_links`, `_embedded`). Erros vêm como `{ "code": "...", "message": "..." }`.

### 3.1 Autenticação

| Método | Rota | Auth | Status |
|---|---|---|---|
| `POST` | `/api/auth/login` | Aberta | `200` `400` `401` |
| `POST` | `/api/auth/registro` | Aberta | `201` `400` `409` `422` |
| `POST` | `/api/auth/senha` | Token | `204` `400` `401` |

### 3.2 Cadastro

| Recurso | Rota base | Métodos | Filtros de query |
|---|---|---|---|
| Clínicas | `/api/clinica` | `GET` `POST` `GET /{id}` `PUT /{id}` `DELETE /{id}` `GET /buscar?cnpj=` | `cnpj` |
| Veterinários | `/api/veterinario` | `GET` `POST` `GET /{id}` `PUT /{id}` `DELETE /{id}` `GET /buscar?crmv=` | `clinicaId` `crmv` |
| Responsáveis | `/api/responsavel` | `GET` `POST` `GET /{id}` `PUT /{id}` `DELETE /{id}` | `nome` |
| Animais | `/api/animal` | `GET` `POST` `GET /{id}` `PUT /{id}` `DELETE /{id}` | `responsavelId` `nome` |

**Restrição no DELETE de animal:** `TUTOR` só remove animais próprios; tentar animal alheio retorna `403`.

### 3.3 Atendimento

| Recurso | Rota base | Métodos extras |
|---|---|---|
| Consultas | `/api/consulta` | `POST /agendamento` `POST /{id}/cancelamento` `POST /{id}/fechamento` |
| Janelas de atendimento | `/api/janela-atendimento` | `GET /livres?veterinarioId=&data=` |
| Registros de atendimento | `/api/registro-atendimento` | CRUD simples |
| Procedimentos | `/api/procedimento` | CRUD simples |
| Condições clínicas | `/api/condicao-clinica` | `GET /buscar?clinicaId=&codigo=` |

### 3.4 Prescrição

| Método | Rota | Observação |
|---|---|---|
| `GET` | `/api/prescricao` | Lista todas |
| `GET` | `/api/prescricao/{id}` | Por id |
| `POST` | `/api/prescricao` | Recebe `{"prescricoes":[...]}` — grava N em uma transação. Sem `PUT`/`DELETE` (imutável) |
| `POST` | `/api/prescricao/rascunho` | IA gera rascunho a partir de narrativa da vet. Exige `VET`. Não grava |
| `GET` | `/api/regra-prescricao` | Lista |
| `GET` | `/api/regra-prescricao/{id}` | Por id |
| `POST` | `/api/regra-prescricao` | Cria. Sem `PUT`/`DELETE` (imutável) |

### 3.5 Plano de Cuidado

| Método | Rota | Perfil | O que faz |
|---|---|---|---|
| `POST` | `/api/motor/plano/instanciar-preventivo` | `VET` | Cria plano preventivo ou retorna o existente |
| `POST` | `/api/motor/plano/instanciar-pos-cirurgico` | `VET` | Cria plano pós-cirúrgico vinculado a uma consulta |
| `GET` | `/api/motor/plano/{animalId}` | Qualquer | Plano ativo, com itens pendentes |
| `GET` | `/api/motor/plano/{animalId}/eventos` | Qualquer | Itens paginados (`?page=&size=`) |
| `GET` | `/api/motor/plano/{animalId}/protocolo-aplicado` | Qualquer | Itens separados em realizados, pendentes e vencidos |
| `GET` | `/api/motor/plano/{animalId}/sugestoes` | Qualquer | Próximo cuidado sugerido pelo histórico |

### 3.6 Check-in (somente TUTOR)

| Método | Rota | O que faz |
|---|---|---|
| `POST` | `/api/checkin/extracao` | **Passo 1** — IA interpreta narrativa. Não grava. Retorna `CheckinExtracaoResponse` |
| `POST` | `/api/checkin` | **Passo 2** — Grava o confirmado, avalia regras, grava desfecho. Retorna `EntityModel<CheckinResponse>` |
| `GET` | `/api/checkin/{id}` | Busca por id |
| `GET` | `/api/checkin?animalId=` | Lista do animal, mais recente primeiro |

### 3.7 Saúde

| Método | Rota | Auth |
|---|---|---|
| `GET` | `/actuator/health` | Aberta |

Responde `200 {"status":"UP"}` com banco no ar, `503` com banco fora.

---

## 4. Endpoints .NET (Back-office)

> O app mobile **não chama o .NET**. Esta seção serve como referência para entender o que o Java busca quando monta um plano de cuidado.

Base URL local: `http://localhost:5297`. Todas as rotas de negócio exigem token JWT com role `VET`.

### 4.1 Recursos

| Recurso | Rota base | Métodos | Filtros |
|---|---|---|---|
| Protocolo | `/api/protocolo` | `GET` `POST` `GET /{id}` `PUT /{id}` `DELETE /{id}` | `especie` `categoria` `ativo` |
| Regra de Protocolo | `/api/regra-protocolo` | `GET` `POST` `GET /{id}` `PUT /{id}` `DELETE /{id}` | `protocoloId` (obrigatório na listagem) |
| Oferta | `/api/oferta` | `GET` `POST` `GET /{id}` `PUT /{id}` `DELETE /{id}` | `clinicaId` `ato` |
| Regra de Pontuação | `/api/regra-pontuacao` | `GET` `POST` `GET /{id}` `PUT /{id}` `DELETE /{id}` | `clinicaId` `gesto` |

### 4.2 O que o Java consome

Ao receber `POST /api/motor/plano/instanciar-preventivo`, o Java chama:

```
GET /api/protocolo?especie={especie}&categoria=PREVENTIVO&ativo=true
```

O retorno é uma lista de `ProtocoloDto` contendo as `Regras` aninhadas. Cada regra define o tipo de cuidado, offset, data-base e recorrência dos itens do plano.

### 4.3 Dados semeados no .NET

Na primeira subida o banco nasce com **dois protocolos preventivos de exemplo**:

- Preventivo Cão Adulto (`CACHORRO` + `PREVENTIVO`) — 3 regras
- Preventivo Gato Adulto (`GATO` + `PREVENTIVO`) — 3 regras

---

## 5. Contratos Detalhados

### 5.1 Animal

**Request (POST/PUT)**
```json
{
  "nome": "Rex",
  "especie": "CACHORRO",
  "raca": "Vira-lata",
  "porte": "MEDIO",
  "sexo": "MACHO",
  "dataNascimento": "2021-03-15",
  "peso": 18.5,
  "castrado": true,
  "condicaoCronica": false,
  "foto": null,
  "alergias": null,
  "observacoes": null,
  "responsavelId": 1
}
```

**Response** inclui os mesmos campos + `id`, `auditoria.createdAt`, `auditoria.updatedAt` + `_links`.

### 5.2 Agendamento de Consulta

```json
{ "veterinarioId": 1, "animalId": 1, "janelaAtendimentoId": 1 }
```

### 5.3 Fechamento de Consulta (operação atômica)

```json
{
  "registroAtendimento": {
    "dataAtendimento": "2026-09-10T14:30:00",
    "anamnese": "Tutor relata apetite normal.",
    "diagnostico": "Gastroenterite leve.",
    "tratamento": "Dieta leve por 3 dias."
  },
  "prescricoes": [
    {
      "medicamento": "Lactulona",
      "doseMin": 1.0,
      "doseMax": 2.0,
      "unidade": "ml",
      "frequenciaDia": 2,
      "duracaoDias": 5,
      "dataInicio": "2026-09-10",
      "orientacao": "Se as fezes estiverem moles, aplicar a dose menor.",
      "regras": [
        { "condicaoClinicaId": 3, "acaoDose": "DOSE_MIN", "ordem": 1 }
      ]
    }
  ]
}
```

**Status:** `201` com `FechamentoAtendimentoResponse` contendo registro, lista de prescrições e consulta atualizada.

### 5.4 Instanciar Plano Preventivo

```json
{ "animalId": 1, "especie": "CACHORRO", "dataNascimento": "2021-03-15" }
```

**Response `PlanoResponse`:**
```json
{
  "id": 1,
  "animalId": 1,
  "protocoloId": 2,
  "categoria": "PREVENTIVO",
  "status": "ATIVO",
  "instanciadoEm": "2026-09-17T10:00:00",
  "eventos": [ "..." ],
  "criado": true,
  "motivo": null
}
```

- `criado: false` + `motivo: "SEM_PROTOCOLO_COMPATIVEL"` quando não há protocolo no .NET para a espécie.
- `criado: false` + `motivo: null` quando o plano já existia.

### 5.5 Check-in — Extração (passo 1)

**Request:**
```json
{ "animalId": 1, "narrativa": "Ele comeu bem hoje, mas as fezes estavam mais moles." }
```

**Response `CheckinExtracaoResponse`:**
```json
{
  "animalId": 1,
  "dataReferencia": "2026-09-17",
  "narrativa": "...",
  "condicoes": [
    { "condicaoClinicaId": 3, "descricao": "Fezes moles", "confianca": 0.92, "valorBooleano": true }
  ],
  "redFlags": [],
  "degradado": false
}
```

> **Importante:** `confianca < 0.7` indica inferência do modelo — o app **deve confirmar com o tutor** antes de prosseguir. `degradado: true` significa que o modelo falhou; cair para perguntas fixas.

### 5.6 Check-in — Gravação (passo 2)

**Request:**
```json
{
  "animalId": 1,
  "narrativa": "Ele comeu bem hoje, mas as fezes estavam mais moles.",
  "condicoes": [
    { "condicaoClinicaId": 3, "valorBooleano": true, "confianca": 0.92 }
  ]
}
```

**Status:** `201` com `EntityModel<CheckinResponse>` + `_links.self`.

### 5.7 Protocolo (.NET) — ProtocoloDto

```json
{
  "id": 1,
  "nome": "Preventivo cão adulto",
  "categoria": "PREVENTIVO",
  "especie": "CACHORRO",
  "ativo": true,
  "descricao": "...",
  "createdAt": "2026-09-09T17:19:51Z",
  "regras": [
    {
      "id": 1,
      "protocoloId": 1,
      "tipo": "VACINACAO",
      "nome": "V10 anual",
      "offset": 0,
      "unidadeOffset": "DIAS",
      "dataBase": "ULTIMA_REALIZACAO",
      "intervalo": 12,
      "unidadeIntervalo": "MESES",
      "repeticoes": 1,
      "descricao": "..."
    }
  ]
}
```

---

## 6. Enums

Todos os enums trafegam como **string** nos dois serviços (nunca como número inteiro).

### Cadastro / Animal (Java)

| Campo | Valores aceitos |
|---|---|
| `especie` | `CACHORRO` `GATO` `PASSARO` `COELHO` `HAMSTER` `OUTRO` |
| `porte` | `MINI` `PEQUENO` `MEDIO` `GRANDE` `GIGANTE` |
| `sexo` | `MACHO` `FEMEA` |

### Identidade (Java)

| Campo | Valores |
|---|---|
| `perfil` (no token) | `VET` `TUTOR` |
| `tipo` (no registro) | `VET` `TUTOR` |

### Atendimento (Java)

| Campo | Valores |
|---|---|
| `tipoConsulta` | `RETORNO` `EMERGENCIA` `ROTINA` `CIRURGIA` |
| `statusConsulta` | `AGENDADA` `REALIZADA` `CANCELADA` |
| `tipoProcedimento` | `EXAME` `VACINACAO` `CIRURGIA` `VERMIFUGACAO` `OUTRO` |
| `statusProcedimento` | `PENDENTE` `REALIZADO` `CANCELADO` |
| `tipoDesfecho` (check-in) | `DOSE_CALCULADA` `ESCALADO_CLINICA` `SEM_REGRA` |

### Cuidado / Plano (Java)

| Campo | Valores |
|---|---|
| `categoriaPlano` | `PREVENTIVO` `POS_CIRURGICO` `TRATAMENTO` |
| `statusPlano` | `ATIVO` `CONCLUIDO` `CANCELADO` |
| `statusItem` | `PENDENTE` `REALIZADO` `VENCIDO` `CANCELADO` |
| `categoriaProtocolo` | `PREVENTIVO` `POS_CIRURGICO` |
| `tipoCuidado` | `VACINACAO` `VERMIFUGACAO` `RETORNO` `EXAME` `MEDICAMENTO` `OUTRO` |
| `tipoDataBase` | `DATA_CONSULTA` `ULTIMA_REALIZACAO` |
| `unidadeTempo` | `DIAS` `SEMANAS` `MESES` |
| `motivoSugestao` | `PROXIMO_ITEM_PLANO` `ITEM_VENCIDO` `HISTORICO_RECORRENTE` |
| `tipoOrigemItem` | `PROTOCOLO` `PRESCRICAO` |

### Prescrição (Java)

| Campo | Valores |
|---|---|
| `acaoDose` (regra) | `DOSE_MIN` `DOSE_MAX` `DOSE_MEDIA` |
| `operadorRegra` | `E` `OU` `NAO` |
| `tipoDado` | `BOOLEANO` `NUMERICO` `CATEGORICO` |
| `tipoFonteValor` | `CHECK_IN` `PRESCRICAO` |
| `tipoAcaoRegra` | `APLICAR_DOSE` `ESCALAR_CLINICA` |

### Back-office .NET (usados ao montar plano)

| Campo | Valores |
|---|---|
| `categoria` (protocolo) | `PREVENTIVO` `POS_CIRURGICO` |
| `especie` (protocolo) | `CACHORRO` `GATO` `PASSARO` `COELHO` `HAMSTER` `OUTRO` |
| `tipo` (regra protocolo) | `VACINACAO` `VERMIFUGACAO` `RETORNO` `EXAME` `MEDICAMENTO` `OUTRO` |
| `dataBase` (regra protocolo) | `DATA_CONSULTA` `ULTIMA_REALIZACAO` |
| `unidadeOffset` / `unidadeIntervalo` | `DIAS` `SEMANAS` `MESES` |
| `ato` (oferta) | `PROTOCOLO` `PROCEDIMENTO` `CONSULTA` |
| `gesto` (regra pontuação) | `CONSULTA_REALIZADA` `CHECKIN_REALIZADO` `PROTOCOLO_CONCLUIDO` |

---

## 7. Códigos de Erro

### Java (petbuddies-ai)

Erros retornam `{ "code": "...", "message": "..." }`.

| Status | Situação | Exemplo |
|---|---|---|
| `400` | Campo obrigatório ausente ou fora de faixa | `POST /api/animal` sem `nome` |
| `400` | JSON malformado ou enum inválido | `"especie": "INVALIDO"` |
| `400` | Faixa de dose invertida | `doseMin > doseMax` na prescrição |
| `400` | Parâmetro de query obrigatório ausente | `GET /api/checkin` sem `animalId` |
| `400` | Valor incoerente com o tipo da condição | Check-in com `valorBooleano` num campo numérico |
| `401` | Credenciais inválidas (login, senha errada ou usuário inativo) | Mesma mensagem para todos os casos |
| `401` | Senha atual incorreta | `POST /api/auth/senha` |
| `403` | Perfil sem permissão | `TUTOR` chamando `POST /api/prescricao/rascunho` |
| `403` | Animal de outro tutor | `DELETE /api/animal/{id}` de animal alheio |
| `404` | Recurso inexistente | `GET /api/animal/999999` |
| `404` | Animal, item de plano ou condição clínica não encontrado | No check-in |
| `409` | CNPJ, CRMV ou código duplicado | CNPJ repetido ao cadastrar clínica |
| `409` | Janela ocupada | Agendar em janela já ocupada |
| `409` | Consulta já realizada | Tentar fechar novamente |
| `409` | Check-in duplicado | Mesmo animal, data e item |
| `422` | Nenhuma clínica provisionada | `POST /api/auth/registro` com tipo `VET` sem clínica no banco |

### .NET (PetBuddies-API)

Erros retornam texto puro (não JSON). O mobile não consome o .NET, mas o Java pode propagar erros relacionados.

| Status | Situação |
|---|---|
| `400` | Payload inválido (validação de DTO) |
| `401` | Token ausente |
| `403` | Token de `TUTOR` (rota exige `VET`) |
| `404` | Recurso não encontrado |
| `409` | Violação de unicidade (ex.: oferta com mesma vigência) |
| `409` | Tentativa de remover recurso com vínculo |
| `429` | Rate limit excedido (200 req/min por IP). Cabeçalho `Retry-After` indica quando tentar novamente |

### Formato de erro do Java

```json
{
  "code": "ENTIDADE_NAO_ENCONTRADA",
  "message": "Animal com id 999 não encontrado."
}
```

### Quando `degradado: true` no check-in

Não é um erro HTTP. O status é `200`, mas o campo `degradado: true` indica que a IA não conseguiu interpretar a narrativa. O app deve cair para perguntas fixas ao usuário, sem fingir que nada foi observado.

---

## 8. Banco de Dados

Cada serviço tem seu próprio Oracle. Não há banco compartilhado.

### Java — 16 tabelas (Flyway)

O schema é criado pelo Flyway na primeira subida. `ddl-auto=validate` — nunca `update`. Os bancos da sprint 3 são **resetados** a cada nova subida (não migrados).

| Tabela | Entidade | Domínio |
|---|---|---|
| `T_PB_CLINICA` | `ClinicaEntity` | Cadastro |
| `T_PB_VETERINARIO` | `VeterinarioEntity` | Cadastro |
| `T_PB_RESPONSAVEL` | `ResponsavelEntity` | Cadastro |
| `T_PB_ANIMAL` | `AnimalEntity` | Cadastro |
| `T_PB_USUARIO` | `UsuarioEntity` | Identidade |
| `T_PB_JANELA_ATENDIMENTO` | `JanelaAtendimentoEntity` | Atendimento |
| `T_PB_CONSULTA` | `ConsultaEntity` | Atendimento |
| `T_PB_REGISTRO_ATENDIMENTO` | `RegistroAtendimentoEntity` | Atendimento |
| `T_PB_PROCEDIMENTO` | `ProcedimentoEntity` | Atendimento |
| `T_PB_CONDICAO_CLINICA` | `CondicaoClinicaEntity` | Prescrição |
| `T_PB_PRESCRICAO` | `PrescricaoEntity` | Prescrição |
| `T_PB_REGRA_PRESCRICAO` | `RegraPrescricaoEntity` | Prescrição |
| `T_PB_CHECKIN` | `CheckinEntity` | Check-in |
| `T_PB_CONDICAO_OBSERVADA` | `CondicaoObservadaEntity` | Check-in |
| `T_PB_PLANO_CUIDADO` | `PlanoCuidadoEntity` | Cuidado |
| `T_PB_ITEM_PLANO_CUIDADO` | `ItemPlanoCuidadoEntity` | Cuidado |

**Auditoria:** 14 das 16 entidades carregam `@Embeddable Auditoria` com `createdAt` e `updatedAt` gerenciados por `@PrePersist`/`@PreUpdate`.

**Dados semeados (`V2__seed_demonstracao.sql`):**
- 1 clínica, 1 veterinário, 1 responsável, 2 usuários (`ana@clinica.com` VET, `maria@email.com` TUTOR)

### .NET — 4 tabelas (EF Core Migrations)

Migrations aplicadas automaticamente no startup via `Database.Migrate()`.

| Tabela | Entidade | Papel |
|---|---|---|
| `T_PB_PROTOCOLO` | `ProtocoloEntity` | Molde de cuidado (catálogo) |
| `T_PB_REGRA_PROTOCOLO` | `RegraProtocoloEntity` | Item do molde |
| `T_PB_OFERTA` | `OfertaEntity` | O que a clínica oferece e por quanto |
| `T_PB_REGRA_PONTUACAO` | `RegraPontuacaoEntity` | Quanto cada gesto do tutor vale |

**Constraints notáveis:**
- `T_PB_OFERTA`: `UX_OFERTA_VIGENCIA` (clínica + ato + subtipo/protocolo + início de vigência, único); `CK_OFERTA_ALVO` (ato `PROTOCOLO` exige `ProtocoloId` e proíbe `Subtipo`, e vice-versa)
- `T_PB_REGRA_PONTUACAO`: `UK_PONTUACAO_VIGENCIA` (clínica + gesto + início de vigência, único)
- `T_PB_REGRA_PROTOCOLO`: `CK_REGPROT_RECORRENCIA` (`Intervalo` e `UnidadeIntervalo` ambos nulos ou ambos preenchidos)

**Dados semeados (migration `semear_catalogo_inicial`):**
- 2 protocolos preventivos com 3 regras cada (cão e gato)

---

## 9. Observabilidade, Health Checks e Rate Limit

### Health Checks

#### Java

| Rota | Auth | Comportamento |
|---|---|---|
| `GET /actuator/health` | Aberta | `200 {"status":"UP"}` com banco no ar; `503` com banco fora |

#### .NET

| Rota | O que verifica |
|---|---|
| `GET /health/live` | Processo está de pé |
| `GET /health/db` | Conexão Oracle |
| `GET /health/externo` | `petbuddies-ai` via `GET /actuator/health` |
| `GET /health` | Todas as três juntas |

Todas abertas (`AllowAnonymous`).

### Rate Limit (.NET)

O `.NET` aplica **200 requisições por minuto por IP** nos quatro recursos de negócio (Protocolo, RegraProtocolo, Oferta, RegraPontuação). Acima disso:

- Status: `429 Too Many Requests`
- Cabeçalho: `Retry-After: <segundos>`
- Body: texto `"Limite de requisições atingido. Tente novamente em instantes."`

Health checks e `/metrics` ficam fora do rate limit.

### Observabilidade (.NET)

- **Serilog:** log estruturado em console + arquivo JSON (`logs/api-*.log`), rotação diária, 7 dias.
- **X-Correlation-Id:** cada requisição ganha um id de correlação (baseado no `TraceId`), devolvido no cabeçalho de resposta. O cliente pode enviar seu próprio `X-Correlation-Id` e ele aparecerá nos logs.
- **OpenTelemetry:** tracing e métricas de ASP.NET Core. Métricas Prometheus em `GET /metrics`.
- Nível do log por status: `500+` → `Error`; `400-499` → `Warning`; demais → `Information`.

### Compressão (.NET)

Respostas comprimidas com Brotli ou Gzip (nível máximo). O mobile deve enviar `Accept-Encoding: br, gzip` para se beneficiar.
