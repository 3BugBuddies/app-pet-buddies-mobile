# Especificações Técnicas para o Backend (Java) - Fechamento da Sprint 3

Este documento lista todos os ajustes arquiteturais, endpoints e modificações no schema que o backend precisará implementar para suportar as telas e UX criadas na Sprint 3.

---

## 1. Fechamento Atômico e Formulários Dinâmicos (Prontuário)
**Onde impacta no app:** `ProntuarioFormScreen`, `AssinarPrescricaoScreen` e Fechamento de Consulta.

### 1.1. O Problema Atual do `diagnostico`
O endpoint `POST /consulta/{id}/fechamento` exige que o campo `diagnostico` seja `@NotNull`. Isso obriga a UX a forçar um "diagnóstico falso" quando o veterinário está apenas aplicando uma vacina ou exame. Atualmente, o frontend está mandando strings hardcoded (ex: `"Profilaxia / Imunização"`) para burlar essa validação.

### 1.2. O que o Java precisa implementar:
* **Novo Enum:** Criar `TipoAtendimento` (`CONSULTA`, `VACINA`, `EXAME`, `PROCEDIMENTO`).
* **Novas Colunas em `T_PB_REGISTRO_ATENDIMENTO`**:
  * `tipo_atendimento` (Enum)
  * `nome_vacina` (String, nullable)
  * `lote_vacina` (String, nullable)
  * `nome_exame` (String, nullable)
  * `nome_procedimento` (String, nullable)
* **Validação Dinâmica no DTO:** Retirar o `@NotNull` absoluto de `diagnostico`. A validação (via Custom Annotation ou camada de Service) deve ser baseada no `TipoAtendimento`:
  * `CONSULTA`: `diagnostico` obrigatório.
  * `VACINA`: `nomeVacina` obrigatório, `diagnostico` pode ser null.

---

## 2. Dados do Tutor para o Waze / Maps
**Onde impacta no app:** Botão `Abrir Rota (Maps / Waze)` na `DetalhesPetScreen` de médicos de atendimento a domicílio.

### 2.1. O Problema Atual
O frontend precisa rotear o veterinário até a casa do paciente, mas a API de listagem de animais da clínica (`GET /animal`) não traz o endereço da residência e o telefone de contato (dados que pertencem ao `Responsavel`).

### 2.2. O que o Java precisa implementar:
* Criar um endpoint dedicado para a visão de negócio da clínica: `GET /pacientes-clinica` (ou expandir o DTO do `GET /animal`).
* O DTO retornado (`ClinicPatientResponse`) deve obrigatoriamente trazer:
  * `tutorName` (Nome do responsável)
  * `endereco` (Endereço formatado do responsável)
  * `telefone` (Telefone do responsável)

---

## 3. CRUD de Protocolos Salvos (Templates de Prescrição)
**Onde impacta no app:** Modal "Usar Protocolo Salvo" na `PrescricaoScreen`.

### 3.1. O Problema Atual
Os veterinários prescrevem os mesmos medicamentos com as mesmas regras todos os dias (ex: Tratamento padrão de Otite). No app atual da Sprint 3, isso está mockado localmente para que eles preencham o formulário com 1 clique, mas o backend não salva/fornece esses templates.

### 3.2. O que o Java precisa implementar:
* **Novas Tabelas (Modelo de Negócio):**
  * `T_PB_PROTOCOLO` (id, nome, categoria, veterinario_id)
  * `T_PB_PROTOCOLO_MEDICAMENTO` (id, protocolo_id, medicamento, dose_min, dose_max, unidade, frequencia_dia, duracao_dias, orientacao)
* **Endpoints (CRUD):**
  * `GET /protocolos` (Lista os protocolos do veterinário logado)
  * `POST /protocolos` (Salva um novo template de protocolo)
  * `DELETE /protocolos/{id}` (Exclui)

---

## 4. Timeline de Vacinas e Procedimentos Realizados (Flash Histórico)
**Onde impacta no app:** Cards amarelos "Flash Histórico" (peso, última vacina, último atendimento) no topo da `DetalhesPetScreen`.

### 4.1. O Problema Atual
Para compor o "Resumo Rápido", o app mobile precisa puxar o último peso (não há endpoint claro para histórico biométrico) e verificar procedimentos (vacinas). Atualmente, a consulta desses agregadores gera over-fetching (puxar todos os prontuários e procedimentos e filtrar na mão no client-side).

### 4.2. O que o Java precisa implementar (Opcional p/ Performance):
* **Endpoint de Resumo Biométrico:** `GET /animal/{id}/flash-historico` que retorne um DTO super leve com:
  * `ultimoPeso` (Decimal) e `dataUltimoPeso` (Date)
  * `proximaVacina` (Nome e Data) ou `ultimaVacina`
  * `ultimoDiagnostico` (String) e `dataUltimoAtendimento` (Date)
* Alternativamente, incluir este objeto de resumo dentro do DTO existente do `GET /animal/{id}`.
