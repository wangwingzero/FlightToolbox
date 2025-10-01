# Repository Guidelines

## Project Structure & Module Organization
`miniprogram/` contains the WeChat Mini Program source. Feature pages live under `miniprogram/pages/<feature>/` (e.g., `pages/flight-calculator/`), while shared UI widgets reside in `miniprogram/components/`. Persisted datasets and audio cues are stored in `miniprogram/data/` and `miniprogram/audio/`; update them through the provided scripts to preserve ordering and localization keys. Place cross-cutting helpers in `miniprogram/utils/`, and keep reference manuals in `docs/` or root PDF files so they stay outside the runtime bundle.

## Build, Test, and Development Commands
- `cd miniprogram && pnpm install`: install and sync npm modules (Node 18+ recommended).
- `pnpm --dir miniprogram run dev`: launch the hot-reload workflow; pair with the WeChat Developer Tools simulator.
- `pnpm --dir miniprogram run lint`: run ESLint across JS/TS assets; fix all findings before opening a PR.
- `pnpm --dir miniprogram run build`: prepare the WeChat npm build; follow up in DevTools with Tools -> Build npm.

## Coding Style & Naming Conventions
Use 2-space indentation for JS, TS, WXML, and WXSS. Prefer TypeScript for app-level logic and ES2017 modules elsewhere. Name pages and subpackages in kebab-case (`pages/cockpit-map/`), data payloads in snake_case (`data/gps_updates.json`), and utilities in lowerCamelCase (`utils/audioManager.js`). Keep strings ready for localization by reusing keys in `data/regions/` and centralized managers in `utils/`.

## Testing Guidelines
Always run `pnpm --dir miniprogram run lint` prior to each push. Validate flows in the WeChat Developer Tools: 1) Tools -> Build npm, 2) Tools -> Compile for target devices, 3) Debug -> Performance to profile audio playback and GPS updates. Document manual scenarios in `docs/YYYYMMDD-feature.md` for traceability.

## Commit & Pull Request Guidelines
Follow conventional commits with scoped prefixes such as `feat(pages): add cockpit overlay` or `fix(GPS): smooth altitude trace`. Reference related issues (`Closes #123`) and attach simulator screenshots or clips when UI shifts. PR descriptions should summarize purpose, key changes, test evidence, rollout concerns (affected subpackages, new audio/assets), and request review from the responsible domain owner.

## Security & Environment Notes
Store credentials and API tokens exclusively in `.env` (never commit them). Keep offline datasets synchronized through the internal SharePoint workflow before release. Develop with the latest WeChat Developer Tools on macOS or Windows and enable the glass-easel framework flag to mirror production behavior.