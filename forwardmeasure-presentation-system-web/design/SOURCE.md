# Where this design comes from

Everything in this folder is a pinned copy of the Kriyagentic design system, which is designed and
edited in claude.ai. Don't edit these files by hand: change the design system, then sync.

| | |
|---|---|
| Design system | https://claude.ai/artifact/HmmXyKjATFChiz8VYnpL5i (private to its owner) |
| Synced version | 26 (version id `1791807180-27db`), last change 2026-10-12T12:12:55Z, "Labels are Title Case (brand book and every component); new Tag component for roles, categories and kinds" |
| Synced on | 2026-10-12 |

| File here | File in the design system |
|---|---|
| `tokens.json` | `project/tokens.json` |
| `components.css` | `project/components/bundle.css` |
| `brand-book.md` | `project/README.md` |
| `licenses/*` | `project/licenses/*` |

## Syncing

1. Read the four files above from the design system's current version.
2. Replace the copies here byte for byte. Never edit a value here instead.
3. Update the version, version id, last change and date in the table above.
4. Build this module (`npm test` checks that every token the component styles use still exists), then
   install it and rebuild the apps.

The fonts are not copied from the design system: the build takes every script subset of the same
families and weights from the pinned `@fontsource` packages in `package.json`.
