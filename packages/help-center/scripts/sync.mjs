import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { paths, readSource } from "./lib.mjs";

const refIndex = process.argv.indexOf("--ref");
const commit = refIndex >= 0 ? process.argv[refIndex + 1] : undefined;
if (!commit || !/^[a-f\d]{40}$/i.test(commit)) {
  throw new Error("Usage: pnpm docs:sync -- --ref <40-character commit>");
}

const response = await fetch(
  `https://github.com/logto-io/docs/archive/${commit}.tar.gz`,
  {
    redirect: "follow",
  },
);
if (!response.ok) {
  throw new Error(
    `Unable to download logto-io/docs@${commit}: HTTP ${response.status}`,
  );
}

const archive = Buffer.from(await response.arrayBuffer());
const temporaryDirectory = await mkdtemp(
  path.join(tmpdir(), "iden-docs-sync-"),
);
const temporaryArchive = path.join(temporaryDirectory, "upstream.tar.gz");
await writeFile(temporaryArchive, archive);

const listResult = spawnSync("tar", ["-tzf", temporaryArchive], {
  encoding: "utf8",
});
if (
  listResult.status !== 0 ||
  !listResult.stdout.startsWith(`docs-${commit}/`)
) {
  throw new Error("The downloaded archive did not match the requested commit.");
}

const source = await readSource();
const archiveSha256 = createHash("sha256").update(archive).digest("hex");
await mkdir(path.dirname(paths.archive), { recursive: true });
await writeFile(paths.archive, archive);
await writeFile(
  path.join(paths.packageRoot, "source.json"),
  `${JSON.stringify(
    {
      ...source,
      commit,
      archiveSha256,
      syncedAt: new Date().toISOString(),
    },
    undefined,
    2,
  )}\n`,
);

await rm(temporaryDirectory, { recursive: true, force: true });
console.log(`Synchronized logto-io/docs@${commit} (${archiveSha256}).`);
