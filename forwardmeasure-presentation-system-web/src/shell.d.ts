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

import type { ReactElement } from "react";
import type { Theme } from "./theme";

/** One top-bar section. */
export type Section<V extends string> = { value: V; label: string };
/** A top-bar item that opens a menu of sections. */
export type SectionGroup<V extends string> = { label: string; items: Section<V>[] };

export type TopBarProps<V extends string> = {
  /** Platform name, from branding (never written into a component). */
  platform: string;
  /** Product name, for example "OpenWorkflow Studio". */
  product: string;
  /** Sections and section groups, in order. Six items at most. */
  sections: Array<Section<V> | SectionGroup<V>>;
  current: V;
  onNavigate: (value: V) => void;
  /** Tenant ID exactly as the platform knows it. */
  tenant?: string;
  person: { name: string; detail?: string };
  onThemeChange?: (theme: Theme) => void;
  onSignOut: () => void;
};

export declare function TopBar<V extends string>(props: TopBarProps<V>): ReactElement;
export declare function ThemeToggle(props: { onChange?: (theme: Theme) => void }): ReactElement;
export declare function AccountMenu(props: { name: string; detail?: string; onSignOut: () => void }): ReactElement;
export declare function initialsOf(name: string): string;
