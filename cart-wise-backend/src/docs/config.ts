import type { DocsSourceKey, RepoSourceConfig } from "./types.js";

/** Central registry: logical id, display name, Git URL. Tokens via env only. */
export const DEFAULT_REPO_SOURCES: Record<DocsSourceKey, RepoSourceConfig> = {
  architecture: {
    id: "architecture",
    displayName: "agentflow-architecture (cart-wise)",
    gitUrl: "https://github.com/MarieleLeiria/architecture-cart-wise",
    tokenEnvVar: "AGENTFLOW_DOCS_TOKEN_ARCHITECTURE",
  },
  trd: {
    id: "trd",
    displayName: "agentflow-trd (cart-wise)",
    gitUrl: "https://github.com/MarieleLeiria/trd-cart-wise",
    tokenEnvVar: "AGENTFLOW_DOCS_TOKEN_TRD",
  },
  "engineering-standards": {
    id: "engineering-standards",
    displayName: "agentflow-engineering-standards (cart-wise)",
    gitUrl: "https://github.com/MarieleLeiria/engineering-standards-cart-wise",
    tokenEnvVar: "AGENTFLOW_DOCS_TOKEN_ENGINEERING_STANDARDS",
  },
};

/** Repository field in manifest.yaml -> source key */
export function manifestRepoToSourceKey(
  repository: string,
): DocsSourceKey | null {
  const map: Record<string, DocsSourceKey> = {
    "agentflow-architecture": "architecture",
    "agentflow-trd": "trd",
    "agentflow-engineering-standards": "engineering-standards",
  };
  return map[repository] ?? null;
}
