# Relatório de auditoria — Cart Wise

> Atualizado após modelo **ativação por site** (ADR-0009). Rode `audit-gaps` para auditoria completa.

## Metadados

| Campo | Valor |
| ----- | ----- |
| Data (UTC) | 2026-11-08T20:30:00Z |
| Escopo | database, docker-infra, ui-ux, security |

## Resumo executivo

| Status | Quantidade (estimado) |
| ------ | --------------------- |
| Implementado | Maioria do MVP |
| Parcial | TRD `proposed`, e2e de ativação |
| Faltando | Publicação CWS (política, ZIP) |

### Destaques

- Sem adaptadores por loja; só `generic`.
- `active-sites.ts`: ativar/desativar, `registerContentScripts`, reconciliação.
- Manifest sem `host_permissions` fixos; ícones em `public/icons/`.
- Removida captura automática ao carrinho.

### Próximos passos

1. Validar fluxo ativar → FAB em Chrome real.
2. `npm run package` e listagem CWS.
3. Rodar skill `audit-gaps` com subagents para contagens formais.
