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

// Builds the @forwardmeasure/presentation-system npm package into target/package: the compiled
// tokens, the component styles, the bundled fonts, the Tailwind theme mapping and the theme logic.
// No dependencies beyond Node itself; the @fontsource packages are read from node_modules.

import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const MODULE = join(dirname(fileURLToPath(import.meta.url)), "..");

const RAMP = /^(wada-|slate-|sienna-|olive-|terracotta-|glaucous-|khaki-|oil-|grayish-olive-|etruscan-|oil-green-)/;

/** Font families and weights the system uses, from the pinned @fontsource packages. */
export const FONTS = [
  { pkg: "roboto", weights: ["500", "700"] },
  { pkg: "didact-gothic", weights: ["400"] },
  { pkg: "ibm-plex-mono", weights: ["400", "500"] },
];

const value = (v) => {
  const alias = /^\{(.+)\}$/.exec(v);
  return alias ? `var(--${alias[1]})` : v;
};

/** Compiles tokens.json into CSS custom properties, laid out as the design system compiles them. */
export function compileTokens(tokens) {
  const themes = tokens.color.themes.map((t) => t.id);
  const [first, ...later] = themes;
  const firstDecls = [];
  const laterDecls = Object.fromEntries(later.map((t) => [t, []]));
  const themed = [...tokens.color.tokens, ...(tokens.shadow?.tokens ?? [])];
  for (const token of themed) {
    if (typeof token.value === "string") {
      firstDecls.push(`  --${token.name}: ${value(token.value)};`);
      continue;
    }
    const base = token.value[first] ?? Object.values(token.value)[0];
    firstDecls.push(`  --${token.name}: ${value(base)};`);
    for (const theme of later) {
      if (token.value[theme] !== undefined) {
        laterDecls[theme].push(`  --${token.name}: ${value(token.value[theme])};`);
      }
    }
  }
  const plain = [];
  for (const [family, tokenList] of Object.entries(tokens)) {
    if (["name", "version", "meta", "color", "type", "shadow"].includes(family)) continue;
    for (const token of tokenList?.tokens ?? []) plain.push(`  --${token.name}: ${token.value};`);
  }
  for (const [key, stack] of Object.entries(tokens.type.families)) plain.push(`  --font-${key}: ${stack};`);

  const out = [`/* ${tokens.name} tokens, generated from design/tokens.json. Do not edit. */`];
  out.push(`:root, [data-theme="${first}"] {\n${firstDecls.join("\n")}\n}`);
  for (const theme of later) {
    out.push(`[data-theme="${theme}"] {\n${laterDecls[theme].join("\n")}\n}`);
    // Before the app's theme logic runs (no data-theme yet), follow the operating system.
    out.push(`@media (prefers-color-scheme: ${theme}) {\n  :root:not([data-theme]) {\n${laterDecls[theme].map((d) => "  " + d).join("\n")}\n  }\n}`);
  }
  out.push(`:root {\n${plain.join("\n")}\n}`);
  for (const group of tokens.type.groups) {
    for (const style of group.styles) {
      const family = style.family ?? group.family;
      const decls = [`font-family: var(--font-${family})`, `font-size: ${style.fontSize}`];
      if (style.lineHeight !== undefined) decls.push(`line-height: ${style.lineHeight}`);
      if (style.fontWeight !== undefined) decls.push(`font-weight: ${style.fontWeight}`);
      if (style.letterSpacing !== undefined) decls.push(`letter-spacing: ${style.letterSpacing}`);
      out.push(`.kg-text-${style.name} { ${decls.join("; ")}; }`);
    }
  }
  return out.join("\n\n") + "\n";
}

/** Role tokens: everything but the ramps, brand palettes and Wada reference colours. */
export function roleTokenNames(tokens) {
  return tokens.color.tokens.map((t) => t.name).filter((n) => !RAMP.test(n));
}

/** A Tailwind v4 theme that maps utility colour and font names onto the role tokens. */
export function compileTailwindTheme(tokens) {
  const lines = roleTokenNames(tokens).map((n) => `  --color-${n}: var(--${n});`);
  for (const key of Object.keys(tokens.type.families)) lines.push(`  --font-${key}: var(--font-${key});`);
  return `/* Tailwind v4 theme mapping onto the role tokens, generated. Import after tailwindcss. */\n@theme inline {\n${lines.join("\n")}\n}\n`;
}

/** Copies each weight's woff2 files from @fontsource and rewrites its CSS to point at them. */
export function bundleFonts(nodeModules, outDir) {
  mkdirSync(join(outDir, "fonts"), { recursive: true });
  const css = ["/* Bundled fonts (SIL Open Font License 1.1, see LICENSES.md), every script subset. */"];
  for (const { pkg, weights } of FONTS) {
    const dir = join(nodeModules, "@fontsource", pkg);
    for (const weight of weights) {
      let text = readFileSync(join(dir, `${weight}.css`), "utf8");
      text = text.replace(/,\s*url\(\.\/files\/[^)]+\.woff\)\s*format\('woff'\)/g, "");
      for (const m of text.matchAll(/url\(\.\/files\/([^)]+\.woff2)\)/g)) {
        copyFileSync(join(dir, "files", m[1]), join(outDir, "fonts", m[1]));
      }
      css.push(text.replace(/url\(\.\/files\//g, "url(./fonts/").trim());
    }
  }
  return css.join("\n") + "\n";
}

export function build(outDir = join(MODULE, "target", "package")) {
  const tokens = JSON.parse(readFileSync(join(MODULE, "design", "tokens.json"), "utf8"));
  const pkg = JSON.parse(readFileSync(join(MODULE, "package.json"), "utf8"));
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  writeFileSync(join(outDir, "tokens.css"), compileTokens(tokens));
  copyFileSync(join(MODULE, "design", "components.css"), join(outDir, "components.css"));
  writeFileSync(join(outDir, "fonts.css"), bundleFonts(join(MODULE, "node_modules"), outDir));
  writeFileSync(join(outDir, "tailwind-theme.css"), compileTailwindTheme(tokens));
  for (const f of ["theme.js", "theme.d.ts", "shell.js", "shell.d.ts", "index.css"]) copyFileSync(join(MODULE, "src", f), join(outDir, f));
  copyFileSync(join(MODULE, "design", "brand-book.md"), join(outDir, "brand-book.md"));
  copyFileSync(join(MODULE, "design", "SOURCE.md"), join(outDir, "SOURCE.md"));

  const licences = readdirSync(join(MODULE, "design", "licenses")).filter((f) => f.startsWith("OFL-")).sort();
  writeFileSync(
    join(outDir, "LICENSES.md"),
    "# Bundled fonts\n\n" +
      licences.map((f) => `## ${f.replace(/^OFL-|\.txt$/g, "").replace(/-/g, " ")}\n\n\`\`\`\n${readFileSync(join(MODULE, "design", "licenses", f), "utf8").trim()}\n\`\`\`\n`).join("\n"),
  );

  writeFileSync(
    join(outDir, "package.json"),
    JSON.stringify(
      {
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
        license: pkg.license,
        type: "module",
        sideEffects: ["*.css"],
        // The shell's React components use the app's own React.
        peerDependencies: { react: ">=18" },
        exports: {
          ".": "./index.css",
          "./index.css": "./index.css",
          "./tokens.css": "./tokens.css",
          "./components.css": "./components.css",
          "./fonts.css": "./fonts.css",
          "./tailwind-theme.css": "./tailwind-theme.css",
          "./theme": { types: "./theme.d.ts", default: "./theme.js" },
          "./shell": { types: "./shell.d.ts", default: "./shell.js" },
          "./package.json": "./package.json",
        },
      },
      null,
      2,
    ) + "\n",
  );
  return outDir;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(`built ${build()}`);
}
