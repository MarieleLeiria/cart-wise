import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { ExecutionAuditRecord } from "./types.js";

const SECRET_PATTERNS: RegExp[] = [
  /ghp_[A-Za-z0-9]{20,}/g,
  /github_pat_[A-Za-z0-9_]+/g,
  /x-access-token:[^\s@]+/gi,
  /https:\/\/[^@\s]+@[^\s]+/gi,
];

export function redactSecrets(text: string): string {
  let out = text;
  for (const re of SECRET_PATTERNS) {
    out = out.replace(re, "[REDACTED]");
  }
  return out;
}

export async function writeExecutionAudit(
  workspaceRoot: string,
  record: ExecutionAuditRecord,
): Promise<string> {
  const dir = join(workspaceRoot, ".agentflow", "runs");
  await mkdir(dir, { recursive: true });
  const safe = redactSecrets(JSON.stringify(record, null, 2));
  const path = join(dir, `${record.taskId}.json`);
  await writeFile(path, safe, "utf8");
  return path;
}
