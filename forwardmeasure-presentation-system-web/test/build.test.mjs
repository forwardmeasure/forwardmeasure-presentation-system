/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { build, compileTailwindTheme, compileTokens, roleTokenNames } from "../scripts/build.mjs";

const MODULE = join(dirname(fileURLToPath(import.meta.url)), "..");
const tokens = JSON.parse(readFileSync(join(MODULE, "design", "tokens.json"), "utf8"));

const sample = {
  name: "Sample",
  color: {
    themes: [{ id: "light" }, { id: "dark" }],
    tokens: [
      { name: "slate-50", value: "#fbf7e9" },
      { name: "surface", value: { light: "{slate-50}", dark: "#111110" } },
      { name: "ink", value: "#1b3644" },
    ],
  },
  shadow: { tokens: [{ name: "shadow-raised", value: { light: "0 1px 2px #0001", dark: "0 1px 2px #0008" } }] },
  spacing: { tokens: [{ name: "space-1", value: "4px" }] },
  radius: { tokens: [{ name: "radius-sm", value: "2px" }] },
  type: {
    families: { sans: '"Didact Gothic", sans-serif' },
    groups: [{ name: "Text", family: "sans", styles: [{ name: "body", fontSize: "16px", lineHeight: "26px", fontWeight: 400 }] }],
  },
};

test("aliases compile to var() and each theme gets its own block", () => {
  const css = compileTokens(sample);
  assert.match(css, /:root, \[data-theme="light"\] \{[^}]*--surface: var\(--slate-50\);/);
  assert.match(css, /\[data-theme="dark"\] \{[^}]*--surface: #111110;/);
  assert.match(css, /\[data-theme="dark"\] \{[^}]*--shadow-raised: 0 1px 2px #0008;/);
  assert.doesNotMatch(css, /\[data-theme="dark"\] \{[^}]*--ink:/, "a single-value token belongs to the first theme only");
});

test("before the theme logic runs, the dark values follow the operating system", () => {
  const css = compileTokens(sample);
  assert.match(css, /@media \(prefers-color-scheme: dark\) \{\s*:root:not\(\[data-theme\]\) \{[^}]*--surface: #111110;/);
});

test("spacing, radius, font families and text styles are emitted", () => {
  const css = compileTokens(sample);
  for (const decl of ["--space-1: 4px;", "--radius-sm: 2px;", '--font-sans: "Didact Gothic", sans-serif;']) {
    assert.ok(css.includes(decl), decl);
  }
  assert.match(css, /\.kg-text-body \{ font-family: var\(--font-sans\); font-size: 16px; line-height: 26px; font-weight: 400; \}/);
});

test("the Tailwind mapping covers role tokens only, never ramps", () => {
  const css = compileTailwindTheme(sample);
  assert.ok(css.includes("--color-surface: var(--surface);"));
  assert.ok(!css.includes("slate-50"));
  assert.deepEqual(roleTokenNames(sample), ["surface", "ink"]);
});

test("every token the component styles use is defined by the real tokens", () => {
  const defined = new Set([
    ...tokens.color.tokens.map((t) => t.name),
    ...(tokens.shadow?.tokens ?? []).map((t) => t.name),
    ...(tokens.spacing?.tokens ?? []).map((t) => t.name),
    ...(tokens.radius?.tokens ?? []).map((t) => t.name),
    ...Object.keys(tokens.type.families).map((k) => `font-${k}`),
  ]);
  const components = readFileSync(join(MODULE, "design", "components.css"), "utf8");
  const local = new Set([...components.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1].slice(2)));
  const used = new Set([...components.matchAll(/var\(--([a-z0-9-]+)/g)].map((m) => m[1]));
  const missing = [...used].filter((n) => !defined.has(n) && !local.has(n));
  assert.deepEqual(missing, []);
});

test("components use role tokens only", () => {
  const components = readFileSync(join(MODULE, "design", "components.css"), "utf8");
  const ramps = [...components.matchAll(/var\(--((?:wada|slate|sienna|olive|terracotta|glaucous|khaki|oil|grayish-olive|etruscan|oil-green)-[a-z0-9-]+)/g)].map((m) => m[1]);
  assert.deepEqual(ramps, []);
});

test("the package build bundles every font weight and exports its entry points", () => {
  if (!existsSync(join(MODULE, "node_modules", "@fontsource"))) return; // runs after npm ci
  const out = build(mkdtempSync(join(tmpdir(), "presentation-system-")));
  const fonts = readFileSync(join(out, "fonts.css"), "utf8");
  for (const family of ["Roboto", "Didact Gothic", "IBM Plex Mono"]) assert.ok(fonts.includes(`font-family: '${family}'`), family);
  assert.doesNotMatch(fonts, /\.woff\)/, "woff fallbacks are dropped; every browser in use reads woff2");
  for (const m of fonts.matchAll(/url\(\.\/fonts\/([^)]+)\)/g)) assert.ok(existsSync(join(out, "fonts", m[1])), m[1]);
  assert.ok(readdirSync(join(out, "fonts")).length > 10, "every script subset, not only Latin");
  const pkg = JSON.parse(readFileSync(join(out, "package.json"), "utf8"));
  for (const entry of Object.values(pkg.exports)) {
    const file = typeof entry === "string" ? entry : entry.default;
    // A pattern export (./brands/*) points at a folder of files.
    assert.ok(existsSync(join(out, file.replace(/\/\*$/, ""))), file);
  }
  for (const form of ["mark", "symbol", "lockup"]) {
    for (const theme of ["light", "dark"]) assert.ok(existsSync(join(out, "brands", "kriyagentic", `kriyagentic-${form}-${theme}.svg`)), `${form} ${theme}`);
  }
  for (const icon of ["kriyagentic-favicon.svg", "kriyagentic-favicon-light-32.png", "kriyagentic-favicon-dark-32.png"]) {
    assert.ok(existsSync(join(out, "brands", "kriyagentic", icon)), icon);
  }
  assert.ok(!("devDependencies" in pkg) && !("dependencies" in pkg), "the built package needs nothing at install time");
  assert.deepEqual(pkg.peerDependencies, { react: ">=18" }, "the shell uses the app's own React");
});
