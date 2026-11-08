import { execFileSync, execSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DEFAULT_REPO_SOURCES } from "./docs/config.js";
import { readDocsLock } from "./docs/lock.js";
import { assertAllowedDocPath } from "./docs/paths.js";
import { selectDocuments } from "./docs/select.js";
import { resolveDocsForTask, buildContextsForRoles } from "./docs/resolver.js";
import { DocResolutionError } from "./docs/errors.js";
import { entryToLoaded } from "./docs/manifest.js";
import type { DocsSourceKey, ManifestDocumentEntry } from "./docs/types.js";

const ORIGINAL_REPO_URLS = {
  architecture: DEFAULT_REPO_SOURCES.architecture.gitUrl,
  trd: DEFAULT_REPO_SOURCES.trd.gitUrl,
  engineeringStandards:
    DEFAULT_REPO_SOURCES["engineering-standards"].gitUrl,
};

function createBareRepo(files: Record<string, string>): {
  barePath: string;
  sha: string;
} {
  const base = mkdtempSync(join(tmpdir(), "af-git-"));
  const work = join(base, "work");
  mkdirSync(work, { recursive: true });
  for (const [rel, content] of Object.entries(files)) {
    const full = join(work, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content, "utf8");
  }
  execSync("git init", { cwd: work, stdio: "pipe" });
  execSync("git config user.email t@e.st", { cwd: work });
  execSync("git config user.name test", { cwd: work });
  execSync("git add -A", { cwd: work });
  execSync("git commit -m init", { cwd: work, stdio: "pipe" });
  const sha = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: work,
  })
    .toString()
    .trim();
  const bare = join(base, "repo.git");
  execSync(`git clone --bare "${work}" "${bare}"`, {
    cwd: base,
    stdio: "pipe",
  });
  return { barePath: bare, sha };
}

async function writeLockFile(
  dir: string,
  shas: Record<DocsSourceKey, string>,
): Promise<void> {
  await writeFile(
    join(dir, "agentflow.docs.lock.yaml"),
    `version: 1
sources:
  architecture:
    repo: "https://github.com/MarieleLeiria/architecture-cart-wise"
    commit: "${shas.architecture}"
  trd:
    repo: "https://github.com/MarieleLeiria/trd-cart-wise"
    commit: "${shas.trd}"
  engineering-standards:
    repo: "https://github.com/MarieleLeiria/engineering-standards-cart-wise"
    commit: "${shas["engineering-standards"]}"
`,
    "utf8",
  );
}

describe("DEFAULT_REPO_SOURCES", () => {
  it("lists three repos and token env var names", () => {
    expect(DEFAULT_REPO_SOURCES.trd.gitUrl).toContain("github.com");
    expect(DEFAULT_REPO_SOURCES.trd.tokenEnvVar).toBe(
      "AGENTFLOW_DOCS_TOKEN_TRD",
    );
  });
});

describe("readDocsLock", () => {
  it("rejects abbreviated SHA", async () => {
    const dir = await mkdtemp(join(tmpdir(), "af-lock-"));
    await writeFile(
      join(dir, "lock.yaml"),
      `version: 1
sources:
  architecture:
    repo: "https://github.com/MarieleLeiria/architecture-cart-wise"
    commit: "941a73a570e033884f227188993b5a738c2f970"
  trd:
    repo: "https://github.com/MarieleLeiria/trd-cart-wise"
    commit: "a2b4cd32619a71d2e7aa93ccdbcfb683f1442bbd"
  engineering-standards:
    repo: "https://github.com/MarieleLeiria/engineering-standards-cart-wise"
    commit: "d662c6f3f89a07c1a1fd3b9ff8778b4f4d33677d"
`,
      "utf8",
    );
    await expect(readDocsLock(join(dir, "lock.yaml"))).rejects.toThrow(
      DocResolutionError,
    );
  });
});

describe("assertAllowedDocPath", () => {
  it("rejects traversal", () => {
    expect(() => assertAllowedDocPath("../evil.md")).toThrow(DocResolutionError);
  });

  it("allows docs path", () => {
    expect(assertAllowedDocPath("docs/foo.md")).toBe("docs/foo.md");
  });
});

describe("integration: local bare repos", () => {
  let workspace: string;
  let shas: Record<DocsSourceKey, string>;

  beforeAll(async () => {
    workspace = await mkdtemp(join(tmpdir(), "af-ws-"));
    process.env.AGENTFLOW_DOCS_SKIP_REPO_URL_MATCH = "1";

    const arch = createBareRepo({
      "manifest.yaml": `schema_version: 1
repository: agentflow-architecture
product: cart-wise
language: pt-BR
documents:
  - id: overview
    path: docs/overview.md
    type: overview
    status: proposed
    consult_when: [any-task]
    applies_to: ["**"]
`,
      "docs/overview.md": `---
id: overview
path: docs/overview.md
type: overview
status: proposed
consult_when: [any-task]
applies_to: ["**"]
---

# O

## Regras para agentes

- DEVE testar.
`,
    });

    const trd = createBareRepo({
      "manifest.yaml": `schema_version: 1
repository: agentflow-trd
product: cart-wise
language: pt-BR
documents:
  - id: feat-sample
    path: docs/feat.md
    type: feature
    status: proposed
    consult_when: [change-capture]
    applies_to: ["src/**"]
`,
      "docs/feat.md": `---
id: feat-sample
path: docs/feat.md
type: feature
status: proposed
consult_when: [change-capture]
applies_to: ["src/**"]
---

# F

## Critérios de aceitação

### FR-1
Rodar npm test no repositório.

## Regras para agentes

- DEVE cobrir FR-1.
`,
    });

    const eng = createBareRepo({
      "manifest.yaml": `schema_version: 1
repository: agentflow-engineering-standards
product: cart-wise
language: pt-BR
documents:
  - id: code-style
    path: docs/std.md
    type: standard
    status: proposed
    consult_when: [write-code]
    applies_to: ["src/**"]
`,
      "docs/std.md": `---
id: code-style
path: docs/std.md
type: standard
status: proposed
consult_when: [write-code]
applies_to: ["src/**"]
---

# S

## Regras para agentes

- DEVE usar TypeScript strict.
`,
    });

    shas = {
      architecture: arch.sha,
      trd: trd.sha,
      "engineering-standards": eng.sha,
    };

    DEFAULT_REPO_SOURCES.architecture.gitUrl = pathToFileURL(
      arch.barePath,
    ).href;
    DEFAULT_REPO_SOURCES.trd.gitUrl = pathToFileURL(trd.barePath).href;
    DEFAULT_REPO_SOURCES["engineering-standards"].gitUrl = pathToFileURL(
      eng.barePath,
    ).href;

    await writeLockFile(workspace, shas);
  });

  afterAll(() => {
    DEFAULT_REPO_SOURCES.architecture.gitUrl = ORIGINAL_REPO_URLS.architecture;
    DEFAULT_REPO_SOURCES.trd.gitUrl = ORIGINAL_REPO_URLS.trd;
    DEFAULT_REPO_SOURCES["engineering-standards"].gitUrl =
      ORIGINAL_REPO_URLS.engineeringStandards;
  });

  it("resolves docs and routes feat-sample to developer", async () => {
    const task = {
      id: "T-1",
      consult_when: ["change-capture"],
      paths: ["src/foo.ts"],
    };
    const resolved = await resolveDocsForTask(task, {
      workspaceRoot: workspace,
      lockPath: join(workspace, "agentflow.docs.lock.yaml"),
      cacheDir: join(workspace, "cache"),
    });
    const devSel = selectDocuments(resolved.manifests, task, "developer");
    expect(devSel.entries.some((e) => e.entry.id === "feat-sample")).toBe(
      true,
    );
    const ctxs = buildContextsForRoles(
      resolved.manifests,
      task,
      resolved.loaded,
    );
    expect(
      ctxs.developer.items.some((i) => i.documentId === "feat-sample"),
    ).toBe(true);
  });

  it("cache: second resolve with same lock yields same trd commit", async () => {
    const task = {
      id: "T-cache",
      consult_when: ["change-capture"],
      paths: ["src/x.ts"],
    };
    const r1 = await resolveDocsForTask(task, {
      workspaceRoot: workspace,
      lockPath: join(workspace, "agentflow.docs.lock.yaml"),
      cacheDir: join(workspace, "cache2"),
    });
    const r2 = await resolveDocsForTask(task, {
      workspaceRoot: workspace,
      lockPath: join(workspace, "agentflow.docs.lock.yaml"),
      cacheDir: join(workspace, "cache2"),
    });
    const c1 = r1.loaded.find((d) => d.source === "trd")?.commit;
    const c2 = r2.loaded.find((d) => d.source === "trd")?.commit;
    expect(c1).toBe(shas.trd);
    expect(c2).toBe(shas.trd);
  });

  it("different trd SHA resolves different body", async () => {
    const trdB = createBareRepo({
      "manifest.yaml": `schema_version: 1
repository: agentflow-trd
product: cart-wise
language: pt-BR
documents:
  - id: feat-sample
    path: docs/feat.md
    type: feature
    status: proposed
    consult_when: [change-capture]
    applies_to: ["src/**"]
`,
      "docs/feat.md": `---
id: feat-sample
path: docs/feat.md
type: feature
status: proposed
consult_when: [change-capture]
applies_to: ["src/**"]
---

# F2
`,
    });

    const wsB = await mkdtemp(join(tmpdir(), "af-wsb-"));
    await writeLockFile(wsB, {
      architecture: shas.architecture,
      trd: trdB.sha,
      "engineering-standards": shas["engineering-standards"],
    });

    const prevTrdUrl = DEFAULT_REPO_SOURCES.trd.gitUrl;
    DEFAULT_REPO_SOURCES.trd.gitUrl = pathToFileURL(trdB.barePath).href;

    const task = {
      id: "T-b",
      consult_when: ["change-capture"],
      paths: ["src/y.ts"],
    };
    const resolved = await resolveDocsForTask(task, {
      workspaceRoot: wsB,
      lockPath: join(wsB, "agentflow.docs.lock.yaml"),
      cacheDir: join(wsB, "cache"),
    });
    const feat = resolved.loaded.find(
      (d) => d.source === "trd" && d.id === "feat-sample",
    );
    expect(feat?.commit).toBe(trdB.sha);
    expect(feat?.body).toContain("F2");

    DEFAULT_REPO_SOURCES.trd.gitUrl = prevTrdUrl;
  });
});

describe("entryToLoaded", () => {
  const entry: ManifestDocumentEntry = {
    id: "x",
    path: "docs/x.md",
    type: "feature",
    status: "proposed",
    consult_when: ["any-task"],
    applies_to: ["**"],
  };
  const commit = "a".repeat(40);

  it("rejects script in body", () => {
    const raw = `---
id: x
path: docs/x.md
type: feature
status: proposed
consult_when: [any-task]
applies_to: ["**"]
---
<script>alert(1)</script>
`;
    expect(() =>
      entryToLoaded("trd", commit, entry, raw),
    ).toThrow(DocResolutionError);
  });

  it("loads valid doc", () => {
    const raw = `---
id: x
path: docs/x.md
type: feature
status: proposed
consult_when: [any-task]
applies_to: ["**"]
---

## Regras para agentes

- OK
`;
    const doc = entryToLoaded("trd", commit, entry, raw);
    expect(doc.id).toBe("x");
    expect(doc.rulesSection).toContain("OK");
  });
});
