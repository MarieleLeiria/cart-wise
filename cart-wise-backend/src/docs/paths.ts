import { DocResolutionError } from "./errors.js";

const ALLOWED_PREFIXES = ["docs/", "adr/", "templates/", "manifest.yaml"] as const;

/** Normalize to POSIX-style relative path, reject traversal and absolute paths */
export function assertAllowedDocPath(raw: string): string {
  const trimmed = raw.trim().replace(/\\/g, "/");
  if (trimmed.startsWith("/") || trimmed.includes("..")) {
    throw new DocResolutionError(
      "PATH_NOT_ALLOWED",
      `Path not allowed: ${raw}`,
    );
  }
  const normalized = trimmed.replace(/^\.\/+/, "");
  const allowed = ALLOWED_PREFIXES.some(
    (p) => normalized === p || normalized.startsWith(p.endsWith("/") ? p : `${p}/`),
  );
  if (!allowed) {
    throw new DocResolutionError(
      "PATH_NOT_ALLOWED",
      `Path outside authorized roots: ${raw}`,
    );
  }
  return normalized;
}
