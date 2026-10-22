# forwardmeasure-presentation-system

The single place for ForwardMeasure's presentation system: the look every web app shares, and the
slide templates. The design is made in the Kriyagentic design system in claude.ai (Sanzō Wada's
combination 243: ivory paper, slate ink, Raw Sienna accent, warm charcoal in dark) and pinned here.

| Folder | What |
|---|---|
| `forwardmeasure-presentation-system-web/` | The `@forwardmeasure/presentation-system` npm package, built and shipped in a jar |
| `forwardmeasure-presentation-system-web/design/` | The pinned copy of the design system; see its `SOURCE.md` before changing anything |
| `slides/v0.3.2/` | The v0.3.2 PowerPoint and Google Slides templates (the earlier orange/teal look) |

## The web package

What an app gets from `@forwardmeasure/presentation-system`:

| Import | What |
|---|---|
| `@forwardmeasure/presentation-system` (`index.css`) | Fonts, tokens and component styles together |
| `.../tokens.css` | Every token as a CSS custom property, light and dark (`data-theme` on `<html>`) |
| `.../components.css` | The `kg-` component styles: TopBar, Button, Table, Dialog and the rest |
| `.../fonts.css` | Roboto, Didact Gothic and IBM Plex Mono, bundled with every script subset |
| `.../tailwind-theme.css` | For Tailwind v4 apps: utility colours and fonts mapped onto the role tokens |
| `.../theme` | Light / dark / match-system logic: `initTheme`, `saveThemePreference`, `storedThemePreference` |
| `.../shell` | The app shell in React: `TopBar` (with its optional `logo`, the brand's symbol), `ThemeToggle`, `AccountMenu`, and `ThemedImage` for a brand image that follows the active theme |
| `.../components` | Shared React components: `OutputActions`, Copy and Download for any read-only output |
| `.../brands/<brand>/<file>` | Each brand's logo files and favicons, kept apart from the components (today `brands/kriyagentic/`) |

Icons are Lucide: React apps depend on `lucide-react` themselves and draw icons at `strokeWidth={1.5}`.

### Brand assets

`forwardmeasure-presentation-system-web/brands/kriyagentic/` holds the Kriyagentic logo as the design
system's Logos group has it (mark, symbol and lockup, each light and dark, the name outlined), with a
licence header added, plus the favicons made from the symbol: `kriyagentic-favicon.svg` (switches
itself with `prefers-color-scheme`) and 32px PNGs for light and dark. Components never name a brand:
an app imports the files it needs by path, for example
`@forwardmeasure/presentation-system/brands/kriyagentic/kriyagentic-symbol-light.svg`, and passes them
in (`TopBar`'s `logo`). A further brand adds its own folder beside this one.
The design system's brand book (`brand-book.md`, shipped in the package) is the usage guide.

### Using it in a web app

1. In the app's webapp `pom.xml`, unpack the jar before `npm ci`:

   ```xml
   <plugin>
     <groupId>org.apache.maven.plugins</groupId>
     <artifactId>maven-dependency-plugin</artifactId>
     <executions>
       <execution>
         <id>unpack-presentation-system</id>
         <phase>initialize</phase>
         <goals><goal>unpack</goal></goals>
         <configuration>
           <artifactItems>
             <artifactItem>
               <groupId>com.forwardmeasure.presentation</groupId>
               <artifactId>forwardmeasure-presentation-system-web</artifactId>
               <version>${forwardmeasure.presentation-system.version}</version>
               <includes>presentation-system/**</includes>
             </artifactItem>
           </artifactItems>
           <outputDirectory>${project.build.directory}/presentation-system-unpacked</outputDirectory>
         </configuration>
       </execution>
     </executions>
   </plugin>
   ```

2. In `package.json`, depend on the unpacked folder:
   `"@forwardmeasure/presentation-system": "file:<relative path to target>/presentation-system-unpacked/presentation-system"`.
3. Import `@forwardmeasure/presentation-system` once in the app's entry stylesheet or `main.tsx`, and
   call `initTheme()` before rendering.

`forwardmeasure.presentation-system.version` is defined in `forwardmeasure-platform`.

## Building

`mvn install` builds the package (`npm ci`, then `scripts/build.mjs`), runs its tests and installs the
jar. Install it before building any app that uses it.
