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
import { setTimeout as sleep } from "node:timers/promises";
import { JSDOM } from "jsdom";

// A real DOM for React to render into. Blob stays Node's own, which can be read back as text.
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://lux.example/ow/studio/" });
for (const key of ["window", "document", "HTMLElement", "Node", "KeyboardEvent", "MouseEvent", "PointerEvent", "Event"]) {
  globalThis[key] = dom.window[key] ?? dom.window.Event;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { act, createElement: h } = await import("react");
const { createRoot } = await import("react-dom/client");
const { OutputActions, outputFileName, outputFormat, outputText } = await import("../src/components.js");

// Hand-written stand-ins for the browser's clipboard and object URLs, recording what they were given.
const clipboard = { written: [], refuse: false };
const objectUrls = { created: [], revoked: [] };
const downloads = [];
const realCreateObjectURL = URL.createObjectURL;
const realRevokeObjectURL = URL.revokeObjectURL;

function onDocumentClick(event) {
  const link = event.target;
  if (link?.tagName === "A" && link.hasAttribute("download")) {
    downloads.push({ fileName: link.getAttribute("download"), href: link.getAttribute("href") });
    event.preventDefault(); // jsdom does not navigate; the real browser saves the file here
  }
}

let container;
let root;

beforeEach(() => {
  clipboard.written = [];
  clipboard.refuse = false;
  objectUrls.created = [];
  objectUrls.revoked = [];
  downloads.length = 0;
  Object.defineProperty(dom.window, "isSecureContext", { value: true, configurable: true });
  Object.defineProperty(dom.window.navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async (text) => {
        if (clipboard.refuse) throw new Error("Write permission denied.");
        clipboard.written.push(text);
      },
    },
  });
  Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true, writable: true });
  URL.createObjectURL = (blob) => {
    objectUrls.created.push(blob);
    return `blob:https://lux.example/${objectUrls.created.length}`;
  };
  URL.revokeObjectURL = (url) => objectUrls.revoked.push(url);
  document.addEventListener("click", onDocumentClick, true);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  document.removeEventListener("click", onDocumentClick, true);
  URL.createObjectURL = realCreateObjectURL;
  URL.revokeObjectURL = realRevokeObjectURL;
});

function render(props) {
  act(() => root.render(h(OutputActions, props)));
}
const button = (name) => container.querySelector(`button[aria-label="${name}"]`);
const status = () => container.querySelector(".kg-output-actions__status");
// Clicks, then lets the clipboard's promise chain settle (one macrotask) inside act.
const press = (el) =>
  act(async () => {
    el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    await sleep(0);
  });

const OUTPUT = { executionId: "42", result: { matches: 3 } };

test("Copy puts the output on the clipboard as indented JSON and announces it", async () => {
  render({ content: OUTPUT, label: "Output" });
  assert.equal(status().textContent, "", "the live region is in the page, empty, before anything happens");
  await press(button("Copy Output"));
  assert.deepEqual(clipboard.written, [JSON.stringify(OUTPUT, null, 2)]);
  assert.equal(status().textContent, "Copied");
  assert.ok(container.querySelector('[data-icon="check"]'), "the copy icon turns into a check");
});

test("the Copied announcement clears after two seconds", async () => {
  render({ content: "line one\nline two", label: "Log" });
  await press(button("Copy Log"));
  assert.equal(status().textContent, "Copied");
  await act(async () => {
    await sleep(2100);
  });
  assert.equal(status().textContent, "");
  assert.ok(container.querySelector('[data-icon="copy"]'));
});

test("a refused copy says so instead of claiming success", async () => {
  clipboard.refuse = true;
  render({ content: OUTPUT, label: "Output" });
  await press(button("Copy Output"));
  assert.deepEqual(clipboard.written, []);
  assert.equal(status().textContent, "Copy Failed");
});

test("outside a secure context Copy falls back to the browser's copy command", async () => {
  Object.defineProperty(dom.window, "isSecureContext", { value: false, configurable: true });
  const copied = [];
  document.execCommand = (command) => {
    copied.push([command, document.querySelector("textarea")?.value]);
    return true;
  };
  try {
    render({ content: "plain text", label: "Detail" });
    await press(button("Copy Detail"));
    assert.deepEqual(copied, [["copy", "plain text"]]);
    assert.equal(document.querySelector("textarea"), null, "the helper textarea is removed again");
    assert.equal(status().textContent, "Copied");
  } finally {
    delete document.execCommand;
  }
});

test("Download saves JSON under the caller's file name", async () => {
  render({ content: OUTPUT, label: "Output", fileName: "execution-42.json" });
  await press(button("Download Output"));
  assert.equal(downloads.length, 1);
  assert.equal(downloads[0].fileName, "execution-42.json");
  assert.equal(objectUrls.created.length, 1);
  const blob = objectUrls.created[0];
  assert.equal(blob.type, "application/json");
  assert.equal(await blob.text(), JSON.stringify(OUTPUT, null, 2));
  assert.equal(downloads[0].href, "blob:https://lux.example/1");
  assert.equal(document.querySelector("a[download]"), null, "the temporary link is removed");
  await act(async () => {
    await sleep(10);
  });
  assert.deepEqual(objectUrls.revoked, ["blob:https://lux.example/1"], "the object URL is released");
});

test("Download saves text as .txt, named after the label when no name is given", async () => {
  render({ content: "Step 1 failed: timeout", label: "Run Log" });
  await press(button("Download Run Log"));
  assert.equal(downloads[0].fileName, "run-log.txt");
  assert.equal(objectUrls.created[0].type, "text/plain;charset=utf-8");
  assert.equal(await objectUrls.created[0].text(), "Step 1 failed: timeout");
});

test("content given as a function is read when a button is used", async () => {
  let current = "first";
  render({ content: () => current, label: "Error Details", format: "text" });
  current = "second";
  await press(button("Copy Error Details"));
  assert.deepEqual(clipboard.written, ["second"]);
});

test("keyboard and screen readers: native buttons with names, decorative icons, focus kept", async () => {
  render({ content: OUTPUT, label: "Output" });
  const buttons = [...container.querySelectorAll("button")];
  assert.deepEqual(
    buttons.map((b) => [b.getAttribute("type"), b.getAttribute("aria-label"), b.tabIndex]),
    [
      ["button", "Copy Output", 0],
      ["button", "Download Output", 0],
    ],
    "both are buttons in the tab order, so Tab reaches them and Enter or Space activates them",
  );
  for (const svg of container.querySelectorAll("svg")) assert.equal(svg.getAttribute("aria-hidden"), "true");
  assert.equal(container.querySelector('[role="group"]').getAttribute("aria-label"), "Output");
  const region = status();
  assert.equal(region.getAttribute("aria-live"), "polite");
  assert.equal(region.getAttribute("aria-atomic"), "true");
  const copy = button("Copy Output");
  copy.focus();
  await press(copy);
  assert.equal(document.activeElement, copy, "focus stays on Copy after copying");
});

test("formats, text and file names", () => {
  assert.equal(outputFormat("text"), "text");
  assert.equal(outputFormat({ a: 1 }), "json");
  assert.equal(outputFormat('{"a":1}', "json"), "json");
  assert.equal(outputText(undefined), "");
  assert.equal(outputText(null), "null");
  assert.equal(outputText({ a: 1 }), '{\n  "a": 1\n}');
  assert.equal(outputFileName({ label: "Execution Output", format: "json" }), "execution-output.json");
  assert.equal(outputFileName({ fileName: "execution-42", format: "json" }), "execution-42.json");
  assert.equal(outputFileName({ fileName: "workflow.yaml", format: "text" }), "workflow.yaml");
  assert.equal(outputFileName({ fileName: "problem/7c1e:9a02", format: "json" }), "problem-7c1e-9a02.json");
  assert.equal(outputFileName({ label: "", format: "text" }), "output.txt");
});
