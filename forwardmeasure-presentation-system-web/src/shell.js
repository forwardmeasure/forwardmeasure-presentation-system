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
// TopBar (logo, platform, product, sections or section groups, tenant, theme, account),
// ThemeToggle and AccountMenu, plus ThemedImage for a brand image that follows the active theme.
// Plain JavaScript with the app's own React (a peer dependency), so no build step. Icons are
// Lucide 0.468.0 outlines, inlined (icons.js).

import { createElement as h, useEffect, useRef, useState } from "react";
import { Icon } from "./icons.js";
import { resolveTheme, saveThemePreference, storedThemePreference } from "./theme.js";

/** The theme the page shows now: data-theme on <html>, or the stored choice before it is set. */
function activeTheme() {
  if (typeof document === "undefined") return "light";
  const attribute = document.documentElement.getAttribute("data-theme");
  if (attribute === "light" || attribute === "dark") return attribute;
  const systemDark =
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? Boolean(window.matchMedia("(prefers-color-scheme: dark)").matches)
      : false;
  return resolveTheme(storedThemePreference(), systemDark);
}

/**
 * The active colour theme, kept current: it follows data-theme on <html> (which ThemeToggle and
 * initTheme set, including while the choice is "Match System" and the operating system changes)
 * and, before data-theme is set, the operating system itself.
 */
export function useActiveTheme() {
  const [theme, setTheme] = useState(activeTheme);
  useEffect(() => {
    const update = () => setTheme(activeTheme());
    update();
    const observer = typeof MutationObserver === "function" ? new MutationObserver(update) : undefined;
    observer?.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const query = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : undefined;
    query?.addEventListener?.("change", update);
    return () => {
      observer?.disconnect();
      query?.removeEventListener?.("change", update);
    };
  }, []);
  return theme;
}

/**
 * A brand image in its light or dark version, whichever matches the active theme. Decorative by
 * default (empty alt): the words beside it carry the meaning.
 */
export function ThemedImage({ light, dark, height, alt = "", className }) {
  const theme = useActiveTheme();
  return h("img", {
    src: theme === "dark" ? dark : light,
    alt,
    height,
    className,
    "data-theme-variant": theme,
    style: { display: "block", height, width: "auto" },
  });
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

export function TopBar({ platform, product, logo, sections, current, onNavigate, tenant, person, onThemeChange, onSignOut }) {
  return h(
    "header",
    { className: "kg-topbar" },
    h(
      "div",
      { className: "kg-topbar__brand" },
      // The brand's symbol (never the lockup: the platform name is already set beside it as text).
      logo ? h("span", { className: "kg-topbar__logo" }, h(ThemedImage, { light: logo.light, dark: logo.dark, height: 24 })) : null,
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

