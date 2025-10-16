# 始终使用中文进行交流

# Repository Guidelines

## Project Structure & Module Organization

The WeChat Mini Program lives under `miniprogram/`. Feature pages follow the `pages/<feature>/index.(js|wxml|wxss|json)` quartet, with large suites decomposed into `modules/` folders. Lightweight subpackages in `miniprogram/package*` isolate regional regulations to keep the cockpit bundle slim. Shared UI and behaviors stay in `components/` and modern JavaScript (ES6+/TypeScript) helpers inside `utils/` (for example, `base-page.js` and `audio-*`). Domain datasets such as `CommunicationRules.js` and `snowtam.js` remain in `miniprogram/data/`, while cross-cutting configuration sits in root-level `data/tasks.json` and automation scripts like `setdata-performance-test.js`. API exploration notes belong in `docs/`.

## Build, Test, and Development Commands

Run `pnpm install --dir miniprogram` to hydrate dependencies into `miniprogram_npm/`. Use `pnpm run lint --dir miniprogram` (Git Bash or WSL recommended because the script invokes `find`) for syntax checks before committing. Import the project root into the WeChat Developer Tools and rely on that IDE for live preview and official builds (`npm run dev/build` only echo reminders). Execute `node setdata-performance-test.js` from the repository root when profiling `setData` throughput on heavy pages.

## Coding Style & Naming Conventions

Follow two-space indentation (see `project.config.json`) and prefer trailing commas off. **WeChat Mini Program natively supports ES6+ and TypeScript** - feel free to use modern JavaScript features like `async/await`, `let/const`, arrow functions, and classes in regular JS/TS files. The framework automatically transpiles these to ES5 for older devices (configured via `"es6": true` in project.config.json). Only WXS scripts (.wxs files) require ES5 syntax. Keep filenames kebab-case for folders and camelCase for data files; page-level modules should export plain objects instead of classes when possible. Co-locate assets with their page and mirror component names between `.wxml` tags and `.json` `usingComponents` keys.

## Testing Guidelines

Static linting is the only automated gate today, so treat it as required. For functional checks, run standard scenarios inside the WeChat Developer Tools simulator (night mode, avionics cold start, offline cache). Use `test-map.html` for visual regression on map overlays and capture console output when reproducing GPS issues. Document manual test cases alongside data updates in `docs/` to keep reference material synchronized.

## Commit & Pull Request Guidelines

Match the existing `type(scope): summary` format (`feat`, `fix`, `docs`, `perf`, etc.), and write the description in English or Chinese as long as it is actionable. Reference related tasks from `data/tasks.json` or external trackers in the footer. Pull requests should include: 1) a concise change log, 2) linked issue IDs, 3) screenshots or screen recordings for UI tweaks, and 4) confirmation that `pnpm run lint --dir miniprogram` and relevant manual checks passed.

## Security & Configuration Tips

Store credentials in `.env` only; never commit live keys (the repo already ignores them). Treat `project.private.config.json` as developer-specific - update it locally without pushing changes. When adding new third-party SDKs, document their initialization requirements and any data-collection toggles inside `docs/` before enabling them in `app.ts`.
