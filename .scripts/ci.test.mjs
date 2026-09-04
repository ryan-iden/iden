import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import {
  latestAlterationTimestamp,
  resolveAlterationBaseline,
} from "./alteration-baseline.mjs";

test("migration timestamps include unreleased scripts and fractional suffixes", () => {
  assert.equal(
    latestAlterationTimestamp([
      "1.42.0-1785722831-change.ts",
      "next-1785722831.1-change.ts",
      "next-1785722832-change.ts",
      "helpers",
      "helpers/ignore.ts",
    ]),
    1785722832,
  );
  assert.equal(
    latestAlterationTimestamp(["next-1785722831.1-change.ts"]),
    1785722831.1,
  );
});

test("migration baseline fails closed on missing or malformed input", () => {
  for (const sha of [undefined, "", "0".repeat(40), "--help", "HEAD; false"]) {
    assert.throws(() => resolveAlterationBaseline(sha), /full commit SHA/);
  }
  assert.throws(() => latestAlterationTimestamp([]), /no alteration scripts/);
  assert.throws(
    () => latestAlterationTimestamp(["next-1785722831000-change.ts"]),
    /Invalid alteration/,
  );
});

test("tagless fork uses the merge base, not head or a newer base-branch migration", (t) => {
  const directory = mkdtempSync(join(tmpdir(), "iden-ci-baseline-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const git = (...args) =>
    execFileSync("git", args, {
      cwd: directory,
      encoding: "utf8",
      env: {
        ...process.env,
        GIT_CONFIG_GLOBAL: "/dev/null",
        GIT_CONFIG_SYSTEM: "/dev/null",
      },
    }).trim();
  git("init", "-b", "personal");
  git("config", "user.name", "CI Fixture");
  git("config", "user.email", "ci@example.test");
  const alterations = join(directory, "packages/schemas/alterations");
  mkdirSync(alterations, { recursive: true });
  const commit = (filename) => {
    writeFileSync(join(alterations, filename), "// test fixture\n");
    git("add", ".");
    git("commit", "-m", "test fixture");
    return git("rev-parse", "HEAD");
  };
  const base = commit("next-1785722831-base.ts");
  git("checkout", "-b", "fix");
  commit("next-1785722832-fix.ts");
  git("checkout", "personal");
  const tip = commit("next-1785722833-unrelated.ts");
  git("checkout", "fix");
  assert.equal(git("tag", "--list"), "");
  assert.deepEqual(resolveAlterationBaseline(base, directory), {
    ref: base,
    timestamp: 1785722831,
  });
  assert.deepEqual(resolveAlterationBaseline(tip, directory), {
    ref: base,
    timestamp: 1785722831,
  });
});

test("release tar works from a renamed checkout and preserves relative symlinks", (t) => {
  const directory = mkdtempSync(join(tmpdir(), "iden-ci-archive-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const source = join(directory, "iden checkout");
  const extracted = join(directory, "extracted");
  const archive = join(directory, "package.tar.gz");
  mkdirSync(source);
  mkdirSync(extracted);
  writeFileSync(join(source, "package.json"), '{"name":"iden"}');
  symlinkSync("package.json", join(source, "link"));
  // Exercise only the archive step; dependency pruning must never run in the working checkout.
  const script = readFileSync(
    new URL("./package.sh", import.meta.url),
    "utf8",
  ).split("echo Tar the package\n")[1];
  assert.ok(script);
  execFileSync("bash", ["-euc", script], {
    cwd: source,
    env: { ...process.env, PACKAGE_ARCHIVE_PATH: archive },
  });
  execFileSync("tar", [
    "-xzf",
    archive,
    "--strip-components=1",
    "-C",
    extracted,
  ]);
  assert.equal(
    readFileSync(join(extracted, "package.json"), "utf8"),
    '{"name":"iden"}',
  );
  assert.equal(
    readFileSync(join(extracted, "link"), "utf8"),
    '{"name":"iden"}',
  );
});

test("metadata jobs never check out PR code or execute downloaded scripts", () => {
  const workflow = readFileSync(
    new URL("../.github/workflows/update-pr-metadata.yml", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    workflow,
    /actions\/checkout|execSync|execFileSync|\brun:|curl\b/,
  );
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /pull-requests: write/);
  assert.match(workflow, /comparison\.merge_base_commit\.sha/);
});
