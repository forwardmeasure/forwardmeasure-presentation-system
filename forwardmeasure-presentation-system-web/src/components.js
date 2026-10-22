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

// Shared React components beyond the app shell, drawn with the kg- classes. OutputActions: Copy and
// Download for any read-only output (JSON, logs, error details, Problem documents, raw task or
// extraction data). Plain JavaScript with the app's own React (a peer dependency), so no build step.

import { createElement as h, useEffect, useRef, useState } from "react";
import { Icon } from "./icons.js";

const CONFIRMATION_MS = 2000;

/** "json" when the content is a value, "text" when it is already a string. */
export function outputFormat(content, format) {
  if (format === "json" || format === "text") return format;
  return typeof content === "string" ? "text" : "json";
}

/** The text that is copied and downloaded: a string as it is, anything else as indented JSON. */
export function outputText(content) {
  if (content === undefined || content === null) return content === null ? "null" : "";
  if (typeof content === "string") return content;
  const json = JSON.stringify(content, null, 2);
  return json === undefined ? String(content) : json;
}

/**
 * A safe file name: characters no file system accepts become hyphens, and the format's extension
 * (.json or .txt) is added unless the name already has one. Without a name, the label is used
 * ("Execution Output" becomes execution-output.json).
 */
export function outputFileName({ fileName, label, format }) {
  const extension = format === "json" ? "json" : "txt";
  const base = (fileName ?? "").trim() ||
    String(label ?? "output")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ||
    "output";
  // eslint-disable-next-line no-control-regex
  const safe = base.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "-");
  return /\.[A-Za-z0-9]{1,8}$/.test(safe) ? safe : `${safe}.${extension}`;
}

/**
 * Puts text on the clipboard. The Clipboard API needs a secure context; anywhere else (a plain
 * HTTP port-forward) it falls back to a hidden textarea and the legacy copy command.
 */
export async function copyToClipboard(text) {
  if (typeof window !== "undefined" && window.isSecureContext && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  const focused = document.activeElement;
  area.select();
  try {
    if (!document.execCommand?.("copy")) throw new Error("The browser refused the copy.");
  } finally {
    document.body.removeChild(area);
    // Selecting the textarea moved focus; give it back to the control the person used.
    if (focused && typeof focused.focus === "function") focused.focus();
  }
}

/** Saves text as a file through a temporary object URL and a download link. */
export function downloadFile(text, fileName, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    // Revoked after the click has been handled, so the download has started.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

/**
 * Copy and Download for one read-only output, as two icon buttons. `content` is the output itself
 * (a string, or a value written as indented JSON) or a function that returns it when a button is
 * used. `label` names the output in Title Case for the buttons ("Copy Output", "Download Output").
 * Copying announces "Copied" (or "Copy Failed") through a polite live region for two seconds.
 */
export function OutputActions({ content, label, fileName, format, size = "md", className }) {
  const [outcome, setOutcome] = useState(null);
  const timer = useRef(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  function announce(next) {
    clearTimeout(timer.current);
    setOutcome(next);
    timer.current = setTimeout(() => setOutcome(null), CONFIRMATION_MS);
  }

  function resolve() {
    const value = typeof content === "function" ? content() : content;
    const resolved = outputFormat(value, format);
    return { text: outputText(value), format: resolved };
  }

  function copy() {
    let text;
    try {
      text = resolve().text;
    } catch {
      announce("failed");
      return;
    }
    copyToClipboard(text).then(
      () => announce("copied"),
      () => announce("failed"),
    );
  }

  function download() {
    const { text, format: resolved } = resolve();
    downloadFile(
      text,
      outputFileName({ fileName, label, format: resolved }),
      resolved === "json" ? "application/json" : "text/plain;charset=utf-8",
    );
  }

  const button = `kg-iconbtn${size === "sm" ? " kg-iconbtn--sm" : ""}`;
  const copyLabel = `Copy ${label}`;
  const downloadLabel = `Download ${label}`;
  return h(
    "span",
    { className: `kg-output-actions${className ? ` ${className}` : ""}`, role: "group", "aria-label": label },
    h(
      "button",
      { type: "button", className: button, "aria-label": copyLabel, title: copyLabel, onClick: copy },
      h(Icon, { name: outcome === "copied" ? "check" : "copy" }),
    ),
    h(
      "button",
      { type: "button", className: button, "aria-label": downloadLabel, title: downloadLabel, onClick: download },
      h(Icon, { name: "download" }),
    ),
    // Always in the page, so assistive technology is already listening when the words arrive.
    h(
      "span",
      { className: "kg-output-actions__status", "aria-live": "polite", "aria-atomic": "true" },
      outcome === "copied" ? "Copied" : outcome === "failed" ? "Copy Failed" : "",
    ),
  );
}
