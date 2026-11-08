# Relatório de auditoria — Cart Wise

> Gerado por `audit-gaps`. Não edite manualmente se for reaplicar a skill; rode a auditoria de novo para atualizar.

## Metadados

| Campo | Valor |
| ----- | ----- |
| Data (UTC) | `{ISO8601}` |
| Commit / HEAD | `{GIT_HEAD}` |
| Escopo | database, docker-infra, ui-ux, security |

## Resumo executivo

| Status | Quantidade |
| ------ | ---------- |
| Implementado | {N_IMP} |
| Parcial | {N_PART} |
| Faltando | {N_MISS} |

### P0 — bloqueadores ou pré-requisitos do MVP

{BULLET_P0}

### P1 — importante para qualidade / NFR

{BULLET_P1}

## Achados por domínio

### Database / armazenamento

| Item | Fonte | Status | Prioridade | Evidência / notas |
| ---- | ----- | ------ | ---------- | ----------------- |
{ROWS_DATABASE}

### Docker / infra / CI

| Item | Fonte | Status | Prioridade | Evidência / notas |
| ---- | ----- | ------ | ---------- | ----------------- |
{ROWS_DOCKER}

### UI/UX

| Item | Fonte | Status | Prioridade | Evidência / notas |
| ---- | ----- | ------ | ---------- | ----------------- |
{ROWS_UIUX}

### Segurança

| Item | Fonte | Status | Prioridade | Evidência / notas |
| ---- | ----- | ------ | ---------- | ----------------- |
{ROWS_SECURITY}

## Legenda

- **Status**: `Implementado` — atende o esperado na doc; `Parcial` — existe mas incompleto ou só em docs/backend; `Faltando` — ausente no código da extensão.
- **Prioridade**: `P0` MVP ou risco alto; `P1` NFR / qualidade; `P2` melhoria ou pós-MVP.
- Buscas ignoram `node_modules/`, `dist/` e artefatos gerados.

## Próximos passos sugeridos

{NEXT_STEPS}

---

*Fontes de verdade consultadas: `architecture/`, `trd/`, `engineering-standards/`, código em `cart-wise-frontend/` e `cart-wise-backend/`.*
