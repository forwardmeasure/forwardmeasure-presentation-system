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
import { afterEach, beforeEach, test } from "node:test";
import { JSDOM } from "jsdom";

// A real DOM for React to render into.
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://lux.example/ei/studio/" });
for (const key of ["window", "document", "HTMLElement", "Node", "KeyboardEvent", "MouseEvent", "PointerEvent", "Event", "MutationObserver"]) {
  globalThis[key] = dom.window[key] ?? dom.window.Event;
}
globalThis.localStorage = dom.window.localStorage;
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
// The operating system's colour scheme, as a hand-written stand-in for matchMedia that tests can flip.
const system = { dark: false, listeners: new Set() };
dom.window.matchMedia = () => ({
  get matches() {
    return system.dark;
  },
  addEventListener: (_type, listener) => system.listeners.add(listener),
  removeEventListener: (_type, listener) => system.listeners.delete(listener),
});
function setSystemDark(dark) {
  system.dark = dark;
  for (const listener of [...system.listeners]) listener({ matches: dark });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { act, createElement: h } = await import("react");
const { createRoot } = await import("react-dom/client");
const { TopBar, initialsOf, reloadOnStaleBundle } = await import("../src/shell.js");
const { initTheme } = await import("../src/theme.js");

let container;
let root;

beforeEach(() => {
  system.dark = false;
  system.listeners.clear();
  dom.window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const click = (el) => act(() => el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })));
const byText = (text, selector = "button") => [...container.querySelectorAll(selector)].find((b) => b.textContent.trim().startsWith(text));

function render(props = {}) {
  const calls = { navigate: [], signedOut: 0 };
  act(() =>
    root.render(
      h(TopBar, {
        platform: "kriyagentic",
        product: "Entity Intelligence Studio",
        sections: [
          { value: "overview", label: "Overview" },
          { label: "Populations", items: [{ value: "reference-populations", label: "Reference populations" }, { value: "entities", label: "Entities" }] },
        ],
        current: "overview",
        onNavigate: (v) => calls.navigate.push(v),
        tenant: "did:web:lux",
        person: { name: "Ada Lovelace", detail: "ada@lux.example" },
        onSignOut: () => calls.signedOut++,
        ...props,
      }),
    ),
  );
  return calls;
}

test("initials: one per word for several words, the first two letters of a single word", () => {
  assert.equal(initialsOf("Ada Lovelace"), "AL");
  assert.equal(initialsOf("admin"), "AD");
  assert.equal(initialsOf("  "), "?");
});

test("the bar shows platform, product, tenant and the current section", () => {
  render();
  assert.equal(container.querySelector(".kg-topbar__platform").textContent, "kriyagentic");
  assert.equal(container.querySelector(".kg-topbar__product").textContent, "Entity Intelligence Studio");
  assert.equal(container.querySelector(".kg-tenant").textContent, "did:web:lux");
  assert.equal(byText("Overview").getAttribute("aria-current"), "page");
  assert.equal(byText("Populations").getAttribute("aria-current"), null);
  assert.equal(container.querySelector(".kg-avatar").textContent, "AL");
});

test("a group is current when one of its sections is", () => {
  render({ current: "entities" });
  assert.equal(byText("Populations").getAttribute("aria-current"), "page");
});

test("a group opens a menu; choosing a section navigates and closes it", () => {
  const calls = render();
  const group = byText("Populations");
  click(group);
  assert.equal(group.getAttribute("aria-expanded"), "true");
  const item = byText("Entities", '[role="menuitem"]');
  assert.ok(item, "the group's menu lists its sections");
  click(item);
  assert.deepEqual(calls.navigate, ["entities"]);
  assert.equal(container.querySelector('[role="menu"]'), null);
});

test("the theme toggle sets data-theme and remembers the choice", () => {
  render();
  click(container.querySelector('[role="radio"][aria-label="Dark"]'));
  assert.equal(document.documentElement.getAttribute("data-theme"), "dark");
  assert.equal(dom.window.localStorage.getItem("kg-theme"), "dark");
  assert.equal(container.querySelector('[role="radio"][aria-label="Dark"]').getAttribute("aria-checked"), "true");
});

test("sign out lives in the account menu, which Escape closes", () => {
  const calls = render();
  const account = container.querySelector(".kg-usermenu");
  click(account);
  assert.ok(byText("ada@lux.example", ".kg-menu__label"));
  act(() => document.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape" })));
  assert.equal(account.getAttribute("aria-expanded"), "false");
  click(account);
  click(byText("Sign Out", '[role="menuitem"]'));
  assert.equal(calls.signedOut, 1);
});

const LOGO = { light: "/brand/symbol-light.svg", dark: "/brand/symbol-dark.svg" };
const logoImage = () => container.querySelector(".kg-topbar__logo img");
// MutationObserver callbacks run as microtasks; let them run inside act.
const settle = () => act(async () => {});

test("without a logo the slot is not rendered at all", () => {
  render();
  assert.equal(container.querySelector(".kg-topbar__logo"), null);
  assert.equal(container.querySelector(".kg-topbar__brand img"), null);
  assert.equal(container.querySelector(".kg-topbar__platform").textContent, "kriyagentic", "the platform name stays as text");
});

test("the logo is a decorative image, 24px high, beside the platform name", () => {
  render({ logo: LOGO });
  const image = logoImage();
  assert.ok(image, "the logo slot holds an image");
  assert.equal(image.getAttribute("alt"), "", "decorative: the platform name carries the meaning");
  assert.equal(image.getAttribute("height"), "24");
  assert.equal(image.parentElement.nextElementSibling.className, "kg-topbar__platform");
  assert.equal(container.querySelector(".kg-topbar__platform").textContent, "kriyagentic");
});

test("the logo follows the theme chosen in the toggle", async () => {
  render({ logo: LOGO });
  assert.equal(logoImage().getAttribute("src"), LOGO.light, "Match System on a light system shows the light version");
  click(container.querySelector('[role="radio"][aria-label="Dark"]'));
  await settle();
  assert.equal(logoImage().getAttribute("src"), LOGO.dark);
  click(container.querySelector('[role="radio"][aria-label="Light"]'));
  await settle();
  assert.equal(logoImage().getAttribute("src"), LOGO.light);
});

test("with Match System the logo follows the operating system, before and after the theme starts", async () => {
  setSystemDark(true);
  render({ logo: LOGO });
  assert.equal(logoImage().getAttribute("src"), LOGO.dark, "no data-theme yet: the system's dark scheme decides");
  const stop = initTheme();
  try {
    await settle();
    assert.equal(document.documentElement.getAttribute("data-theme"), "dark");
    act(() => setSystemDark(false));
    await settle();
    assert.equal(document.documentElement.getAttribute("data-theme"), "light");
    assert.equal(logoImage().getAttribute("src"), LOGO.light);
  } finally {
    stop();
  }
});

test("a stored Dark choice shows the dark logo even on a light system", () => {
  dom.window.localStorage.setItem("kg-theme", "dark");
  render({ logo: LOGO });
  assert.equal(logoImage().getAttribute("src"), LOGO.dark);
});

// A tab opened before a deploy asks for the old build's files; Vite reports it as vite:preloadError.
function staleBundlePage(storage) {
  const target = new dom.window.EventTarget();
  const page = { target, reloads: 0, clock: 1_000_000 };
  target.location = { reload: () => page.reloads++ };
  reloadOnStaleBundle(target, storage, () => page.clock);
  page.fail = () => {
    const event = new dom.window.Event("vite:preloadError", { cancelable: true });
    target.dispatchEvent(event);
    return event.defaultPrevented;
  };
  return page;
}

test("a part of the app gone after a deploy reloads the page once, never in a loop", () => {
  const stored = new Map();
  const page = staleBundlePage({
    getItem: (key) => stored.get(key) ?? null,
    setItem: (key, value) => stored.set(key, value),
  });
  assert.equal(page.fail(), true);
  assert.equal(page.reloads, 1);
  page.clock += 5_000;
  assert.equal(page.fail(), false, "a repeat within a minute reaches the app's error handling");
  assert.equal(page.reloads, 1);
  page.clock += 60_000;
  assert.equal(page.fail(), true);
  assert.equal(page.reloads, 2);
});

test("without session storage a missing part of the app is left to the app", () => {
  const page = staleBundlePage({
    getItem() {
      throw new Error("storage blocked");
    },
    setItem() {},
  });
  assert.equal(page.fail(), false);
  assert.equal(page.reloads, 0);
});
