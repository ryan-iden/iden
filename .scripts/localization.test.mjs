import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getInterfaceLocale,
  getInterfacePhrases,
  interfaceResources,
} from "../packages/phrases-experience/lib/interface.js";

const protectedParts = (text) =>
  text.match(/\{\{[^}]+\}\}|<\/?[A-Za-z][^>]*>|`[^`]*`/g)?.sort() ?? [];

test("shared interface copy has complete translations and identical placeholders in all 20 locales", () => {
  assert.equal(Object.keys(interfaceResources).length, 20);
  const keys = Object.keys(interfaceResources.en).sort();
  for (const [locale, phrases] of Object.entries(interfaceResources)) {
    assert.deepEqual(Object.keys(phrases).sort(), keys, locale);
    for (const key of keys) {
      assert.ok(phrases[key].trim(), `${locale}.${key}`);
      assert.deepEqual(
        protectedParts(phrases[key]),
        protectedParts(interfaceResources.en[key]),
        `${locale}.${key}`,
      );
    }
  }
});

test("interface locale resolution supports regional fallbacks and Chinese variants", () => {
  assert.equal(getInterfaceLocale("en-US"), "en");
  assert.equal(getInterfaceLocale("zh-CN"), "zh-CN");
  assert.equal(getInterfaceLocale("zh-TW"), "zh-TW");
  assert.equal(getInterfaceLocale("unknown"), "en");
  assert.equal(getInterfacePhrases("zh-CN").username, "用户名");
  assert.notEqual(
    getInterfacePhrases("zh-TW").username,
    getInterfacePhrases("en").username,
  );
});
