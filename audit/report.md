# Relatório de auditoria — Cart Wise

> Gerado por `audit-gaps`. Não edite manualmente se for reaplicar a skill; rode a auditoria de novo para atualizar.

## Metadados

| Campo | Valor |
| ----- | ----- |
| Data (UTC) | 2026-03-21T12:15:00Z |
| Commit / HEAD | n/d |
| Escopo | database, docker-infra, ui-ux, security |

## Resumo executivo

| Status | Quantidade |
| ------ | ---------- |
| Implementado | 3 |
| Parcial | 2 |
| Faltando | 19 |

### P0 — bloqueadores ou pré-requisitos do MVP

- **Repositório do produto MV3 inexistente**: `cart-wise-frontend/` não contém `package.json`, `src/` nem manifest — nada do MVP da extensão está implementado.
- **IndexedDB / SavedItem**: especificado em ADRs e data model; sem código de storage, schemas Zod ou `SavedItemRepository`.
- **Popup + lista de itens** (`feat-item-list`): sem UI React da extensão.
- **Manifest e permissões** (`STD-SEC-004`): sem `manifest.config.ts` no frontend.
- **Scripts de qualidade do produto** (`STD-QUAL-001`): ausentes no pacote da extensão (lint, build, test, e2e).

### P1 — importante para qualidade / NFR

- CI (`.github/workflows`) na raiz do monorepo — não configurado para o frontend.
- Fluxos TRD (salvar manual, remover, auto-capture, toast ADR 0008) — apenas documentados.
- ESLint com ban de `fetch`/`XHR` em `src/**` — depende do scaffold do frontend.

## Achados por domínio

### Database / armazenamento

| Item | Fonte | Status | Prioridade | Evidência / notas |
| ---- | ----- | ------ | ---------- | ----------------- |
| Schemas Zod (`CapturedProduct`, `NormalizedProduct`, `SavedItem`) | `architecture/docs/03-data-model.md` | Faltando | P0 | Sem `cart-wise-frontend/src/shared/schemas.ts` |
| IndexedDB local-first (ADR 0002) | `architecture/adr/0002-local-first-indexeddb.md` | Faltando | P0 | Nenhum módulo `src/storage/**` |
| Object store `savedItems` + versão DB | `architecture/docs/03-data-model.md` | Faltando | P0 | — |
| Índice único `dedupeKey` | `architecture/adr/0004-modelo-saveditem.md` | Faltando | P0 | — |
| `SavedItemRepository` (upsert, list, observe, remove) | `architecture/docs/02-components.md` | Faltando | P0 | Contrato só na documentação |
| Fluxo captura → normalização → persistência | `architecture/docs/03-data-model.md` | Faltando | P0 | Sem service worker / background |
| Migrações (`onupgradeneeded` / Dexie) | `architecture/docs/02-components.md` | Faltando | P1 | — |
| Testes de schema e storage | `engineering-standards/docs/03-testing.md` | Faltando | P1 | Vitest existe só em `cart-wise-backend` (AgentFlow) |

**Síntese:** O modelo de dados está bem especificado na documentação; a implementação no frontend da extensão ainda não começou.

### Docker / infra / CI

| Item | Fonte | Status | Prioridade | Evidência / notas |
| ---- | ----- | ------ | ---------- | ----------------- |
| Dockerfile / docker-compose | — | Faltando | P2 | Nenhum `Dockerfile` no repo; não obrigatório explícito para MVP local-first |
| `.dockerignore` | — | Faltando | P2 | — |
| GitHub Actions / CI na raiz | `engineering-standards/docs/07-quality-gates.md` | Faltando | P1 | Sem `.github/workflows` do projeto (só deps em `node_modules`) |
| Scripts STD-QUAL-001 no frontend | `engineering-standards/docs/07-quality-gates.md` | Faltando | P0 | `cart-wise-frontend/` vazio; sem `package.json` |
| `package-lock.json` do produto | `engineering-standards/docs/07-quality-gates.md` | Faltando | P0 | Apenas `cart-wise-backend/package-lock.json` |
| Build MV3 (`vite build`) | `architecture/adr/0001-extensao-mv3-typescript-react.md` | Faltando | P0 | — |
| Playwright `test:e2e` | `engineering-standards/docs/07-quality-gates.md` | Faltando | P1 | — |
| Toolchain AgentFlow (backend docs) | `cart-wise-backend/package.json` | Parcial | P2 | `build`, `test`, `typecheck` presentes; escopo é resolver de docs, não extensão |
| ESLint / Prettier config no monorepo produto | `engineering-standards/docs/07-quality-gates.md` | Faltando | P1 | — |

**Síntese:** Infra de desenvolvimento da extensão ainda não foi inicializada; o backend AgentFlow tem testes TypeScript isolados.

### UI/UX

| Item | Fonte | Status | Prioridade | Evidência / notas |
| ---- | ----- | ------ | ---------- | ----------------- |
| Popup / dashboard da extensão | `architecture/docs/02-components.md` | Faltando | P0 | `cart-wise-frontend/` sem arquivos |
| feat-item-list (lista reativa) | `trd/docs/features/feat-item-list.md` | Faltando | P0 | — |
| feat-manual-save | `trd/docs/features/feat-manual-save.md` | Faltando | P0 | — |
| feat-remove-item (diálogo confirmar) | `trd/docs/features/feat-remove-item.md` | Faltando | P1 | — |
| feat-auto-capture + feedback | `trd/docs/features/feat-auto-capture.md` | Faltando | P1 | — |
| Toast em Shadow DOM fechado | `architecture/adr/0008-toast-shadow-dom.md` | Faltando | P1 | — |
| Estados vazio / erro / loading | TRD features | Faltando | P1 | — |
| i18n | TRD/NFR | Faltando | P2 | Não bloqueante no diagnóstico atual |

**Síntese:** Toda a superfície UX está descrita nos TRDs; não há código React/MV3 correspondente.

### Segurança

| Item | Fonte | Status | Prioridade | Evidência / notas |
| ---- | ----- | ------ | ---------- | ----------------- |
| STD-SEC-004 Manifest único (`manifest.config.ts`) | `engineering-standards/docs/04-security.md` | Faltando | P0 | Sem frontend |
| Host permissions vs `trd/docs/02-stores.md` | `engineering-standards/docs/04-security.md` | Faltando | P0 | — |
| STD-SEC-002 Mensagens validadas com Zod | `engineering-standards/docs/04-security.md` | Faltando | P0 | Sem `onMessage` handlers |
| STD-SEC-003 Sem rede em `src/**` | `engineering-standards/docs/04-security.md` | Faltando | P1 | Impossível verificar sem `src/`; regra documentada |
| STD-SEC-001 XSS / sem HTML injetado | `engineering-standards/docs/04-security.md` | Faltando | P1 | Toast/UI ausentes |
| STD-SEC-005 `.gitignore` para `.env` | `engineering-standards/docs/04-security.md` | Parcial | P1 | `cart-wise-backend/.gitignore` existe; raiz/frontend sem árvore de produto |
| STD-SEC-006 `npm audit` script | `engineering-standards/docs/04-security.md` | Faltando | P1 | Não declarado no backend; ausente no frontend |
| Segredos no repositório | `engineering-standards/docs/04-security.md` | Implementado | P2 | Nenhum `.env` com credencial encontrado na árvore auditada |
| Zod no ecossistema | `engineering-standards/docs/04-security.md` | Parcial | P2 | `zod` em `cart-wise-backend` para AgentFlow, não mensagens da extensão |

**Síntese:** Controles de segurança estão definidos nos standards; a extensão que deve implementá-los ainda não existe.

## Legenda

- **Status**: `Implementado` — atende o esperado na doc; `Parcial` — existe mas incompleto ou só em docs/backend; `Faltando` — ausente no código da extensão.
- **Prioridade**: `P0` MVP ou risco alto; `P1` NFR / qualidade; `P2` melhoria ou pós-MVP.
- Buscas ignoram `node_modules/`, `dist/` e artefatos gerados.

## Próximos passos sugeridos

1. Scaffold `cart-wise-frontend` conforme ADR 0001 (Vite, React, TypeScript, manifest MV3) com scripts `STD-QUAL-001`.
2. Implementar `src/shared/schemas.ts` e `src/storage/saved-items.ts` com IndexedDB/Dexie e índice `dedupeKey`.
3. Entregar popup + `feat-item-list` com `SavedItemRepository.observe`.
4. Adicionar `manifest.config.ts`, content/background scripts e validação Zod em `onMessage`.
5. Configurar CI na raiz com a ordem `STD-QUAL-002` quando o `package.json` do frontend existir.

---

*Fontes de verdade consultadas: `architecture/`, `trd/`, `engineering-standards/`, código em `cart-wise-frontend/` e `cart-wise-backend/`.*
