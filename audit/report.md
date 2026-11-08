# Relatório de auditoria — Cart Wise

> Gerado por `audit-gaps` após implementação do plano MVP. Rode a skill novamente para atualizar.

## Metadados

| Campo | Valor |
| ----- | ----- |
| Data (UTC) | 2026-11-08T13:20:00Z |
| Commit / HEAD | `c6ba428a6cee58ae69a6b13a3a2b813b3d9efc09` (working tree com alterações locais) |
| Escopo | database, docker-infra, ui-ux, security |

## Resumo executivo

| Status | Quantidade |
| ------ | ---------- |
| Implementado | 38 |
| Parcial | 4 |
| Faltando | 2 |

### P0 — bloqueadores ou pré-requisitos do MVP

- Nenhum P0 em aberto após implementação de captura, salvar manual, lista, remoção e toast.

### P1 — importante para qualidade / NFR

- Fixtures HTML `simple`/`variant`/`promo` para as cinco lojas (hoje há exemplos Amazon + Mercado Livre; demais adaptadores usam extração genérica com `matches` específico).
- Undo na remoção (TRD permite só confirmação; undo pós-MVP).
- `chrome.commands` coberto no manifest; validar em e2e real no Chrome.

## Achados por domínio

### Database / armazenamento

| Item | Fonte | Status | Prioridade | Evidência / notas |
| ---- | ----- | ------ | ---------- | ----------------- |
| Schemas Zod | data-model | Implementado | P1 | `src/shared/schemas.ts` + testes |
| IndexedDB local-first | ADR 0002 | Implementado | P0 | Dexie `CartWiseDB`, v1 + v2 |
| SavedItem + dedupeKey | ADR 0004 | Implementado | P0 | `storage/db.ts`, `dedupe-key.ts` |
| Fluxo captura → gravação | data-model | Implementado | P0 | Content + SW + testes |
| Migrações Dexie | ADR 0002 | Parcial | P2 | v2 sem upgrade lógico (baseline) |
| Testes storage | data-model | Implementado | P1 | Cobertura ≥80% no frontend |

### Docker / infra / CI

| Item | Fonte | Status | Prioridade | Evidência / notas |
| ---- | ----- | ------ | ---------- | ----------------- |
| CI STD-QUAL-002 | quality-gates | Implementado | P0 | `.github/workflows/ci.yml` |
| Scripts frontend | quality-gates | Implementado | P0 | `package.json` |
| Build MV3 | ADR 0001 | Implementado | P0 | `vite build` |
| Docker | — | Faltando | P2 | Não exigido pela doc |

### UI/UX

| Item | Fonte | Status | Prioridade | Evidência / notas |
| ---- | ----- | ------ | ---------- | ----------------- |
| Popup + lista | feat-item-list | Implementado | P0 | `PopupApp`, `ProductListView` |
| Recorte popup por updatedAt | FR-LST-008 | Implementado | P0 | `limitByUpdatedAt` |
| Salvar manual + feedback | feat-manual-save | Implementado | P0 | `PopupApp`, `capture-flow` |
| Remoção com confirmação | feat-remove-item | Implementado | P1 | `ItemRow` |
| Auto-capture + toast | feat-auto-capture, ADR 0008 | Implementado | P0 | `auto-capture.ts`, `toast.ts` |
| Loading/erro lista | checklist | Implementado | P1 | `useSavedItemsState` |

### Segurança

| Item | Fonte | Status | Prioridade | Evidência / notas |
| ---- | ----- | ------ | ---------- | ----------------- |
| Manifest / permissões | STD-SEC-004 | Implementado | P0 | `manifest.config.ts` |
| Zod em mensagens | STD-SEC-002 | Implementado | P0 | `messages.ts` |
| Ban de rede | STD-SEC-003 | Implementado | P0 | ESLint + código |
| Toast Shadow DOM | ADR 0008 | Implementado | P1 | `toast.ts` fechado |
| Audit npm | STD-SEC-006 | Implementado | P1 | CI `npm run audit` |

## Próximos passos sugeridos

1. Completar fixtures das cinco lojas e e2e de captura por loja.
2. Rodar `test:e2e` no CI local antes do release.
3. Revisão Sonnet 5.5 do diff (Fase 7).

---

*Fontes: `architecture/`, `trd/`, `engineering-standards/`, `cart-wise-frontend/`.*
