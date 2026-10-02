# Matty & Jules: Dialogue Prototype

A small browser-based dialogue scene built with the **Character Expression Template Kit**. Two characters, Matty and Jules, talk through a short conversation, swapping expressions from their sprite sheets line by line. The repo also hosts the design system the prototype is built on.

- **Play the prototype:** `https://<your-username>.github.io/<repo-name>/`
- **Browse the design system:** `https://<your-username>.github.io/<repo-name>/design-system.html`
- **Get the kit:** Character Expression Template Kit on itch.io <!-- TODO: add itch.io link -->

No framework and no build step for the game itself: it's plain HTML, CSS and JavaScript. The only script is the one that turns the design tokens into CSS.

---

## What's in the repo

```
.
├── index.html                  The dialogue prototype
├── design-system.html          Live reference for tokens, components and expression sheets
├── tokens/
│   └── tokens.json             Design tokens: the single source of truth
├── scripts/
│   └── build-tokens.js         Converts tokens.json → assets/css/tokens.css
├── assets/
│   ├── css/
│   │   ├── tokens.css          GENERATED from tokens.json, don't edit by hand
│   │   ├── main.css            Component styles for the prototype
│   │   └── design-system.css   Layout for the design system page
│   ├── js/
│   │   ├── dialogue-data.js    The cast, expression map and script
│   │   ├── main.js             The dialogue engine
│   │   └── design-system.js    Renders the design system page
│   └── images/
│       ├── matty-expression-sheet.png
│       └── jules-expression-sheet.png
├── .github/workflows/
│   └── tokens-check.yml        CI check that tokens.css is up to date
├── .nojekyll                   Tells GitHub Pages to serve files as-is
└── package.json                npm scripts
```

---

## Running it locally

Opening `index.html` directly from your file system works for the game. The design system page loads `tokens/tokens.json` with `fetch`, which browsers block on `file://` URLs, so serve the folder instead:

```bash
npm run serve
# or, without Node:
python3 -m http.server
```

Then open the address it prints (usually `http://localhost:3000` or `http://localhost:8000`).

**Controls:** Next / Back buttons, or the ← → arrow keys.

---

## Design tokens

All colours, fonts, radii, layout sizes and motion timings live in `tokens/tokens.json`. The CSS never hard-codes these values; it reads them as custom properties from the generated `assets/css/tokens.css`.

### Changing a token

1. Edit `tokens/tokens.json`.
2. Regenerate the CSS:
   ```bash
   npm run tokens
   ```
3. Commit **both** `tokens.json` and `assets/css/tokens.css`.

GitHub Pages serves the repo as-is and doesn't run the build, which is why the generated CSS is committed. The `Tokens check` workflow fails any push or pull request where the two files are out of sync. You can run the same check locally with `npm run tokens:check`.

The script has no dependencies; any Node version from 16 up will do.

### Token format

Tokens follow the shape of the [W3C Design Tokens format](https://design-tokens.github.io/community-group/format/): each token is an object with a `$value`, plus an optional `$type` and `$description`.

```json
"color": {
  "accent":    { "$type": "color", "$value": "#B0592B", "$description": "Burnt clay, primary buttons" },
  "on-accent": { "$type": "color", "$value": "{color.panel}" }
}
```

How the script converts them:

| In `tokens.json` | In `tokens.css` |
| --- | --- |
| Token path `color.accent` | `--color-accent` |
| Nested path `color.character.matty` | `--color-character-matty` |
| Reference `{color.panel}` | `var(--color-panel)` |
| `$description` | Trailing CSS comment |
| An entry in `$breakpoints` | An `@media` block that overrides `:root` |

Any key starting with `$` is treated as metadata and skipped. A reference to a token that doesn't exist stops the build with an error that names the bad reference.

### Responsive overrides

Values that change by screen size are declared once in `$breakpoints`:

```json
"$breakpoints": [
  {
    "name": "mobile",
    "media": "(max-width: 640px)",
    "tokens": { "layout.char-w": "min(40vw, 170px)", "layout.overlap": "0px" }
  }
]
```

Because `--layout-char-h` and `--layout-name-inset` are defined in terms of `--layout-char-w`, overriding the width is enough to resize everything that depends on it.

### Token groups

| Group | What it covers |
| --- | --- |
| `color` | Page, panel, ink and accent colours, plus each character's name-tag colour |
| `font` | Display (Fraunces), body (Work Sans) and mono (JetBrains Mono) stacks |
| `radius` | Corner radius for cover cards, the dialogue box and controls |
| `layout` | Portrait size, inset and how far portraits overlap the dialogue box |
| `motion` | Timing and easing of the speaker reveal |

Fonts are loaded from Google Fonts in the `<head>` of each page. If you change a font token to a different family, update that link too.

---

## Editing the conversation

Everything about the scene is in `assets/js/dialogue-data.js`. The engine in `main.js` doesn't need to change.

Each line of the `SCRIPT` names the speaker and, optionally, an expression for each character:

```js
{ speaker: "jules", jules: "Startled",
  text: "Wait, what is this? A Character Expression Template Kit?" }
```

A character you leave out of a line keeps the expression they had on the previous line, and stepping backwards restores the right expressions.

### Expression names

Each sheet is a 4 × 3 grid. The `expressions` map in `CAST` gives each cell a name as `[row, col]`, counting from zero at the top left:

```js
const EXPRESSION_GRID = {
  Neutral:  [0,0], Thoughtful: [0,1], Stressed:  [0,2], Confident:   [0,3],
  Angry:    [1,0], Alarmed:    [1,1], Sorrowful: [1,2], Overwhelmed: [1,3],
  Startled: [2,0], Joyful:     [2,1], Weary:     [2,2], Suspicious:  [2,3]
};
```

If a sheet's poses are in a different order, give that character its own map instead of sharing `EXPRESSION_GRID`. The **Expression sheets** section of the design system page shows every cell with the name the script uses for it, which makes mismatches easy to spot.

### Adding a character

1. Add the sprite sheet to `assets/images/`.
2. Add an entry to `CAST` in `dialogue-data.js` with its `name`, `side`, `sheet` and `expressions`.
3. Add a `.character` element for them in `index.html`, following the pattern of `#charMatty`.
4. Register the element in `charEls` at the top of `main.js`.
5. Add a name-tag colour token under `color.character` in `tokens.json`, run `npm run tokens`, and point the new tag at it in `main.css`.

---

## Deploying to GitHub Pages

1. Push the repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`, and save.
4. After a minute or so the site is live at `https://<your-username>.github.io/<repo-name>/`.

All paths in the project are relative, so it works under a repo sub-path without any configuration. The `.nojekyll` file stops GitHub from running the site through Jekyll.

---

## Accessibility

- Dialogue text is announced to screen readers through an `aria-live` region.
- Every control is a real `<button>` with a visible keyboard focus ring.
- Portrait and name-tag animations are switched off when the visitor has *reduce motion* turned on.

---

## Credits

Character art from the **Character Expression Template Kit**, available free on itch.io. <!-- TODO: add itch.io link and license terms -->
