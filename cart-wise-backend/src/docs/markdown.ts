import { parse as parseYaml } from "yaml";

export interface ParsedMarkdown {
  frontmatter: Record<string, unknown>;
  body: string;
}

/** Minimal YAML frontmatter parser */
export function parseFrontmatter(raw: string): ParsedMarkdown {
  const text = raw.replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") {
    return { frontmatter: {}, body: text };
  }
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
  if (end === -1) {
    return { frontmatter: {}, body: text };
  }
  const fmBlock = lines.slice(1, end).join("\n");
  let frontmatter: Record<string, unknown> = {};
  try {
    const parsed = parseYaml(fmBlock);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      frontmatter = parsed as Record<string, unknown>;
    }
  } catch {
    frontmatter = {};
  }
  const body = lines.slice(end + 1).join("\n");
  return { frontmatter, body };
}

export function extractRulesSection(body: string): string | null {
  const m = body.match(/^##\s+Regras para agentes\s*$/im);
  if (!m || m.index === undefined) {
    return null;
  }
  const rest = body.slice(m.index + m[0].length);
  const next = rest.search(/^##\s+/m);
  const block = next === -1 ? rest : rest.slice(0, next);
  return block.trim() || null;
}

/** Extract H3 subsections under ## Critérios de aceitação */
export function extractAcceptanceCriteria(body: string): string[] {
  const titleMatch = body.match(/^##\s+Critérios de aceitação\s*$/im);
  if (!titleMatch || titleMatch.index === undefined) {
    return [];
  }
  const after = body.slice(titleMatch.index + titleMatch[0].length);
  const nextH2 = after.search(/^##\s+/m);
  const section = nextH2 === -1 ? after : after.slice(0, nextH2);
  const parts = section.split(/^###\s+/m).slice(1);
  return parts.map((p) => p.trim()).filter(Boolean);
}
