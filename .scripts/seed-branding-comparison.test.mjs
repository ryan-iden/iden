import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeSeededSignInExperience } from "./compare-database.js";

const seed = {
  id: "default",
  tenant_id: "default",
  color: {
    primaryColor: "#007C91",
    darkPrimaryColor: "#67E8F9",
    isDarkModeEnabled: true,
  },
  branding: { logoUrl: "https://example.test/custom.svg" },
};

test("only exact new seed palettes compare as the previous seed without mutating inputs", () => {
  const previous = structuredClone(seed);
  assert.deepEqual(normalizeSeededSignInExperience(seed).color, {
    primaryColor: "#6139F6",
    darkPrimaryColor: "#8768F8",
    isDarkModeEnabled: false,
  });
  assert.equal(
    normalizeSeededSignInExperience({ ...seed, tenant_id: "admin" }).color
      .isDarkModeEnabled,
    true,
  );
  assert.deepEqual(seed, previous);
  assert.deepEqual(
    normalizeSeededSignInExperience(seed).branding,
    seed.branding,
  );
});

test("custom settings, other tenants and additional color fields remain strictly compared", () => {
  for (const row of [
    { ...seed, id: "custom" },
    { ...seed, tenant_id: "another-tenant" },
    { ...seed, color: { ...seed.color, primaryColor: "#123456" } },
    { ...seed, color: { ...seed.color, isDarkModeEnabled: false } },
    { ...seed, color: { ...seed.color, additional: "preserve" } },
  ])
    assert.equal(normalizeSeededSignInExperience(row), row);
});
