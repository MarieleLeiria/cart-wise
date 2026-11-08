import { readDocsLock, assertLockCommitsPresent } from "./lock.js";
import { DEFAULT_REPO_SOURCES } from "./config.js";
import { GitBareStore, assertGitAvailable } from "./git-store.js";
import {
  entryToLoaded,
  parseManifestYaml,
  validateManifestSource,
} from "./manifest.js";
import { DocResolutionError } from "./errors.js";
import type {
  AgentRole,
  DocsLockFile,
  DocsSourceKey,
  LoadedDocument,
  ManifestDocumentEntry,
  TaskInput,
} from "./types.js";
import {
  mergeLoaded,
  selectDocuments,
  type ManifestBundle,
} from "./select.js";
import { buildAgentDocContext, formatContextForPrompt } from "./context.js";
import { buildDocsPins } from "./pins.js";
import type { DocContextItem } from "./types.js";

const SOURCES: DocsSourceKey[] = [
  "architecture",
  "trd",
  "engineering-standards",
];

export interface ResolvedDocs {
  lock: DocsLockFile;
  manifests: ManifestBundle;
  loaded: LoadedDocument[];
  selectionByRole: Record<AgentRole, { onlyAnyTask: boolean }>;
}

function assertRepoUrlMatches(lock: DocsLockFile): void {
  if (process.env.AGENTFLOW_DOCS_SKIP_REPO_URL_MATCH === "1") {
    return;
  }
  for (const k of SOURCES) {
    const expected = DEFAULT_REPO_SOURCES[k].gitUrl;
    const got = lock.sources[k]?.repo;
    if (got !== expected) {
      throw new DocResolutionError(
        "LOCK_INVALID",
        `Lock repo URL for ${k} must be ${expected}, got ${got ?? "undefined"}`,
      );
    }
  }
}

export async function loadManifestBundle(
  store: GitBareStore,
  lock: DocsLockFile,
): Promise<ManifestBundle> {
  const out: Partial<ManifestBundle> = {};
  for (const source of SOURCES) {
    const sha = lock.sources[source]!.commit;
    await store.ensureObjectFetched(source, sha);
    const raw = await store.readBlobAtCommit(source, sha, "manifest.yaml");
    const manifest = parseManifestYaml(raw);
    validateManifestSource(manifest, source);
    out[source] = manifest;
  }
  return out as ManifestBundle;
}

export async function loadDocumentsForSelection(
  store: GitBareStore,
  lock: DocsLockFile,
  bundle: ManifestBundle,
  task: TaskInput,
): Promise<LoadedDocument[]> {
  const loaded = new Map<string, LoadedDocument>();

  const loadOne = async (source: DocsSourceKey, id: string) => {
    const key = `${source}::${id}`;
    if (loaded.has(key)) {
      return;
    }
    const entry = bundle[source]!.documents.find(
      (d: ManifestDocumentEntry) => d.id === id,
    );
    if (!entry) {
      throw new DocResolutionError(
        "DOCUMENT_NOT_FOUND",
        `Document ${id} not in manifest for ${source}`,
      );
    }
    const sha = lock.sources[source]!.commit;
    const raw = await store.readBlobAtCommit(source, sha, entry.path);
    const doc = entryToLoaded(source, sha, entry, raw);
    loaded.set(key, doc);
  };

  const roles: AgentRole[] = [
    "planner",
    "architect",
    "developer",
    "tester",
    "reviewer",
  ];
  for (const role of roles) {
    const sel = selectDocuments(bundle, task, role);
    for (const { source, entry } of sel.entries) {
      await loadOne(source, entry.id);
    }
  }

  return [...loaded.values()];
}

export interface ResolveOptions {
  workspaceRoot: string;
  lockPath?: string;
  cacheDir?: string;
}

export async function resolveDocsForTask(
  task: TaskInput,
  opts: ResolveOptions,
): Promise<ResolvedDocs> {
  await assertGitAvailable();
  const lockPath = opts.lockPath ?? `${opts.workspaceRoot}/agentflow.docs.lock.yaml`;
  const lock = await readDocsLock(lockPath);
  assertLockCommitsPresent(lock);
  assertRepoUrlMatches(lock);

  const cacheDir =
    opts.cacheDir ?? `${opts.workspaceRoot}/.agentflow/cache/repos`;
  const store = new GitBareStore(cacheDir);

  const manifests = await loadManifestBundle(store, lock);

  const loaded = await loadDocumentsForSelection(store, lock, manifests, task);

  const selectionByRole = {} as Record<AgentRole, { onlyAnyTask: boolean }>;
  for (const role of [
    "planner",
    "architect",
    "developer",
    "tester",
    "reviewer",
  ] as AgentRole[]) {
    const s = selectDocuments(manifests, task, role);
    selectionByRole[role] = { onlyAnyTask: s.onlyAnyTask };
  }

  return { lock, manifests, loaded, selectionByRole };
}

export function buildContextsForRoles(
  manifests: ManifestBundle,
  task: TaskInput,
  loaded: LoadedDocument[],
): Record<AgentRole, ReturnType<typeof buildAgentDocContext>> {
  const loadedMap = new Map(
    loaded.map((d) => [`${d.source}::${d.id}`, d] as const),
  );
  const map: Partial<
    Record<AgentRole, ReturnType<typeof buildAgentDocContext>>
  > = {};
  for (const role of [
    "planner",
    "architect",
    "developer",
    "tester",
    "reviewer",
  ] as AgentRole[]) {
    const sel = selectDocuments(manifests, task, role);
    const docs = mergeLoaded(sel, loadedMap);
    map[role] = buildAgentDocContext(manifests, task, role, docs);
  }
  return map as Record<
    AgentRole,
    ReturnType<typeof buildAgentDocContext>
  >;
}

export { formatContextForPrompt, buildDocsPins };
export type { DocContextItem };
