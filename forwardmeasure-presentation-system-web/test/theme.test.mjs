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
import { beforeEach, test } from "node:test";
import {
  THEME_STORAGE_KEY,
  applyThemePreference,
  initTheme,
  resolveTheme,
  saveThemePreference,
  storedThemePreference,
} from "../src/theme.js";

// A minimal browser: localStorage, matchMedia with change listeners, and an <html> element.
let systemDark;
let listeners;
let store;
let root;

beforeEach(() => {
  systemDark = false;
  listeners = new Set();
  store = new Map();
  const attrs = new Map();
  root = {
    style: {},
    setAttribute: (k, v) => attrs.set(k, v),
    getAttribute: (k) => attrs.get(k),
    ownerDocument: { querySelector: () => null },
  };
  globalThis.window = {
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
    },
    matchMedia: () => ({
      get matches() {
        return systemDark;
      },
      addEventListener: (_, fn) => listeners.add(fn),
      removeEventListener: (_, fn) => listeners.delete(fn),
    }),
  };
});

test("an explicit choice wins; system follows the operating system", () => {
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("dark", false), "dark");
  assert.equal(resolveTheme("system", true), "dark");
  assert.equal(resolveTheme("system", false), "light");
});

test("a new person, or an unknown stored value, gets system", () => {
  assert.equal(storedThemePreference(), "system");
  store.set(THEME_STORAGE_KEY, "sepia");
  assert.equal(storedThemePreference(), "system");
});

test("applying sets data-theme and the colour scheme on <html>", () => {
  systemDark = true;
  assert.equal(applyThemePreference("system", root), "dark");
  assert.equal(root.getAttribute("data-theme"), "dark");
  assert.equal(root.style.colorScheme, "dark");
});

test("saving remembers the choice under the shared key", () => {
  assert.equal(saveThemePreference("dark", root), "dark");
  assert.equal(store.get(THEME_STORAGE_KEY), "dark");
  assert.equal(storedThemePreference(), "dark");
});

test("blocked storage still applies the choice for the page", () => {
  window.localStorage.setItem = () => {
    throw new Error("blocked");
  };
  assert.equal(saveThemePreference("dark", root), "dark");
  assert.equal(root.getAttribute("data-theme"), "dark");
});

test("while the choice is system, a change in the operating system is followed", () => {
  const seen = [];
  const stop = initTheme((t) => seen.push(t), root);
  assert.equal(root.getAttribute("data-theme"), "light");
  systemDark = true;
  for (const fn of listeners) fn();
  assert.equal(root.getAttribute("data-theme"), "dark");
  assert.deepEqual(seen, ["dark"]);
  stop();
  assert.equal(listeners.size, 0);
});

test("an explicit choice ignores operating system changes", () => {
  store.set(THEME_STORAGE_KEY, "light");
  initTheme(undefined, root);
  systemDark = true;
  for (const fn of listeners) fn();
  assert.equal(root.getAttribute("data-theme"), "light");
});
