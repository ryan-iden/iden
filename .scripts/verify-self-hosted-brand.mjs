import { access, lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const roots = [
  "packages/console/dist",
  "packages/experience/dist",
  "packages/account/dist",
  "packages/demo-app/dist",
  "packages/device-demo-app/dist",
  "packages/help-center/dist",
];
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".svg",
  ".txt",
]);
const forbiddenPatterns = [
  "cloud.logto.io",
  "docs.logto.io",
  "numbers.logto.io",
  "Logto Cloud",
  "Powered by Logto",
];

const readFilesRecursively = async (root) => {
  const entries = await readdir(root, { withFileTypes: true });
  const values = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(root, entry.name);
      if (entry.isSymbolicLink()) {
        return [];
      }
      return entry.isDirectory()
        ? readFilesRecursively(absolutePath)
        : [absolutePath];
    }),
  );
  return values.flat();
};

const violations = [];
for (const root of roots) {
  await access(root);
  for (const file of await readFilesRecursively(root)) {
    if (!textExtensions.has(path.extname(file))) {
      continue;
    }
    const content = await readFile(file, "utf8");
    for (const pattern of forbiddenPatterns) {
      if (content.includes(pattern)) {
        violations.push(`${file}: ${pattern}`);
      }
    }
  }
}

const requiredLocales = JSON.parse(
  await readFile("packages/help-center/locales.json", "utf8"),
);
for (const locale of requiredLocales) {
  const localeRoot = path.join("packages/help-center/dist", locale);
  if ((await lstat(localeRoot)).isSymbolicLink()) {
    throw new Error(
      `Help locale ${locale} must be built as an independent search surface.`,
    );
  }
  const entryPath = path.join(localeRoot, "introduction/index.html");
  await access(entryPath);
  const entry = await readFile(entryPath, "utf8");
  if (!entry.includes(`<html lang="${locale}"`)) {
    throw new Error(`Help locale ${locale} has an incorrect document language.`);
  }
}
await access("packages/help-center/dist/pagefind/pagefind.js");

if (violations.length > 0) {
  throw new Error(
    `Forbidden self-hosted product strings found:\n${violations.join("\n")}`,
  );
}

console.log(
  `Verified iden branding and local help output across ${requiredLocales.length} locales.`,
);
