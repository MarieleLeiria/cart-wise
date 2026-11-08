import { readFile } from "node:fs/promises";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

import { DocResolutionError } from "./errors.js";
import type { DocsLockFile, DocsSourceKey } from "./types.js";

const sha40 = z.string().regex(/^[0-9a-f]{40}$/i, "SHA must be 40 hex chars");

const LockSchema = z.object({
  version: z.literal(1),
  sources: z
    .object({
      architecture: z.object({ repo: z.string(), commit: sha40 }),
      trd: z.object({ repo: z.string(), commit: sha40 }),
      "engineering-standards": z.object({
        repo: z.string(),
        commit: sha40,
      }),
    })
    .partial()
    .refine(
      (s) =>
        s.architecture !== undefined &&
        s.trd !== undefined &&
        s["engineering-standards"] !== undefined,
      "All three sources (architecture, trd, engineering-standards) are required",
    ),
});

export async function readDocsLock(lockPath: string): Promise<DocsLockFile> {
  let raw: string;
  try {
    raw = await readFile(lockPath, "utf8");
  } catch (e) {
    throw new DocResolutionError(
      "LOCK_INVALID",
      `Cannot read lock file: ${lockPath}`,
      e,
    );
  }
  let parsed: unknown;
  try {
    parsed = parseYaml(raw);
  } catch (e) {
    throw new DocResolutionError(
      "LOCK_INVALID",
      "Lock file YAML is invalid",
      e,
    );
  }
  const result = LockSchema.safeParse(parsed);
  if (!result.success) {
    throw new DocResolutionError(
      "LOCK_INVALID",
      `Lock file invalid: ${result.error.message}`,
    );
  }
  const src = result.data.sources;
  const out: DocsLockFile = {
    version: 1,
    sources: {
      architecture: src.architecture!,
      trd: src.trd!,
      "engineering-standards": src["engineering-standards"]!,
    },
  };
  return out;
}

export function assertLockCommitsPresent(
  lock: DocsLockFile,
): asserts lock is DocsLockFile & {
  sources: Record<DocsSourceKey, { repo: string; commit: string }>;
} {
  const keys: DocsSourceKey[] = [
    "architecture",
    "trd",
    "engineering-standards",
  ];
  for (const k of keys) {
    const e = lock.sources[k];
    if (!e?.commit || e.commit.length !== 40) {
      throw new DocResolutionError("LOCK_INVALID", `Missing commit for ${k}`);
    }
  }
}
