import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  applyTranslationCache,
  isPublishableDocument,
  paths,
  protectCode,
  readLocales,
  readSource,
  readVisibilityPolicy,
  rebrandDocumentationText,
  routeFromRelativePath,
  sha256,
  transformMdx,
} from "./lib.mjs";

test("rebrands product prose while preserving compatibility identifiers", () => {
  assert.equal(
    rebrandDocumentationText(
      "Use LogtoClient from @logto/browser with Logto-ID-Token when integrating Logto.",
    ),
    "Use LogtoClient from @logto/browser with Logto-ID-Token when integrating iden.",
  );
});

test("protects fenced and inline code from prose transforms", () => {
  const protectedCode = protectCode(
    "`Logto`\n\n```ts\nconst Logto = true;\n```",
  );
  assert.equal(
    protectedCode.restore(protectedCode.value),
    "`Logto`\n\n```ts\nconst Logto = true;\n```",
  );
});

test("filters Cloud routes and Cloud-only prose blocks", async () => {
  const policy = await readVisibilityPolicy();
  assert.equal(isPublishableDocument("logto-cloud/billing.mdx", policy), false);
  assert.equal(
    isPublishableDocument("security/password-policy.mdx", policy),
    true,
  );
  const transformed = transformMdx(
    "# Security\n\nUseful self-hosted guidance.\n\nThis is available in Logto Cloud only.",
    "security/README.mdx",
    "en",
    policy,
  );
  assert.match(transformed.markdown, /Useful self-hosted guidance/);
  assert.doesNotMatch(transformed.markdown, /Cloud only|Logto Cloud/);
});

test("converts navigation components and strips MDX runtime syntax", async () => {
  const policy = await readVisibilityPolicy();
  const transformed = transformMdx(
    `# Introduction

## Explore \\{#explore}

<NavGroup
  label="Security"
  items={[
    { icon: <KeyIcon />, docId: 'security/password-policy' },
  ]}
/>

<DocCardList
  items={[
    { type: 'link', label: 'Cloud', href: 'https://cloud.logto.io', description: 'Logto Cloud only.' },
    { type: 'link', label: 'Security', href: '/security', description: 'Configure secure access.' },
  ]}
/>`,
    "introduction/README.mdx",
    "en",
    policy,
  );
  assert.doesNotMatch(
    transformed.markdown,
    /NavGroup|DocCardList|docId|\{#explore\}/,
  );
  assert.match(
    transformed.markdown,
    /\[password policy\]\(\/help\/en\/security\/password-policy\/\)/,
  );
  assert.match(
    transformed.markdown,
    /\*\*\[Security\]\(\/help\/en\/security\/\)\*\* — Configure secure access\./,
  );
  assert.doesNotMatch(transformed.markdown, /^# Introduction/m);
});

test("maps inherited documentation routes to the iden namespace", () => {
  assert.equal(
    routeFromRelativePath("integrate-logto/README.mdx"),
    "integrate-iden",
  );
  assert.equal(
    routeFromRelativePath("logto-oss/get-started.mdx"),
    "iden-oss/get-started",
  );
});

test("applies incremental paragraph translations by source hash", () => {
  const source =
    "A sufficiently long source paragraph for translation.\n\n```ts\nLogtoClient\n```";
  const block = source.split("\n\n")[0];
  const translated = applyTranslationCache(source, {
    entries: {
      [sha256(block)]: { translation: "Translated documentation paragraph." },
    },
  });
  assert.match(translated, /^Translated documentation paragraph\./);
  assert.match(translated, /LogtoClient/);
});

test("pins the complete locale union and archive checksum", async () => {
  const locales = await readLocales();
  assert.deepEqual(locales, [
    "ar",
    "cs",
    "de",
    "en",
    "es",
    "fa-IR",
    "fr",
    "it",
    "ja",
    "ko",
    "pl-PL",
    "pt-BR",
    "pt-PT",
    "ru",
    "th",
    "tr-TR",
    "uk-UA",
    "zh-CN",
    "zh-HK",
    "zh-TW",
  ]);
  const archive = await readFile(paths.archive);
  const source = await readSource();
  assert.equal(sha256(archive), source.archiveSha256);
});
