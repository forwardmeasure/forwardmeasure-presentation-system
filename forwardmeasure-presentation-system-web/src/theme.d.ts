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

export type ThemePreference = "light" | "dark" | "system";
export type Theme = "light" | "dark";

export declare const THEME_PREFERENCES: readonly ThemePreference[];
export declare const THEME_STORAGE_KEY: string;

export declare function resolveTheme(preference: ThemePreference, systemDark: boolean): Theme;
export declare function storedThemePreference(): ThemePreference;
export declare function applyThemePreference(preference: ThemePreference, root?: HTMLElement): Theme;
export declare function saveThemePreference(preference: ThemePreference, root?: HTMLElement): Theme;
export declare function initTheme(onChange?: (theme: Theme) => void, root?: HTMLElement): () => void;
