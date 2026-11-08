import { spawn } from "node:child_process";

export interface CommandResult {
  command: string;
  ok: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

/** Run allowlisted shell commands only; command strings must come from trusted config, never from documents */
export function runAllowlistedCommand(
  command: string,
  cwd: string,
  allowlist: string[],
): Promise<CommandResult> {
  if (!allowlist.includes(command)) {
    return Promise.resolve({
      command,
      ok: false,
      exitCode: null,
      stdout: "",
      stderr: "Command not in allowlist",
    });
  }
  return new Promise((resolve) => {
    const child = spawn(command, [], {
      cwd,
      shell: true,
      env: process.env,
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (d: Buffer) => {
      stdout += d.toString();
    });
    child.stderr?.on("data", (d: Buffer) => {
      stderr += d.toString();
    });
    child.on("close", (code) => {
      resolve({
        command,
        ok: code === 0,
        exitCode: code,
        stdout,
        stderr,
      });
    });
    child.on("error", (err) => {
      resolve({
        command,
        ok: false,
        exitCode: null,
        stdout,
        stderr: String(err),
      });
    });
  });
}

export interface AcceptanceCheck {
  criterionSummary: string;
  /** Automated checks cannot prove this criterion fully */
  unverifiable: boolean;
}

export function mapAcceptanceToCommands(
  acceptanceBlocks: string[],
): AcceptanceCheck[] {
  return acceptanceBlocks.map((block) => {
    const needsBrowser =
      /\b(navegador|chrome|aba|popup|extens[aã]o|p[aá]gina|toast|badge)\b/i.test(
        block,
      );
    const hasAutomatedHint =
      /\b(vitest|npm test|playwright|eslint|tsc|typecheck|ci)\b/i.test(block);
    const unverifiable = needsBrowser || !hasAutomatedHint;
    return {
      criterionSummary: block.slice(0, 300),
      unverifiable,
    };
  });
}
