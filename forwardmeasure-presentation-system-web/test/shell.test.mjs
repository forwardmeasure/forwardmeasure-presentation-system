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
for (const key of ["window", "document", "HTMLElement", "Node", "KeyboardEvent", "MouseEvent", "PointerEvent", "Event"]) {
  globalThis[key] = dom.window[key] ?? dom.window.Event;
}
globalThis.localStorage = dom.window.localStorage;
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { act, createElement: h } = await import("react");
const { createRoot } = await import("react-dom/client");
const { TopBar, initialsOf } = await import("../src/shell.js");

let container;
let root;

beforeEach(() => {
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
