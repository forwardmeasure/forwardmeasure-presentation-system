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

// The app shell every ForwardMeasure app shares, as React components drawn with the kg- classes:
// TopBar (platform, product, sections or section groups, tenant, theme, account), ThemeToggle and
// AccountMenu. Plain JavaScript with the app's own React (a peer dependency), so no build step.
// Icons are Lucide 0.468.0 outlines, inlined.

import { createElement as h, useEffect, useRef, useState } from "react";
import { saveThemePreference, storedThemePreference } from "./theme.js";

const ICONS = {
  sun: [["circle", { cx: 12, cy: 12, r: 4 }], ["path", { d: "M12 2v2" }], ["path", { d: "M12 20v2" }], ["path", { d: "m4.93 4.93 1.41 1.41" }], ["path", { d: "m17.66 17.66 1.41 1.41" }], ["path", { d: "M2 12h2" }], ["path", { d: "M20 12h2" }], ["path", { d: "m6.34 17.66-1.41 1.41" }], ["path", { d: "m19.07 4.93-1.41 1.41" }]],
  moon: [["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" }]],
  monitor: [["rect", { width: 20, height: 14, x: 2, y: 3, rx: 2 }], ["line", { x1: 8, x2: 16, y1: 21, y2: 21 }], ["line", { x1: 12, x2: 12, y1: 17, y2: 21 }]],
  chevronDown: [["path", { d: "m6 9 6 6 6-6" }]],
  logOut: [["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }], ["polyline", { points: "16 17 21 12 16 7" }], ["line", { x1: 21, x2: 9, y1: 12, y2: 12 }]],
  check: [["path", { d: "M20 6 9 17l-5-5" }]],
};

function Icon({ name, style }) {
  return h(
    "svg",
    {
      className: "kg-icon",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.5,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
      focusable: "false",
      style,
    },
    ICONS[name].map(([tag, attrs], i) => h(tag, { key: i, ...attrs })),
  );
}

/** Up to two initials: one per word for several words, the first two letters of a single word. */
export function initialsOf(name) {
  const words = String(name ?? "").split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? words.slice(0, 2).map((w) => w[0]) : [...(words[0] ?? "")].slice(0, 2);
  return letters.join("").toUpperCase() || "?";
}

const CHOICES = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "Match System", icon: "monitor" },
];

export function ThemeToggle({ onChange }) {
  const [preference, setPreference] = useState(storedThemePreference);
  const buttons = useRef([]);

  function choose(value) {
    setPreference(value);
    const theme = saveThemePreference(value);
    onChange?.(theme);
  }

  function onKeyDown(event) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const index = CHOICES.findIndex((c) => c.value === preference);
    const next = (index + step + CHOICES.length) % CHOICES.length;
    choose(CHOICES[next].value);
    buttons.current[next]?.focus();
  }

  return h(
    "div",
    { className: "kg-segmented", role: "radiogroup", "aria-label": "Colour Theme", onKeyDown },
    CHOICES.map(({ value, label, icon }, index) =>
      h(
        "button",
        {
          key: value,
          ref: (el) => {
            buttons.current[index] = el;
          },
          type: "button",
          role: "radio",
          "aria-checked": preference === value,
          "aria-label": label,
          title: label,
          tabIndex: preference === value ? 0 : -1,
          onClick: () => choose(value),
        },
        h(Icon, { name: icon }),
      ),
    ),
  );
}

/** Closes an open popup on a click outside it or on Escape (returning focus to its trigger). */
function useDismiss(open, setOpen, container, trigger) {
  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!container.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
}

/** Arrow keys move between a menu's items. */
function onMenuKeyDown(event) {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  event.preventDefault();
  const items = [...event.currentTarget.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])')];
  const index = items.indexOf(document.activeElement);
  const next = event.key === "ArrowDown" ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
  items[next]?.focus();
}

const POPUP = { position: "absolute", top: "calc(100% + 4px)", zIndex: 1300 };

export function AccountMenu({ name, detail, onSignOut }) {
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const trigger = useRef(null);
  useDismiss(open, setOpen, container, trigger);

  return h(
    "div",
    { ref: container, style: { position: "relative" } },
    h(
      "button",
      {
        ref: trigger,
        type: "button",
        className: "kg-usermenu",
        "aria-haspopup": "menu",
        "aria-expanded": open,
        onClick: () => setOpen((value) => !value),
      },
      h("span", { className: "kg-avatar", "aria-hidden": true }, initialsOf(name)),
      name,
      h(Icon, { name: "chevronDown" }),
    ),
    open &&
      h(
        "div",
        { className: "kg-menu", role: "menu", "aria-label": "Account", style: { ...POPUP, right: 0 }, onKeyDown: onMenuKeyDown },
        detail && h("div", { className: "kg-menu__label" }, detail),
        h(
          "button",
          { type: "button", className: "kg-menu__item", role: "menuitem", autoFocus: true, onClick: onSignOut },
          h(Icon, { name: "logOut" }),
          "Sign Out",
        ),
      ),
  );
}

function SectionGroup({ group, current, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ top: 0, left: 0 });
  const container = useRef(null);
  const trigger = useRef(null);
  useDismiss(open, setOpen, container, trigger);

  // The nav scrolls sideways when crowded, which would clip an absolutely positioned menu, so the
  // menu is fixed to the window under its button.
  function toggle() {
    const rect = trigger.current?.getBoundingClientRect();
    if (rect) setAnchor({ top: rect.bottom + 4, left: rect.left });
    setOpen((value) => !value);
  }
  const containsCurrent = group.items.some((item) => item.value === current);

  return h(
    "div",
    { ref: container, style: { position: "relative", display: "flex" } },
    h(
      "button",
      {
        ref: trigger,
        type: "button",
        className: "kg-topbar__link",
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-current": containsCurrent ? "page" : undefined,
        onClick: toggle,
      },
      group.label,
      h(Icon, { name: "chevronDown", style: { marginLeft: 4 } }),
    ),
    open &&
      h(
        "div",
        { className: "kg-menu", role: "menu", "aria-label": group.label, style: { position: "fixed", zIndex: 1300, ...anchor }, onKeyDown: onMenuKeyDown },
        group.items.map((item, index) =>
          h(
            "button",
            {
              key: item.value,
              type: "button",
              className: "kg-menu__item",
              role: "menuitem",
              autoFocus: index === 0,
              "aria-current": item.value === current ? "page" : undefined,
              onClick: () => {
                setOpen(false);
                onNavigate(item.value);
              },
            },
            item.label,
            item.value === current && h(Icon, { name: "check", style: { marginLeft: "auto" } }),
          ),
        ),
      ),
  );
}

export function TopBar({ platform, product, sections, current, onNavigate, tenant, person, onThemeChange, onSignOut }) {
  return h(
    "header",
    { className: "kg-topbar" },
    h(
      "div",
      { className: "kg-topbar__brand" },
      h("span", { className: "kg-topbar__logo" }),
      h("span", { className: "kg-topbar__platform" }, platform),
      h("span", { className: "kg-topbar__product" }, product),
    ),
    h(
      "nav",
      { className: "kg-topbar__nav", "aria-label": "Primary" },
      sections.map((section) =>
        "items" in section
          ? h(SectionGroup, { key: section.label, group: section, current, onNavigate })
          : h(
              "button",
              {
                key: section.value,
                type: "button",
                className: "kg-topbar__link",
                "aria-current": section.value === current ? "page" : undefined,
                onClick: () => onNavigate(section.value),
              },
              section.label,
            ),
      ),
    ),
    h(
      "div",
      { className: "kg-topbar__end" },
      tenant ? h("span", { className: "kg-tenant", title: "Tenant" }, tenant) : null,
      h(ThemeToggle, { onChange: onThemeChange }),
      h(AccountMenu, { name: person.name, detail: person.detail, onSignOut }),
    ),
  );
}

