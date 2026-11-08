export { DEFAULT_REPO_SOURCES } from "./docs/config.js";
export { readDocsLock } from "./docs/lock.js";
export { GitBareStore, assertGitAvailable } from "./docs/git-store.js";
export {
  resolveDocsForTask,
  buildContextsForRoles,
  buildDocsPins,
} from "./docs/resolver.js";
export { selectDocuments, ROLE_CONSULT_WHEN } from "./docs/select.js";
export { runTaskWithDocs } from "./orchestrator.js";
export type { TaskInput, AgentRole, DocsSourceKey } from "./docs/types.js";
export { DocResolutionError } from "./docs/errors.js";
