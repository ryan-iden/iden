import { createReadStream } from "node:fs";
import {
  access,
  cp,
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

import { marked } from "marked";
import { build } from "esbuild";
import { getInterfacePhrases } from "@logto/phrases-experience/lib/interface.js";

import {
  applyTranslationCache,
  assertPublishedContentIsSafe,
  escapeHtml,
  isPublishableDocument,
  paths,
  readLocales,
  readSource,
  readVisibilityPolicy,
  routeFromRelativePath,
  sha256,
  transformMdx,
} from "./lib.mjs";

const readFilesRecursively = async (root) => {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(root, entry.name);
      if (entry.isDirectory()) {
        return readFilesRecursively(absolutePath);
      }
      return [absolutePath];
    }),
  );

  return nested.flat();
};

const hashFile = async (file) => {
  const chunks = [];
  for await (const chunk of createReadStream(file)) {
    chunks.push(chunk);
  }
  return sha256(Buffer.concat(chunks));
};

const source = await readSource();
const locales = await readLocales();
const policy = await readVisibilityPolicy();
const actualArchiveHash = await hashFile(paths.archive);

if (actualArchiveHash !== source.archiveSha256) {
  throw new Error(
    `Documentation archive checksum mismatch: expected ${source.archiveSha256}, received ${actualArchiveHash}`,
  );
}

const temporaryDirectory = await mkdtemp(
  path.join(tmpdir(), "iden-help-center-"),
);
const extractDirectory = path.join(temporaryDirectory, "source");
await mkdir(extractDirectory, { recursive: true });

const extractResult = spawnSync(
  "tar",
  ["-xzf", paths.archive, "-C", extractDirectory],
  {
    stdio: "inherit",
  },
);
if (extractResult.status !== 0) {
  throw new Error("Unable to extract the pinned documentation source archive.");
}

const extractedEntries = await readdir(extractDirectory, {
  withFileTypes: true,
});
const sourceRootEntry = extractedEntries.find((entry) => entry.isDirectory());
if (!sourceRootEntry?.name.endsWith(source.commit)) {
  throw new Error(
    "The documentation archive root does not match the pinned commit.",
  );
}

const upstreamRoot = path.join(extractDirectory, sourceRootEntry.name);
const englishRoot = path.join(upstreamRoot, "docs");
const allEnglishFiles = await readFilesRecursively(englishRoot);
const englishDocuments = allEnglishFiles
  .map((file) => path.relative(englishRoot, file).replaceAll(path.sep, "/"))
  .filter((relativePath) => isPublishableDocument(relativePath, policy))
  .sort((left, right) => left.localeCompare(right));

await rm(paths.dist, { recursive: true, force: true });
await mkdir(paths.dist, { recursive: true });

const assetsRoot = path.join(paths.dist, "assets/upstream");
for (const file of allEnglishFiles) {
  if (/\.(?:md|mdx)$/i.test(file)) {
    continue;
  }
  const relativePath = path.relative(englishRoot, file);
  const target = path.join(assetsRoot, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await cp(file, target);
}

const staticRoot = path.join(upstreamRoot, "static");
try {
  await access(staticRoot);
  const staticFiles = await readFilesRecursively(staticRoot);
  for (const file of staticFiles) {
    if (/\.(?:md|mdx|txt)$/i.test(file)) {
      continue;
    }
    const relativePath = path.relative(staticRoot, file);
    const target = path.join(assetsRoot, "static", relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    await cp(file, target);
  }
} catch {
  // The upstream static directory is optional; document-local assets are already copied above.
}

const availableUpstreamLocales = new Map(
  await Promise.all(
    locales.map(async (locale) => {
      if (locale === "en") {
        return [locale, englishRoot];
      }
      const root = path.join(
        upstreamRoot,
        "i18n",
        locale,
        "docusaurus-plugin-content-docs/current",
      );
      try {
        await access(root);
        return [locale, root];
      } catch {
        return [locale, englishRoot];
      }
    }),
  ),
);

const primaryNavigation = [
  ["introduction", "introduction"],
  ["quick-starts", "quick_starts"],
  ["integrate-iden", "integration"],
  ["end-user-flows", "end_user_flows"],
  ["authorization", "authorization"],
  ["user-management", "user_management"],
  ["security", "security"],
  ["customization", "customization"],
  ["connectors", "connectors"],
  ["organizations", "organizations"],
  ["iden-oss", "self_hosting"],
];

const idenMark = await readFile(
  path.join(paths.packageRoot, "../toolkit/core-kit/assets/iden-mark.svg"),
  "utf8",
);
const inlineIdenMark = idenMark.replace(
  "<svg ",
  '<svg aria-hidden="true" class="brand-mark" ',
);

await build({
  entryPoints: [path.join(paths.packageRoot, "src/surface.js")],
  outdir: path.join(paths.dist, "assets"),
  entryNames: "surface",
  assetNames: "[name]-[hash]",
  publicPath: "/help/assets",
  bundle: true,
  minify: true,
  format: "esm",
  target: ["es2022"],
  loader: { ".woff2": "file", ".woff": "file" },
  external: ["/help/pagefind/pagefind.js"],
});

const renderNavigation = (locale, currentRoute) =>
  primaryNavigation
    .map(([route, label]) => {
      const isCurrent =
        currentRoute === route || currentRoute.startsWith(`${route}/`);
      return `<a href="/help/${locale}/${route}/"${isCurrent ? ' aria-current="page"' : ""}>${escapeHtml(getInterfacePhrases(locale)[label])}</a>`;
    })
    .join("");

const renderLocaleOptions = (currentLocale, route) =>
  locales
    .map(
      (locale) =>
        `<option value="/help/${locale}/${route}/"${locale === currentLocale ? " selected" : ""}>${locale}</option>`,
    )
    .join("");

const renderPage = ({
  locale,
  route,
  title,
  description,
  content,
  sourcePath,
  sourceHash,
}) => {
  const safeTitle = escapeHtml(title);
  const ui = getInterfacePhrases(locale);
  const t = (key) => escapeHtml(ui[key]);
  const page = `<!doctype html>
<html lang="${escapeHtml(locale)}" dir="${["ar", "fa-IR"].includes(locale) ? "rtl" : "ltr"}" data-product-brand="iden"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#007C91"><meta name="description" content="${escapeHtml(description)}"><title>${safeTitle} · ${t("help_title")}</title><link rel="stylesheet" href="/help/assets/surface.css"><script>const p=new URLSearchParams(location.search);document.documentElement.dataset.theme=p.get('theme')==='dark'||(!p.has('theme')&&matchMedia('(prefers-color-scheme:dark)').matches)?'dark':'light';if(p.get('embedded')==='1')document.documentElement.classList.add('is-embedded');</script></head>
<body><button data-iden-press class="menu-button" type="button" aria-label="${t("open_navigation")}">${t("menu")}</button><div class="shell"><aside class="sidebar"><a class="brand" href="/help/${locale}/">${inlineIdenMark}<img alt="" class="brand-custom-logo"><span data-platform-brand-name>iden</span></a><input class="search" type="search" placeholder="${t("search_help")}" aria-label="${t("search_help")}"><div class="search-results"></div><select class="search" aria-label="${t("language")}" onchange="location.href=this.value">${renderLocaleOptions(locale, route)}</select><nav>${renderNavigation(locale, route)}<a data-open-source-notice class="about-link" href="/help/${locale}/about/">${t("about")}</a></nav></aside><main class="content"><div class="compatibility">${t("compatibility_notice")}</div><article data-pagefind-body><h1 data-pagefind-meta="title">${safeTitle}</h1>${content}</article><footer data-open-source-notice class="source-note">${t("source")}: logto-io/docs@${source.commit.slice(0, 12)} · ${escapeHtml(sourcePath)} · ${sourceHash.slice(0, 12)}</footer></main><nav class="toc" aria-label="${safeTitle}"></nav></div>
<script type="module" src="/help/assets/surface.js"></script></body></html>`;
  assertPublishedContentIsSafe(page, policy, `${locale}/${route}`);
  return page;
};

const writePage = async (locale, route, html) => {
  const directory = path.join(paths.dist, locale, route);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), html);
};

const buildLocale = async (locale, localeRoot) => {
  const ui = getInterfacePhrases(locale);
  const t = (key) => escapeHtml(ui[key]);
  let translationCache;
  try {
    translationCache = JSON.parse(
      await readFile(path.join(paths.translations, `${locale}.json`), "utf8"),
    );
  } catch {
    // Upstream translations and English fallback remain authoritative when no local cache exists.
  }
  let count = 0;
  for (const relativePath of englishDocuments) {
    const localizedPath = path.join(localeRoot, relativePath);
    let selectedPath = localizedPath;
    try {
      await access(localizedPath);
    } catch {
      selectedPath = path.join(englishRoot, relativePath);
    }

    const contentSource = applyTranslationCache(
      await readFile(selectedPath, "utf8"),
      translationCache,
    );
    const transformed = transformMdx(
      contentSource,
      relativePath,
      locale,
      policy,
    );
    const rendered = marked.parse(transformed.markdown, {
      gfm: true,
      breaks: false,
    });
    const route = routeFromRelativePath(relativePath);
    await writePage(
      locale,
      route,
      renderPage({
        locale,
        route,
        title: transformed.title,
        description: transformed.description,
        content: rendered,
        sourcePath: relativePath,
        sourceHash: transformed.sourceHash,
      }),
    );
    count += 1;
  }

  const aboutContent = `<p><strong data-platform-brand-name>iden</strong> — <span data-platform-brand-slogan>Identity, Unified.</span></p><div data-open-source-notice><p>${t("license_notice")}</p><ul><li><a href="https://www.mozilla.org/MPL/2.0/">Mozilla Public License 2.0</a></li><li><a href="https://github.com/logto-io/logto">${t("upstream_repository")}</a></li><li><a href="https://github.com/ryan-iden/iden">${t("current_fork")}</a></li></ul></div><p>${t("compatibility_notice")}</p>`;
  await writePage(
    locale,
    "about",
    renderPage({
      locale,
      route: "about",
      title: ui.about,
      description: ui.about_description,
      content: aboutContent,
      sourcePath: "local/about",
      sourceHash: sha256(aboutContent),
    }),
  );

  await writeFile(
    path.join(paths.dist, locale, "index.html"),
    `<!doctype html><html lang="${escapeHtml(locale)}"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/help/${locale}/introduction/"><title>${t("help_title")}</title><a href="/help/${locale}/introduction/">${t("open_help")}</a></html>`,
  );

  await writePage(
    locale,
    "404",
    renderPage({
      locale,
      route: "404",
      title: ui.page_not_found,
      description: ui.page_not_found_description,
      content:
        "<p>" +
        t("page_not_found_description") +
        '</p><a href="/help/' +
        locale +
        '/">' +
        t("help_title") +
        "</a>",
      sourcePath: "local/404",
      sourceHash: sha256(ui.page_not_found),
    }),
  );
  return count + 2;
};

const localeCounts = {};
for (const [locale, localeRoot] of availableUpstreamLocales) {
  localeCounts[locale] = await buildLocale(locale, localeRoot);
}

const redirectsSource = await readFile(
  path.join(upstreamRoot, "static/_redirects-docs"),
  "utf8",
);
const redirects = redirectsSource
  .split("\n")
  .map((line) => line.trim().split(/\s+/))
  .filter(
    ([from, to]) =>
      from?.startsWith("/") &&
      to?.startsWith("/") &&
      !from.includes("*") &&
      !to.includes("*") &&
      isPublishableDocument(`${from.replace(/^\/+/, "")}.mdx`, policy) &&
      isPublishableDocument(
        `${to.split("#", 1)[0].replace(/^\/+/, "")}.mdx`,
        policy,
      ),
  );

for (const locale of availableUpstreamLocales.keys()) {
  for (const [from, to] of redirects) {
    const fromRoute = routeFromRelativePath(from.replace(/^\/+|\/$/g, ""));
    const [targetPath, hash = ""] = to.split("#", 2);
    const targetRoute = routeFromRelativePath(
      targetPath.replace(/^\/+|\/$/g, ""),
    );
    const target = `/help/${locale}/${targetRoute}/${hash ? `#${hash}` : ""}`;
    const directory = path.join(paths.dist, locale, fromRoute);
    try {
      await access(path.join(directory, "index.html"));
      continue;
    } catch {
      await mkdir(directory, { recursive: true });
    }
    await writeFile(
      path.join(directory, "index.html"),
      `<!doctype html><html lang="${escapeHtml(locale)}"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${escapeHtml(target)}"><title>${escapeHtml(getInterfacePhrases(locale).help_title)}</title><a href="${escapeHtml(target)}">${escapeHtml(getInterfacePhrases(locale).continue)}</a></html>`,
    );
  }
}

let repairedLocalLinks = 0;
for (const locale of availableUpstreamLocales.keys()) {
  const localeRoot = path.join(paths.dist, locale);
  const htmlFiles = (await readFilesRecursively(localeRoot)).filter((file) =>
    file.endsWith(".html"),
  );
  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    let changed = false;
    const repaired = await Promise.all(
      [
        ...html.matchAll(/href="(\/help\/([^/]+)\/([^"?#]*)(?:[?#][^"]*)?)"/g),
      ].map(async ([fullMatch, href, targetLocale, targetRoute]) => {
        // Static bundles and fonts are not localized documentation routes.
        if (!locales.includes(targetLocale)) return [fullMatch, fullMatch];
        const target = path.join(
          paths.dist,
          targetLocale,
          targetRoute || "introduction",
          "index.html",
        );
        try {
          await access(target);
          return [fullMatch, fullMatch];
        } catch {
          changed = true;
          repairedLocalLinks += 1;
          return [fullMatch, `href="/help/${locale}/introduction/"`];
        }
      }),
    );
    if (changed) {
      const replacements = new Map(repaired);
      await writeFile(
        file,
        html.replaceAll(
          /href="\/help\/[^" ]+"/g,
          (match) => replacements.get(match) ?? match,
        ),
      );
    }
  }
}

const notFound = renderPage({
  locale: "en",
  route: "404",
  title: "Page not found",
  description: "The requested help page could not be found.",
  content:
    '<p>Return to the <a href="/help/en/">help center home</a> or use search.</p>',
  sourcePath: "local/404",
  sourceHash: sha256("Page not found"),
});
await writeFile(path.join(paths.dist, "404.html"), notFound);
await writeFile(
  path.join(paths.dist, "index.html"),
  '<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/help/en/"><title>iden Help</title><a href="/help/en/">Open iden Help</a></html>',
);

const pagefindResult = spawnSync(
  process.platform === "win32" ? "pagefind.cmd" : "pagefind",
  ["--site", paths.dist, "--output-subdir", "pagefind", "--glob", "**/*.html"],
  { cwd: paths.packageRoot, stdio: "inherit" },
);
if (pagefindResult.status !== 0) {
  throw new Error("Pagefind indexing failed.");
}

await writeFile(
  path.join(paths.dist, "source-attribution.json"),
  `${JSON.stringify(
    {
      ...source,
      archiveSha256: actualArchiveHash,
      visibilityPolicyVersion: policy.version,
      locales,
      localeCounts,
      englishDocumentCount: englishDocuments.length,
      repairedLocalLinks,
    },
    undefined,
    2,
  )}\n`,
);

await rm(temporaryDirectory, { recursive: true, force: true });
console.log(
  `Built iden Help from ${englishDocuments.length} source documents for ${locales.length} locales.`,
);
