import AdmZip from "adm-zip";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
if (!existsSync(join(dist, "manifest.json"))) {
  throw new Error("dist/manifest.json not found. Run `npm run build` first.");
}

const { version } = JSON.parse(readFileSync(join(dist, "manifest.json"), "utf8"));
const zip = new AdmZip();
zip.addLocalFolder(dist);

const entries = zip.getEntries().map((e) => e.entryName);
const unwanted = entries.filter((n) => n.endsWith(".map"));
if (unwanted.length > 0) {
  throw new Error(`Sourcemaps in package: ${unwanted.join(", ")}`);
}

mkdirSync("release", { recursive: true });
const out = join("release", `cart-wise-${version}.zip`);
zip.writeZip(out);
console.log(`Created ${out} (${entries.length} entries)`);
