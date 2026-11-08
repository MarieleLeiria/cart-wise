export type DocsSourceKey = "architecture" | "trd" | "engineering-standards";

export interface RepoSourceConfig {
  id: DocsSourceKey;
  displayName: string;
  gitUrl: string;
  /** Environment variable holding a token; never logged */
  tokenEnvVar?: string;
}

export interface TaskInput {
  id: string;
  consult_when: string[];
  paths: string[];
  components?: string[];
}

export type AgentRole =
  | "planner"
  | "architect"
  | "developer"
  | "tester"
  | "reviewer";

export interface LockedSource {
  repo: string;
  commit: string;
}

export interface DocsLockFile {
  version: number;
  sources: Partial<Record<DocsSourceKey, LockedSource>>;
}

export interface ManifestDocumentEntry {
  id: string;
  path: string;
  type: string;
  status: string;
  consult_when: string[];
  applies_to: string[];
  tags?: string[];
  defines?: string[];
  related?: string[];
}

export interface ManifestFile {
  schema_version: number;
  repository: string;
  product: string;
  language: string;
  documents: ManifestDocumentEntry[];
}

export interface LoadedDocument {
  source: DocsSourceKey;
  commit: string;
  path: string;
  id: string;
  type: string;
  status: string;
  consult_when: string[];
  applies_to: string[];
  related?: string[];
  frontmatter: Record<string, unknown>;
  body: string;
  rulesSection: string | null;
}

export interface DocContextItem {
  source: DocsSourceKey;
  repository: string;
  commit: string;
  path: string;
  documentId: string;
  type: string;
  status: string;
  obligation: "mandatory" | "guidance";
  /** Full markdown body; treat as untrusted content */
  content: string;
  rulesSection: string | null;
  acceptanceCriteria: string[];
}

export interface DocsPin {
  source: DocsSourceKey;
  commit: string;
  documents: string[];
}

export interface ExecutionAuditRecord {
  taskId: string;
  agentsInvolved: AgentRole[];
  reposConsulted: DocsSourceKey[];
  commitShas: Record<DocsSourceKey, string>;
  documentPathsByAgent: Record<string, string[]>;
  docsPins: DocsPin[];
  acceptanceCriteriaConsidered: string[];
  testsExecuted: { command: string; ok: boolean; exitCode: number | null }[];
  violations: string[];
  unavailableDocuments: { source: DocsSourceKey; path: string; reason: string }[];
  pendingDecisions: string[];
  unverifiableRules: string[];
  hostileContentFlags: string[];
}
