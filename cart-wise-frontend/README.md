# Cart Wise (frontend)

Extensão Chrome MV3 — React, Vite, CRXJS, Dexie.

## Gates locais

Na pasta `cart-wise-frontend`, na ordem:

```bash
npm ci
npm run lint
npm run format:check
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run audit
```

`test:e2e` executa `vite build` em `globalSetup` antes dos testes (a ordem do CI roda e2e antes do passo `build` formal).
