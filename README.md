# TypeTest

A minimal, dark-themed typing speed test built with TypeScript and vanilla CSS.

## Features

- **WPM & Raw WPM** tracking
- **Accuracy** and **error** counting
- **15 / 30 / 60 / 120 second** modes
- Live stats updating as you type
- Infinite word stream — never runs out
- Character-level highlighting (correct / wrong / cursor)
- Clean results panel with animated reveal
- Keyboard shortcut: `Esc` to restart

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/typing-speed-test.git
cd typing-speed-test
npm install
```

### 2. Build

```bash
npm run build
```

This compiles `src/main.ts` → `main.js` in the project root.

### 3. Run locally

Open `index.html` directly in your browser, **or** use a dev server:

```bash
npx serve .
```

### 4. Watch mode (auto-recompile on save)

```bash
npm run watch
```

## Project Structure

```
typing-speed-test/
├── index.html      # Markup
├── style.css       # All styles
├── main.js         # Compiled output (committed for GitHub Pages)
├── src/
│   └── main.ts     # TypeScript source
├── tsconfig.json
└── package.json
```

## Deploy to GitHub Pages

1. Push the repo (including `main.js`) to GitHub.
2. Go to **Settings → Pages → Source** and select the `main` branch / root.
3. Done — your test is live at `https://<your-username>.github.io/typing-speed-test/`.

## License

MIT
