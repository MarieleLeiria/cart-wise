import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

import { DEFAULT_REPO_SOURCES } from "./config.js";
import { DocResolutionError } from "./errors.js";
import { assertAllowedDocPath } from "./paths.js";
import type { DocsSourceKey, RepoSourceConfig } from "./types.js";

const execFileAsync = promisify(execFile);

function sanitizeGitStderr(msg: string): string {
  return msg
    .replace(/https:\/\/[^@\s]+@[^\s]+/gi, "https://***")
    .replace(/x-access-token:[^\s@]+@/gi, "x-access-token:***@");
}

function authenticatedUrl(
  cfg: RepoSourceConfig,
): { url: string; hadToken: boolean } {
  const tokenVar = cfg.tokenEnvVar;
  const token = tokenVar ? process.env[tokenVar]?.trim() : undefined;
  if (!token) {
    return { url: cfg.gitUrl, hadToken: false };
  }
  try {
    const u = new URL(cfg.gitUrl);
    if (u.protocol !== "https:") {
      return { url: cfg.gitUrl, hadToken: false };
    }
    u.username = token;
    u.password = "x-oauth-basic";
    return { url: u.toString(), hadToken: true };
  } catch {
    return { url: cfg.gitUrl, hadToken: false };
  }
}

export class GitBareStore {
  readonly cacheRoot: string;
  private readonly sources: Record<DocsSourceKey, RepoSourceConfig>;

  constructor(
    cacheRoot: string,
    sources: Record<DocsSourceKey, RepoSourceConfig> = DEFAULT_REPO_SOURCES,
  ) {
    this.cacheRoot = cacheRoot;
    this.sources = sources;
  }

  private bareDir(source: DocsSourceKey): string {
    return join(this.cacheRoot, source);
  }

  async ensureObjectFetched(
    source: DocsSourceKey,
    commitSha: string,
  ): Promise<void> {
    const cfg = this.sources[source];
    const dir = this.bareDir(source);
    await mkdir(this.cacheRoot, { recursive: true });

    const git = async (args: string[]) => {
      try {
        await execFileAsync("git", ["-C", dir, ...args], {
          maxBuffer: 16 * 1024 * 1024,
        });
      } catch (e) {
        const err = e as { stderr?: string; message?: string };
        const raw = err.stderr ?? err.message ?? String(e);
        throw new DocResolutionError(
          "GIT_FETCH_FAILED",
          sanitizeGitStderr(`git ${args.join(" ")}: ${raw}`),
          e,
        );
      }
    };

    const hasObject = async (): Promise<boolean> => {
      try {
        const { stdout } = await execFileAsync(
          "git",
          ["-C", dir, "cat-file", "-e", `${commitSha}^{commit}`],
        );
        void stdout;
        return true;
      } catch {
        return false;
      }
    };

    let exists = false;
    try {
      await execFileAsync("git", ["-C", dir, "rev-parse", "--is-bare-repository"]);
      exists = true;
    } catch {
      exists = false;
    }

    if (!exists) {
      const { url } = authenticatedUrl(cfg);
      await mkdir(dir, { recursive: true });
      try {
        await execFileAsync("git", ["clone", "--bare", url, dir], {
          maxBuffer: 32 * 1024 * 1024,
        });
      } catch (e) {
        const err = e as { stderr?: string; message?: string };
        const raw = err.stderr ?? err.message ?? String(e);
        throw new DocResolutionError(
          "REPO_UNAVAILABLE",
          sanitizeGitStderr(`git clone --bare: ${raw}`),
          e,
        );
      }
    }

    if (!(await hasObject())) {
      const { url } = authenticatedUrl(cfg);
      const tryFetch = async (args: string[]) => {
        try {
          await git(["fetch", ...args, url]);
        } catch (e) {
          if (e instanceof DocResolutionError && e.code === "GIT_FETCH_FAILED") {
            throw new DocResolutionError(
              "COMMIT_NOT_FOUND",
              `Commit ${commitSha} not found in ${source}`,
              e,
            );
          }
          throw e;
        }
      };

      await tryFetch([commitSha]);

      let depth = 50;
      while (!(await hasObject()) && depth <= 10_000) {
        await tryFetch(["--depth", String(depth)]);
        depth *= 2;
      }
      if (!(await hasObject())) {
        await tryFetch(["--unshallow"]).catch(() => undefined);
      }
      if (!(await hasObject())) {
        throw new DocResolutionError(
          "COMMIT_NOT_FOUND",
          `Commit ${commitSha} not available in ${source} after fetch attempts`,
        );
      }
    }
  }

  async readBlobAtCommit(
    source: DocsSourceKey,
    commitSha: string,
    path: string,
  ): Promise<string> {
    const rel = assertAllowedDocPath(path);
    const dir = this.bareDir(source);
    try {
      const { stdout } = await execFileAsync(
        "git",
        ["-C", dir, "show", `${commitSha}:${rel}`],
        { maxBuffer: 16 * 1024 * 1024 },
      );
      return stdout;
    } catch (e) {
      const err = e as { stderr?: string; message?: string };
      const raw = err.stderr ?? err.message ?? String(e);
      if (/bad object|does not exist|fatal: path/i.test(raw)) {
        throw new DocResolutionError(
          "DOCUMENT_NOT_FOUND",
          sanitizeGitStderr(`${commitSha}:${rel}: ${raw}`),
          e,
        );
      }
      throw new DocResolutionError(
        "GIT_FETCH_FAILED",
        sanitizeGitStderr(raw),
        e,
      );
    }
  }
}

export async function assertGitAvailable(): Promise<void> {
  try {
    await execFileAsync("git", ["--version"], { maxBuffer: 64 * 1024 });
  } catch {
    throw new DocResolutionError(
      "GIT_NOT_FOUND",
      "git executable not found on PATH",
    );
  }
}
