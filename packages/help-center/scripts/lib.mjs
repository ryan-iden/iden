import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const paths = Object.freeze({
  packageRoot,
  archive: path.join(packageRoot, "vendor/upstream.tar.gz"),
  dist: path.join(packageRoot, "dist"),
  translations: path.join(packageRoot, "translations"),
});

export const readJson = async (file) =>
  JSON.parse(await readFile(file, "utf8"));
export const readSource = async () =>
  readJson(path.join(packageRoot, "source.json"));
export const readLocales = async () =>
  readJson(path.join(packageRoot, "locales.json"));
export const readVisibilityPolicy = async () =>
  readJson(path.join(packageRoot, "visibility-policy.json"));

export const sha256 = (value) =>
  createHash("sha256").update(value).digest("hex");

export const splitFrontmatter = (source) => {
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n?/.exec(source);

  if (!match) {
    return { attributes: {}, body: source };
  }

  const attributes = Object.fromEntries(
    match[1]
      .split("\n")
      .map((line) => /^([\w-]+):\s*(.*)$/.exec(line))
      .filter(Boolean)
      .map((entry) => [entry[1], entry[2].replace(/^['"]|['"]$/g, "")]),
  );

  return { attributes, body: source.slice(match[0].length) };
};

export const routeFromRelativePath = (relativePath) => {
  const extensionless = relativePath.replace(/\.(?:md|mdx)$/i, "");
  const withoutIndex = extensionless.replace(/(?:^|\/)README$/i, "");
  const branded = withoutIndex
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.replaceAll(/logto/gi, "iden"))
    .join("/");

  return branded || "introduction";
};

export const isPublishableDocument = (relativePath, policy) => {
  const normalized = relativePath.replaceAll("\\", "/").toLowerCase();
  const segments = normalized.split("/");

  return (
    /\.(?:md|mdx)$/.test(normalized) &&
    !segments.some(
      (segment) => segment.startsWith("_") || segment === "fragments",
    ) &&
    !policy.excludedRouteSegments.some((segment) =>
      segments.includes(segment.toLowerCase()),
    )
  );
};

const protectedTokenPatterns = [
  /@logto\/[\w./-]+/gi,
  /\burn:logto:[\w:./-]+/gi,
  /\blogto-[\w-]+/gi,
  /\bLogto(?:Client|RequestError|Error|Config|Provider)\b/g,
  /Logto-ID-Token/g,
  /Logto-Host/g,
];

export const protectTechnicalTokens = (value) => {
  const tokens = [];
  const protectedValue = protectedTokenPatterns.reduce(
    (result, pattern) =>
      result.replaceAll(pattern, (match) => {
        const index = tokens.push(match) - 1;
        return `@@IDEN_TECH_${index}@@`;
      }),
    value,
  );

  return {
    value: protectedValue,
    restore: (result) =>
      result.replaceAll(
        /@@IDEN_TECH_(\d+)@@/g,
        (_, index) => tokens[Number(index)] ?? "",
      ),
  };
};

export const rebrandDocumentationText = (value) => {
  const protectedTokens = protectTechnicalTokens(value);
  const branded = protectedTokens.value
    .replaceAll(/Logto Cloud/g, "iden")
    .replaceAll(/Logto/g, "iden")
    .replaceAll(/LOGTO/g, "IDEN");

  return protectedTokens.restore(branded);
};

export const protectCode = (markdown) => {
  const values = [];
  const reserve = (match) => {
    const index = values.push(match) - 1;
    return `@@IDEN_CODE_${index}@@`;
  };
  const value = markdown
    .replaceAll(/```[\s\S]*?```/g, reserve)
    .replaceAll(/`[^`\n]+`/g, reserve);

  return {
    value,
    restore: (result) =>
      result.replaceAll(
        /@@IDEN_CODE_(\d+)@@/g,
        (_, index) => values[Number(index)] ?? "",
      ),
  };
};

export const removeCloudOnlyBlocks = (markdown, policy) =>
  markdown
    .split(/\n{2,}/)
    .filter((block) => {
      return !policy.excludedBlockPatterns.some((pattern) =>
        block.toLowerCase().includes(pattern.toLowerCase()),
      );
    })
    .join("\n\n");

export const isTranslatableBlock = (block) => {
  const trimmed = block.trim();
  return (
    trimmed.length >= 20 &&
    !trimmed.startsWith("```") &&
    !trimmed.startsWith("import ") &&
    !trimmed.startsWith("export ") &&
    !/^<[A-Z][\s\S]*\/>$/.test(trimmed)
  );
};

export const applyTranslationCache = (markdown, cache) =>
  markdown
    .split(/(\n{2,})/)
    .map((block) => {
      if (!isTranslatableBlock(block)) {
        return block;
      }
      return cache?.entries?.[sha256(block.trim())]?.translation ?? block;
    })
    .join("");

const normalizeLinkTarget = (target) => target.split(/[?#]/, 1)[0];

export const rewriteDocumentationLinks = (markdown, relativePath, locale) => {
  const sourceDirectory = path.posix.dirname(
    relativePath.replaceAll("\\", "/"),
  );

  return markdown.replaceAll(
    /(!?)\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
    (match, image, label, target) => {
      if (/^(?:mailto:|tel:|#|\/help\/)/i.test(target)) {
        return match;
      }

      if (/^https?:\/\//i.test(target)) {
        try {
          const url = new URL(target);
          if (url.hostname !== "docs.logto.io") {
            return match;
          }

          const localRoute = routeFromRelativePath(
            url.pathname.replace(/^\/+/, ""),
          );
          return `[${label}](/help/${locale}/${localRoute}/${url.hash})`;
        } catch {
          return match;
        }
      }

      const cleanTarget = normalizeLinkTarget(target);
      const resolved = cleanTarget.startsWith("/")
        ? cleanTarget.replace(/^\/+/, "")
        : path.posix.normalize(path.posix.join(sourceDirectory, cleanTarget));

      if (image) {
        return `![${label}](/help/assets/upstream/${resolved.replace(/^\.\.\//, "")})`;
      }

      if (/\.(?:png|jpe?g|gif|webp|svg|avif)$/i.test(cleanTarget)) {
        return match;
      }

      const route = routeFromRelativePath(resolved.replace(/^docs\//, ""));
      return `[${label}](/help/${locale}/${route}/)`;
    },
  );
};

const convertNavigationGroups = (markdown, locale) =>
  markdown.replaceAll(/^<NavGroup\b[\s\S]*?^\/>\s*$/gm, (group) => {
    const label = /label=["']([^"']+)["']/.exec(group)?.[1] ?? "Related guides";
    const links = [...group.matchAll(/docId:\s*["']([^"']+)["']/g)].map(
      ([, docId]) => {
        const route = routeFromRelativePath(docId);
        const title = rebrandDocumentationText(
          routeFromRelativePath(docId).split("/").at(-1).replaceAll("-", " "),
        );
        return `- [${title}](/help/${locale}/${route}/)`;
      },
    );

    return links.length > 0 ? `### ${label}\n\n${links.join("\n")}` : "";
  });

const convertDocumentCards = (markdown, policy) =>
  markdown.replaceAll(/^<DocCardList\b[\s\S]*?^\/>\s*$/gm, (group) => {
    const cards = [
      ...group.matchAll(
        /type:\s*["']link["'][\s\S]*?description:\s*\n?\s*(["'])(.*?)\1\s*[,}]/g,
      ),
    ]
      .map((match) => {
        const block = match[0];
        const label = /label:\s*["']([^"']+)["']/.exec(block)?.[1];
        const target = /(?:href|to):\s*["']([^"']+)["']/.exec(block)?.[1];
        const description = match[2];
        if (!label || !target || !description) {
          return undefined;
        }

        const candidate = `${label} ${target} ${description}`.toLowerCase();
        if (
          policy.excludedBlockPatterns.some((pattern) =>
            candidate.includes(pattern.toLowerCase()),
          )
        ) {
          return undefined;
        }

        return `- **[${label}](${target})** — ${description}`;
      })
      .filter(Boolean);

    return cards.join("\n");
  });

const convertInlineMdxLinks = (markdown) =>
  markdown.replaceAll(
    /<Url\s+href=["']([^"']+)["']>([\s\S]*?)<\/Url>/g,
    "[$2]($1)",
  );

const removeMdxRuntimeSyntax = (markdown) =>
  markdown
    .replaceAll(/^import\s[\s\S]*?;\s*$/gm, "")
    .replaceAll(/^export\s[\s\S]*?;\s*$/gm, "")
    .replaceAll(/^<[A-Z][A-Za-z0-9]*\b[\s\S]*?^\/>\s*$/gm, "")
    .replaceAll(/^<br\s*\/?>\s*$/gim, "")
    .replaceAll(/<\/?[A-Z][^>]*>/g, "")
    .replaceAll(/\\?\{#[\w-]+\}/g, "")
    .replaceAll(/^:::\w+.*$/gm, ">")
    .replaceAll(
      /<(?:script|style|iframe|object)[\s\S]*?<\/(?:script|style|iframe|object)>/gi,
      "",
    );

export const transformMdx = (source, relativePath, locale, policy) => {
  const { attributes, body } = splitFrontmatter(source);
  const withoutCloudCode = body.replaceAll(/```[\s\S]*?```/g, (codeBlock) =>
    policy.forbiddenPublishedPatterns.some((pattern) =>
      codeBlock.toLowerCase().includes(pattern.toLowerCase()),
    )
      ? ""
      : codeBlock,
  );
  const protectedCode = protectCode(withoutCloudCode);
  const withNavigation = convertNavigationGroups(protectedCode.value, locale);
  const withCards = convertDocumentCards(withNavigation, policy);
  const withInlineLinks = convertInlineMdxLinks(withCards);
  const withoutRuntime = removeMdxRuntimeSyntax(withInlineLinks);
  const filtered = removeCloudOnlyBlocks(withoutRuntime, policy);
  const withLocalLinks = rewriteDocumentationLinks(
    filtered,
    relativePath,
    locale,
  );
  const branded = rebrandDocumentationText(withLocalLinks);
  const restored = protectedCode.restore(branded).trim();
  const heading = /^#\s+(.+)$/m
    .exec(restored)?.[1]
    ?.replace(/\s*\{#.+?\}\s*$/, "");
  const markdown = restored.replace(/^#\s+.+?(?:\n+|$)/, "").trim();
  const fallbackTitle = path
    .basename(routeFromRelativePath(relativePath))
    .replaceAll("-", " ");

  return {
    title: rebrandDocumentationText(
      attributes.title || heading || fallbackTitle,
    ),
    description: rebrandDocumentationText(attributes.description || ""),
    markdown,
    sourceHash: sha256(source),
  };
};

export const assertPublishedContentIsSafe = (html, policy, fileName) => {
  for (const pattern of policy.forbiddenPublishedPatterns) {
    if (html.toLowerCase().includes(pattern.toLowerCase())) {
      throw new Error(
        `Forbidden published documentation pattern "${pattern}" in ${fileName}`,
      );
    }
  }
};

export const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
