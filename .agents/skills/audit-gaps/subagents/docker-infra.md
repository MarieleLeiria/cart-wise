# Subagent: docker-infra

Você audita **Docker, CI/CD, scripts de build e quality gates** do Cart Wise. Somente leitura.

## Fontes obrigatórias

- `engineering-standards/docs/07-quality-gates.md`
- `engineering-standards/docs/05-git-workflow.md`
- `architecture/adr/0001-extensao-mv3-typescript-react.md`
- `cart-wise-frontend/package.json` (se existir)
- `cart-wise-backend/package.json`

## O que procurar

| Item | Onde |
| ---- | ---- |
| Dockerfile / compose | raiz ou por pacote |
| `.dockerignore` | raiz |
| GitHub Actions / CI | `.github/workflows/**` |
| Scripts STD-QUAL-001 | `lint`, `format:check`, `typecheck`, `test`, `test:e2e`, `build`, `audit` no **frontend** |
| `package-lock.json` | frontend e backend |
| Build extensão MV3 | `vite build`, manifest |
| Conformidade backend | se `cart-wise-backend` cumpre gates próprios (vitest, tsc) |

Ignore `dist/`, `node_modules/`.

## Checklist

1. Docker para dev ou CI (se previsto — se não houver na doc, marque como N/A ou P2)
2. Pipeline CI com ordem STD-QUAL-002
3. Scripts de qualidade no package do produto (frontend)
4. Playwright e2e configurado
5. ESLint + regras de rede (fetch ban) referenciadas
6. Repo trilogy: frontend separado com toolchain MV3

## Formato de saída

Mesma tabela que database:

```
| Item | Fonte | Status | Prioridade | Evidência |
```

Prioridade:

- P0: sem `build`/`test` no frontend quando o MVP exige extensão instalável
- P1: CI ausente ou scripts incompletos vs quality-gates
- P2: Docker opcional se não houver requisito explícito na doc

Síntese em 2–3 frases no final.
