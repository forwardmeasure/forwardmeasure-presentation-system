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

// The light / dark / match-system choice shared by every app. The choice is stored per person in
// the browser under one key, so apps served from the same host share it. The resolved theme is set
// as data-theme on <html>, which tokens.css keys every colour off.

export const THEME_PREFERENCES = ["light", "dark", "system"];
export const THEME_STORAGE_KEY = "kg-theme";

function storage() {
  try {
    return typeof window !== "undefined" ? window.localStorage : undefined;
  } catch {
    return undefined;
  }
}

function systemQuery() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : undefined;
}

export function resolveTheme(preference, systemDark) {
  if (preference === "light" || preference === "dark") return preference;
  return systemDark ? "dark" : "light";
}

export function storedThemePreference() {
  let value;
  try {
    value = storage()?.getItem(THEME_STORAGE_KEY);
  } catch {
    value = undefined;
  }
  return THEME_PREFERENCES.includes(value) ? value : "system";
}

export function applyThemePreference(preference, root = document.documentElement) {
  const theme = resolveTheme(preference, Boolean(systemQuery()?.matches));
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  const meta = root.ownerDocument?.querySelector?.('meta[name="theme-color"]');
  if (meta && typeof getComputedStyle === "function") {
    const surface = getComputedStyle(root).getPropertyValue("--surface").trim();
    if (surface) meta.setAttribute("content", surface);
  }
  return theme;
}

export function saveThemePreference(preference, root = document.documentElement) {
  try {
    storage()?.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage blocked (private window, policy): the choice still applies for this page.
  }
  return applyThemePreference(preference, root);
}

/**
 * Applies the stored choice and keeps following the operating system while the choice is
 * "system". Returns a function that stops following it.
 */
export function initTheme(onChange, root = document.documentElement) {
  applyThemePreference(storedThemePreference(), root);
  const query = systemQuery();
  if (!query) return () => {};
  const listener = () => {
    if (storedThemePreference() === "system") {
      const theme = applyThemePreference("system", root);
      onChange?.(theme);
    }
  };
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}
