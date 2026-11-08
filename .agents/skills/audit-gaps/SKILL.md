---
name: audit-gaps
description: Audita o que falta implementar no Cart Wise comparando architecture, TRD e engineering-standards com o código. Use para auditoria, gap analysis, verificar pendências, o que falta (banco, docker, UI/UX, segurança), ou antes de planejar o próximo sprint do MVP.
---

# Audit gaps (Cart Wise)

Compara documentação fixada em `architecture/`, `trd/` e `engineering-standards/` com `cart-wise-frontend/` e `cart-wise-backend/`. Gera `audit/report.md` e resume P0 no chat.

**Não altera código de produto** — apenas cria/sobrescreve `audit/report.md`.

## Quando rodar

- Pedidos de auditoria, gap analysis, “o que falta implementar”
- Antes de fechar escopo do MVP ou abrir issues por domínio
- Após grandes mudanças em docs ou no frontend

## Pré-requisitos

- Ler `.agents/skills/audit-gaps/report-template.md` para o formato final.
- Ignorar em buscas: `node_modules/`, `dist/`, artefatos gerados.
- Ler docs **diretamente** nos paths acima (não usar só o resolver do `cart-wise-backend`).

## Fluxo

### 1. Disparar quatro subagents em paralelo

Use a ferramenta **Task** com `subagent_type: explore`, thoroughness **medium**, quatro invocações **em paralelo**. Cada task recebe o conteúdo integral do prompt abaixo (caminho relativo à raiz do repo):

| Domínio | Prompt |
| ------- | ------ |
| database | `.agents/skills/audit-gaps/subagents/database.md` |
| docker-infra | `.agents/skills/audit-gaps/subagents/docker-infra.md` |
| ui-ux | `.agents/skills/audit-gaps/subagents/ui-ux.md` |
| security | `.agents/skills/audit-gaps/subagents/security.md` |

Instrução comum para cada task:

> Leia o arquivo de prompt indicado e execute a auditoria. Retorne **apenas** a tabela de achados (colunas Item, Fonte, Status, Prioridade, Evidência) mais 2–3 frases de síntese. Status permitidos: `Implementado`, `Parcial`, `Faltando`. Prioridade: `P0`, `P1`, `P2`.

### 2. Consolidar

- Extraia as linhas `| ... |` de cada domínio.
- Conte status por tabela e no total.
- Ordene mentalmente ações: todos P0, depois P1.
- `git rev-parse HEAD` para metadados (se git disponível; senão `n/d`).

### 3. Escrever `audit/report.md`

Preencha `.agents/skills/audit-gaps/report-template.md`:

- Substitua placeholders `{ISO8601}`, `{GIT_HEAD}`, contadores, blocos `{ROWS_*}`, bullets P0/P1, `{NEXT_STEPS}` (3–5 itens acionáveis derivados dos P0).

Crie a pasta `audit/` se não existir.

### 4. Responder no chat

- Link ou caminho `audit/report.md`
- Tabela resumo (Implementado / Parcial / Faltando)
- Lista curta só dos **P0** (máx. 8 bullets)

## Critérios de status

| Status | Significado |
| ------ | ----------- |
| Implementado | Comportamento ou arquivo exigido existe e alinha à doc citada |
| Parcial | Esboço, só docs, só backend de agentflow, ou testes faltando |
| Faltando | Nada relevante no frontend/produto ou requisito explícito ausente |

## Escopo fixo dos domínios

- **database**: IndexedDB, SavedItem, schemas, dedupe, testes — ADR 0002/0004, data model, entities.
- **docker-infra**: Docker (se houver), CI, scripts quality-gates, build MV3.
- **ui-ux**: features TRD, toast ADR 0008, popup e estados.
- **security**: STD-SEC-001–006, manifest, ESLint rede, segredos.

## Extensão (opcional)

Para incluir testes ou docs-vs-código no futuro, adicione `subagents/<nome>.md` e uma quinta Task paralela; estenda `report-template.md` com uma seção e contador no resumo.
