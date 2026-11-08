export type DocErrorCode =
  | "LOCK_INVALID"
  | "GIT_NOT_FOUND"
  | "GIT_FETCH_FAILED"
  | "COMMIT_NOT_FOUND"
  | "MANIFEST_INVALID"
  | "DOCUMENT_NOT_FOUND"
  | "FRONTMATTER_MISMATCH"
  | "PATH_NOT_ALLOWED"
  | "REPO_UNAVAILABLE";

export class DocResolutionError extends Error {
  readonly code: DocErrorCode;
  readonly cause?: unknown;

  constructor(code: DocErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "DocResolutionError";
    this.code = code;
    this.cause = cause;
  }
}
