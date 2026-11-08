import picomatch from "picomatch";

import type {
  AgentRole,
  DocsSourceKey,
  LoadedDocument,
  ManifestDocumentEntry,
  ManifestFile,
  TaskInput,
} from "./types.js";

const IGNORED_STATUS = new Set(["superseded", "deprecated", "rejected"]);

/** consult_when tokens relevant to each agent role */
export const ROLE_CONSULT_WHEN: Record<AgentRole, string[]> = {
  planner: ["any-task", "resolve-docs"],
  architect: [
    "any-task",
    "define-structure",
    "add-component",
    "change-component",
    "add-store-adapter",
    "add-integration",
    "change-build",
    "change-capture",
    "change-storage",
    "change-ui",
    "change-data-model",
    "resolve-docs",
  ],
  developer: [
    "any-task",
    "write-code",
    "add-module",
    "change-capture",
    "change-ui",
    "change-storage",
    "change-data-model",
    "change-list",
    "change-removal",
    "add-store-adapter",
  ],
  tester: ["any-task", "write-tests", "validate-work", "change-capture"],
  reviewer: [
    "any-task",
    "review-code",
    "validate-work",
    "commit-and-pr",
    "change-capture",
  ],
};

export type ManifestBundle = Record<DocsSourceKey, ManifestFile>;

function entryKey(source: DocsSourceKey, id: string): string {
  return `${source}::${id}`;
}

function intersects<T>(a: T[], b: Set<T> | T[]): boolean {
  const setB = b instanceof Set ? b : new Set(b);
  return a.some((x) => setB.has(x as T));
}

function normalizeGlob(g: string): string {
  return g.replace(/\\/g, "/");
}

function pathMatchesTask(globs: string[], taskPaths: string[]): boolean {
  if (taskPaths.length === 0) {
    return false;
  }
  for (const g of globs) {
    const pattern = normalizeGlob(g);
    const isMatch = picomatch(pattern, { dot: true });
    for (const p of taskPaths) {
      if (isMatch(normalizeGlob(p))) {
        return true;
      }
    }
  }
  return false;
}

/** Parse related ref: "id", "repo:id", "agentflow-trd:nfr" */
export function parseRelatedRef(
  raw: string,
): { source?: DocsSourceKey; id: string } | null {
  const s = raw.trim();
  if (!s) {
    return null;
  }
  if (s.includes(":")) {
    const [repo, ...rest] = s.split(":");
    const id = rest.join(":").trim();
    const map: Record<string, DocsSourceKey> = {
      "agentflow-architecture": "architecture",
      "agentflow-trd": "trd",
      "agentflow-engineering-standards": "engineering-standards",
    };
    const r = (repo ?? "").trim();
    const src = map[r];
    if (!src) {
      return { id };
    }
    return { source: src, id };
  }
  return { id: s };
}

function getEntry(
  bundle: ManifestBundle,
  source: DocsSourceKey,
  id: string,
): ManifestDocumentEntry | undefined {
  return bundle[source]?.documents.find((d) => d.id === id);
}

export interface SelectionResult {
  entries: {
    source: DocsSourceKey;
    entry: ManifestDocumentEntry;
    includedByPath: boolean;
  }[];
  /** True when only any-task docs would apply (warning per docs-resolution) */
  onlyAnyTask: boolean;
}

function isActiveStatus(status: string): boolean {
  return !IGNORED_STATUS.has(status);
}

/**
 * Document selection per architecture/docs/05-agentflow-docs-resolution.md
 * plus role-based filtering.
 */
export function selectDocuments(
  bundle: ManifestBundle,
  task: TaskInput,
  role: AgentRole,
): SelectionResult {
  const taskConsult = new Set(task.consult_when);
  const taskComponents = new Set(task.components ?? []);
  const roleConsult = new Set(ROLE_CONSULT_WHEN[role]);

  const included = new Map<
    string,
    { source: DocsSourceKey; entry: ManifestDocumentEntry; includedByPath: boolean }
  >();

  const tryAdd = (
    source: DocsSourceKey,
    entry: ManifestDocumentEntry,
    includedByPath: boolean,
  ) => {
    if (!isActiveStatus(entry.status)) {
      return;
    }
    included.set(entryKey(source, entry.id), {
      source,
      entry,
      includedByPath,
    });
  };

  (["architecture", "trd", "engineering-standards"] as DocsSourceKey[]).forEach(
    (source) => {
      const mf = bundle[source];
      if (!mf) {
        return;
      }
      for (const entry of mf.documents) {
        if (!isActiveStatus(entry.status)) {
          continue;
        }
        const byAny = entry.consult_when.includes("any-task");
        const byTask = intersects(entry.consult_when, taskConsult);
        const byPath =
          task.paths.length > 0 && pathMatchesTask(entry.applies_to, task.paths);
        const byComp = taskComponents.has(entry.id);

        if (byAny || byTask || byPath || byComp) {
          tryAdd(source, entry, byPath && !byAny && !byTask && !byComp);
        }
      }
    },
  );

  /** ADR expansion: related ADRs from already selected documents */
  let changed = true;
  while (changed) {
    changed = false;
    const snapshot = [...included.values()];
    for (const { source, entry } of snapshot) {
      for (const rel of entry.related ?? []) {
        const ref = parseRelatedRef(rel);
        if (!ref) {
          continue;
        }
        const targetSource = ref.source ?? source;
        const target = getEntry(bundle, targetSource, ref.id);
        if (!target || target.type !== "adr") {
          continue;
        }
        const k = entryKey(targetSource, target.id);
        if (!included.has(k) && isActiveStatus(target.status)) {
          tryAdd(targetSource, target, false);
          changed = true;
        }
      }
    }
  }

  /** Role filter */
  const roleFiltered = [...included.values()].filter((item) => {
    const { entry, includedByPath } = item;
    if (entry.consult_when.includes("any-task")) {
      return true;
    }
    if (intersects(entry.consult_when, roleConsult)) {
      return true;
    }
    if (intersects(entry.consult_when, taskConsult)) {
      return true;
    }
    if (includedByPath) {
      return ["developer", "tester", "reviewer", "architect"].includes(role);
    }
    return false;
  });

  const nonAnyOnly =
    roleFiltered.filter((x) => !x.entry.consult_when.includes("any-task"))
      .length === 0;

  return { entries: roleFiltered, onlyAnyTask: nonAnyOnly };
}

export function obligationFor(
  status: string,
): "mandatory" | "guidance" {
  return status === "accepted" ? "mandatory" : "guidance";
}

export function mergeLoaded(
  selected: SelectionResult,
  loaded: Map<string, LoadedDocument>,
): LoadedDocument[] {
  const out: LoadedDocument[] = [];
  for (const { source, entry } of selected.entries) {
    const doc = loaded.get(entryKey(source, entry.id));
    if (doc) {
      out.push(doc);
    }
  }
  return out;
}
