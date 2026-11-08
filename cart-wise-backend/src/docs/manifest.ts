import { parse as parseYaml } from "yaml";
import { z } from "zod";

import { manifestRepoToSourceKey } from "./config.js";
import { extractRulesSection } from "./markdown.js";
import { DocResolutionError } from "./errors.js";
import type {
  DocsSourceKey,
  LoadedDocument,
  ManifestDocumentEntry,
  ManifestFile,
} from "./types.js";
import { parseFrontmatter } from "./markdown.js";

const DocEntrySchema = z.object({
  id: z.string(),
  path: z.string(),
  type: z.string(),
  status: z.string(),
  consult_when: z.array(z.string()),
  applies_to: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  defines: z.array(z.string()).optional(),
  related: z.array(z.string()).optional(),
});

const ManifestSchema = z.object({
  schema_version: z.number(),
  repository: z.string(),
  product: z.string(),
  language: z.string(),
  documents: z.array(DocEntrySchema),
});

export function parseManifestYaml(raw: string): ManifestFile {
  let parsed: unknown;
  try {
    parsed = parseYaml(raw);
  } catch (e) {
    throw new DocResolutionError(
      "MANIFEST_INVALID",
      "manifest.yaml is not valid YAML",
      e,
    );
  }
  const result = ManifestSchema.safeParse(parsed);
  if (!result.success) {
    throw new DocResolutionError(
      "MANIFEST_INVALID",
      `manifest.yaml invalid: ${result.error.message}`,
    );
  }
  const data = result.data;
  return {
    schema_version: data.schema_version,
    repository: data.repository,
    product: data.product,
    language: data.language,
    documents: data.documents as ManifestDocumentEntry[],
  };
}

export function validateManifestSource(
  manifest: ManifestFile,
  expectedSource: DocsSourceKey,
): void {
  const key = manifestRepoToSourceKey(manifest.repository);
  if (key !== expectedSource) {
    throw new DocResolutionError(
      "MANIFEST_INVALID",
      `manifest repository field "${manifest.repository}" does not match source ${expectedSource}`,
    );
  }
}

function fmString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function fmStringArray(v: unknown): string[] | undefined {
  return Array.isArray(v) && v.every((x) => typeof x === "string")
    ? (v as string[])
    : undefined;
}

export function validateFrontmatterMatchesEntry(
  entry: ManifestDocumentEntry,
  frontmatter: Record<string, unknown>,
): void {
  const id = fmString(frontmatter.id);
  const type = fmString(frontmatter.type);
  const status = fmString(frontmatter.status);
  const consult = fmStringArray(frontmatter.consult_when);
  const applies = fmStringArray(frontmatter.applies_to);

  const mismatches: string[] = [];
  if (id !== entry.id) {
    mismatches.push(`id: fm=${id} manifest=${entry.id}`);
  }
  if (type !== entry.type) {
    mismatches.push(`type: fm=${type} manifest=${entry.type}`);
  }
  if (status !== entry.status) {
    mismatches.push(`status: fm=${status} manifest=${entry.status}`);
  }
  if (
    consult === undefined ||
    JSON.stringify(consult) !== JSON.stringify(entry.consult_when)
  ) {
    mismatches.push("consult_when differs from manifest");
  }
  if (
    applies === undefined ||
    JSON.stringify(applies) !== JSON.stringify(entry.applies_to)
  ) {
    mismatches.push("applies_to differs from manifest");
  }
  const fmPath = fmString(frontmatter.path);
  if (fmPath !== undefined && fmPath.replace(/\\/g, "/") !== entry.path) {
    mismatches.push(`path: fm=${fmPath} manifest=${entry.path}`);
  }
  if (mismatches.length > 0) {
    throw new DocResolutionError(
      "FRONTMATTER_MISMATCH",
      `Frontmatter diverges for ${entry.id}: ${mismatches.join("; ")}`,
    );
  }
}

export function entryToLoaded(
  source: DocsSourceKey,
  commit: string,
  entry: ManifestDocumentEntry,
  rawMd: string,
): LoadedDocument {
  const { frontmatter, body } = parseFrontmatter(rawMd);
  validateFrontmatterMatchesEntry(entry, frontmatter);
  const hostile: string[] = [];
  if (/<script[\s>]/i.test(body)) {
    hostile.push(`script tag in ${entry.path}`);
  }
  const rulesBlock = extractRulesSection(body);
  if (rulesBlock && /\b(eval|Function\s*\(|document\.write)\b/i.test(rulesBlock)) {
    hostile.push(`suspicious pattern in rules section of ${entry.path}`);
  }
  if (hostile.length > 0) {
    throw new DocResolutionError(
      "MANIFEST_INVALID",
      `Potentially unsafe content in ${entry.path}: ${hostile.join(", ")}`,
    );
  }
  return {
    source,
    commit,
    path: entry.path,
    id: entry.id,
    type: entry.type,
    status: entry.status,
    consult_when: entry.consult_when,
    applies_to: entry.applies_to,
    related: entry.related,
    frontmatter,
    body,
    rulesSection: rulesBlock,
  };
}
