# cart-wise-agentflow

Resolvedor de documentação e orquestrador mínimo para o CartWise. Obtém os três repositórios de documentação no commit fixado por [`agentflow.docs.lock.yaml`](../agentflow.docs.lock.yaml) (na raiz do workspace), seleciona documentos por tarefa e papel, monta contexto estruturado e grava auditoria em `.agentflow/runs/<taskId>.json`.

## Requisitos

- Node.js 20+
- `git` no PATH
- Lock file com SHA completo (40 caracteres) por repositório

## Repositórios (URLs reais)

| Fonte lógica | Repositório GitHub |
| ------------ | ------------------ |
| `architecture` | https://github.com/MarieleLeiria/architecture-cart-wise |
| `trd` | https://github.com/MarieleLeiria/trd-cart-wise |
| `engineering-standards` | https://github.com/MarieleLeiria/engineering-standards-cart-wise |

Os SHAs efetivos estão no lock file na raiz do monorepo.

## Autenticação (repositórios privados)

Não coloque tokens no código. Configure variáveis de ambiente:

- `AGENTFLOW_DOCS_TOKEN_ARCHITECTURE`
- `AGENTFLOW_DOCS_TOKEN_TRD`
- `AGENTFLOW_DOCS_TOKEN_ENGINEERING_STANDARDS`

Cada uma é usada como usuário HTTPS ao clonar/fetch (OAuth/basic); valores nunca são escritos em logs de auditoria.

## Como rodar os testes

```bash
cd cart-wise-backend
npm install
npm run build
npm test
```

## Uso programático (resumo)

```ts
import { resolveDocsForTask, buildContextsForRoles } from "./src/index.js";

const task = {
  id: "CW-1",
  consult_when: ["change-capture"],
  paths: ["src/content/foo.ts"],
};

const resolved = await resolveDocsForTask(task, {
  workspaceRoot: "<raiz-do-cart-wise>", // onde está agentflow.docs.lock.yaml
});

const contexts = buildContextsForRoles(
  resolved.manifests,
  task,
  resolved.loaded,
);
// contexts.developer.items → documentos e commits por arquivo
```

## Atualizar o lock

1. Escolha os SHAs nos três repositórios (ex.: `git ls-remote https://github.com/... refs/heads/main`).
2. Edite [`agentflow.docs.lock.yaml`](../agentflow.docs.lock.yaml) com os 40 caracteres completos.
3. O PR deve listar os arquivos alterados entre o SHA antigo e o novo, conforme `architecture/docs/05-agentflow-docs-resolution.md`.

## Limitações conhecidas

- Critérios de aceitação que dependem de Chrome/extensão são marcados como não verificáveis automaticamente na auditoria.
- O orquestrador `runTaskWithDocs` executa apenas comandos em allowlist (`npm test`, etc.) no diretório do produto; falhas geram violações na auditoria.
- Testes de integração usam repositórios Git locais e definem `AGENTFLOW_DOCS_SKIP_REPO_URL_MATCH=1` para não exigir URLs do lock idênticas às do GitHub.
