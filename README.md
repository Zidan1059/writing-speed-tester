# TypeTest

A minimal, dark-themed typing speed tester built with TypeScript and vanilla CSS.

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
git clone https://github.com/Zidan_1059/writing-speed-tester.git
cd writing-speed-tester
npm install
```

### 2. Build

```bash
npm run build
```

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
├── main.js         
├── main.ts     # TypeScript source
├── tsconfig.json
└── package.json
```

## License

MIT
