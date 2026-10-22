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

// The Lucide 0.468.0 outlines the package's own components draw, inlined so the package needs no
// icon dependency. Drawn at the system's 1.5px stroke and always decorative (aria-hidden): a word
// or an aria-label carries the meaning.

import { createElement as h } from "react";

const ICONS = {
  sun: [["circle", { cx: 12, cy: 12, r: 4 }], ["path", { d: "M12 2v2" }], ["path", { d: "M12 20v2" }], ["path", { d: "m4.93 4.93 1.41 1.41" }], ["path", { d: "m17.66 17.66 1.41 1.41" }], ["path", { d: "M2 12h2" }], ["path", { d: "M20 12h2" }], ["path", { d: "m6.34 17.66-1.41 1.41" }], ["path", { d: "m19.07 4.93-1.41 1.41" }]],
  moon: [["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" }]],
  monitor: [["rect", { width: 20, height: 14, x: 2, y: 3, rx: 2 }], ["line", { x1: 8, x2: 16, y1: 21, y2: 21 }], ["line", { x1: 12, x2: 12, y1: 17, y2: 21 }]],
  chevronDown: [["path", { d: "m6 9 6 6 6-6" }]],
  logOut: [["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }], ["polyline", { points: "16 17 21 12 16 7" }], ["line", { x1: 21, x2: 9, y1: 12, y2: 12 }]],
  check: [["path", { d: "M20 6 9 17l-5-5" }]],
  copy: [["rect", { width: 14, height: 14, x: 8, y: 8, rx: 2, ry: 2 }], ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }]],
  download: [["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }], ["polyline", { points: "7 10 12 15 17 10" }], ["line", { x1: 12, x2: 12, y1: 15, y2: 3 }]],
};

export function Icon({ name, style }) {
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
      "data-icon": name,
      style,
    },
    ICONS[name].map(([tag, attrs], i) => h(tag, { key: i, ...attrs })),
  );
}
