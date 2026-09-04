import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const alterationDirectory = "packages/schemas/alterations";

export const latestAlterationTimestamp = (filenames) => {
  const timestamps = filenames
    .filter((name) => !name.includes("/") && name.endsWith(".ts"))
    .map((name) => {
      const match = /-(\d{1,10}(?:\.\d+)?)(?:-.*)?\.ts$/.exec(name);
      if (!match) {
        throw new Error(`Invalid alteration filename: ${name}`);
      }
      return Number(match[1]);
    });
  if (timestamps.length === 0) {
    throw new Error("The baseline contains no alteration scripts");
  }
  return Math.max(...timestamps);
};

export const resolveAlterationBaseline = (baseSha, cwd = process.cwd()) => {
  // Only accept event-provided immutable revisions, never shell fragments or revision options.
  if (!/^[a-f0-9]{40}$/.test(baseSha ?? "") || /^0+$/.test(baseSha)) {
    throw new Error("ALTERATION_BASE_SHA must be a nonzero full commit SHA");
  }
  const git = (...args) =>
    execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
  const ref = git("merge-base", baseSha, "HEAD");
  const filenames = git(
    "ls-tree",
    "--name-only",
    `${ref}:${alterationDirectory}`,
  ).split("\n");
  return { ref, timestamp: latestAlterationTimestamp(filenames) };
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const { ref, timestamp } = resolveAlterationBaseline(
    process.env.ALTERATION_BASE_SHA,
  );
  console.log(`ref=${ref}\ntimestamp=${timestamp}`);
}
