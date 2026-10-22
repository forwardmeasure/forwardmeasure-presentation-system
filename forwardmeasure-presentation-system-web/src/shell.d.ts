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

/** One brand image in its light and dark versions (URLs), for light and dark grounds. */
export type ThemedImageSource = { light: string; dark: string };

export type TopBarProps<V extends string> = {
  /** Platform name, from branding (never written into a component). */
  platform: string;
  /** Product name, for example "OpenWorkflow Studio". */
  product: string;
  /**
   * The brand's symbol for the logo slot, light and dark: never the lockup, since the platform name
   * is set beside it as text. Shown 24px high as a decorative image, in the version that matches the
   * active theme. Without it the slot is not rendered.
   */
  logo?: ThemedImageSource;
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

/** The active colour theme, following data-theme on <html> and, before it is set, the operating system. */
export declare function useActiveTheme(): Theme;

export type ThemedImageProps = ThemedImageSource & {
  /** Height in pixels; the width follows the image. */
  height: number;
  /** Empty by default: the image is decorative and the words beside it carry the meaning. */
  alt?: string;
  className?: string;
};

/** A brand image (logo, symbol, mark) in the version that matches the active theme. */
export declare function ThemedImage(props: ThemedImageProps): ReactElement;
