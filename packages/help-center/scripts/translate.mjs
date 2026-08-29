import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import {
  isPublishableDocument,
  isTranslatableBlock,
  paths,
  readJson,
  readLocales,
  readSource,
  readVisibilityPolicy,
  sha256,
} from "./lib.mjs";

const localeIndex = process.argv.indexOf("--locales");
const requestedLocales = (localeIndex >= 0 ? process.argv[localeIndex + 1] : "")
  .split(",")
  .map((locale) => locale.trim())
  .filter(Boolean);
const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_DOCS_MODEL;

if (!apiKey || !model) {
  throw new Error(
    "OPENAI_API_KEY and OPENAI_DOCS_MODEL are required for local translation.",
  );
}
if (requestedLocales.length === 0) {
  throw new Error("Usage: pnpm docs:translate -- --locales <locale,locale>");
}

const supportedLocales = await readLocales();
for (const locale of requestedLocales) {
  if (!supportedLocales.includes(locale) || locale === "en") {
    throw new Error(`Unsupported translation locale: ${locale}`);
  }
}

const source = await readSource();
const policy = await readVisibilityPolicy();
const temporaryDirectory = await mkdtemp(
  path.join(tmpdir(), "iden-docs-translate-"),
);
const extractResult = spawnSync(
  "tar",
  ["-xzf", paths.archive, "-C", temporaryDirectory],
  {
    stdio: "inherit",
  },
);
if (extractResult.status !== 0) {
  throw new Error("Unable to extract the pinned documentation archive.");
}
const englishRoot = path.join(
  temporaryDirectory,
  `docs-${source.commit}`,
  "docs",
);

const readFilesRecursively = async (root) => {
  const entries = await readdir(root, { withFileTypes: true });
  const values = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(root, entry.name);
      return entry.isDirectory()
        ? readFilesRecursively(absolutePath)
        : [absolutePath];
    }),
  );
  return values.flat();
};

const documents = (await readFilesRecursively(englishRoot)).filter((file) =>
  isPublishableDocument(
    path.relative(englishRoot, file).replaceAll(path.sep, "/"),
    policy,
  ),
);
const sourceBlocks = new Map();
for (const document of documents) {
  const markdown = await readFile(document, "utf8");
  for (const block of markdown.split(/\n{2,}/)) {
    const normalized = block.trim();
    if (isTranslatableBlock(normalized)) {
      sourceBlocks.set(sha256(normalized), normalized);
    }
  }
}

const translateBatch = async (locale, batch) => {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions:
        "Translate documentation prose faithfully. Preserve Markdown, code, inline code, package names, class names, tag names, URNs, HTTP headers, placeholders, and third-party URLs exactly. Translate product prose from Logto to iden. Return only the requested JSON object.",
      input: JSON.stringify({ locale, segments: batch }),
      text: {
        format: {
          type: "json_schema",
          name: "documentation_translations",
          strict: true,
          schema: {
            type: "object",
            properties: {
              translations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    hash: { type: "string" },
                    translation: { type: "string" },
                  },
                  required: ["hash", "translation"],
                  additionalProperties: false,
                },
              },
            },
            required: ["translations"],
            additionalProperties: false,
          },
        },
      },
    }),
  });
  if (!response.ok) {
    throw new Error(
      `OpenAI translation failed: HTTP ${response.status} ${await response.text()}`,
    );
  }
  const result = await response.json();
  const outputText =
    result.output_text ??
    result.output
      ?.flatMap((item) => item.content ?? [])
      .find((item) => item.type === "output_text")?.text;
  if (!outputText) {
    throw new Error("OpenAI translation response did not include output text.");
  }
  return JSON.parse(outputText).translations;
};

for (const locale of requestedLocales) {
  const cachePath = path.join(paths.translations, `${locale}.json`);
  let cache = {
    version: 1,
    locale,
    model,
    sourceCommit: source.commit,
    entries: {},
  };
  try {
    await access(cachePath);
    cache = await readJson(cachePath);
  } catch {
    // Start a new incremental cache for this locale.
  }

  const pending = [...sourceBlocks]
    .filter(([hash]) => !cache.entries[hash])
    .map(([hash, text]) => ({ hash, text }));
  for (let index = 0; index < pending.length; index += 20) {
    const translations = await translateBatch(
      locale,
      pending.slice(index, index + 20),
    );
    for (const entry of translations) {
      const original = sourceBlocks.get(entry.hash);
      if (!original || typeof entry.translation !== "string") {
        throw new Error(
          `Invalid translated segment returned for ${entry.hash}.`,
        );
      }
      cache.entries[entry.hash] = {
        source: original,
        translation: entry.translation,
      };
    }
    await mkdir(paths.translations, { recursive: true });
    await writeFile(cachePath, `${JSON.stringify(cache, undefined, 2)}\n`);
    console.log(
      `${locale}: ${Math.min(index + 20, pending.length)}/${pending.length}`,
    );
  }
}

await rm(temporaryDirectory, { recursive: true, force: true });
