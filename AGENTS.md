# Repository Guidelines

## Project Structure & Module Organization
This repository is a WeChat Mini Program workspace.

- `miniprogram/`: main application code and assets.
- `miniprogram/pages/`: main package pages (TabBar and core entry pages).
- `miniprogram/package*/`: subpackages for feature modules and regional/audio content.
- `miniprogram/utils/`: shared utilities, managers, and audit tooling.
- `miniprogram/components/`: reusable custom components.
- `miniprogram/data/`: shared static data sources.
- `docs/`, `更新说明/`, `广告/`: product docs and release notes.
- `工具脚本/`: maintenance and release helper scripts.

## Build, Test, and Development Commands
Run from repo root unless noted:

- `npm run lint`: syntax-check JS files in `miniprogram/`.
- `npm run dev`: prints local preview hint (use WeChat DevTools for runtime).
- `npm run build`: prints build hint (build npm in WeChat DevTools).
- `npm run fix-fonts`: repairs Vant font paths after install/update.
- `npm run check`: validates BOM/JSON integrity via `validate-bom-json.ps1`.
- `cd miniprogram && npm test`: run Jest tests.
- `cd miniprogram && npm run test:coverage`: generate coverage for `utils/audit`.

## Coding Style & Naming Conventions
- Respect `.editorconfig`: UTF-8, LF, final newline, trim trailing spaces (except Markdown).
- Use 2-space indentation in JS/TS/WXML/WXSS where possible; keep existing file style if mixed.
- File naming follows current conventions: `kebab-case` for many utilities, page entry files as `index.js|ts`, `index.wxml`, `index.wxss`, `index.json`.
- Keep subpackage boundaries clear; avoid cross-package deep imports.

## Testing Guidelines
- Framework: Jest (`miniprogram/jest.config.js`), `testEnvironment: node`.
- Test location: `miniprogram/utils/audit/__tests__/`.
- Naming: `*.test.js` (example: `loading-state-detector.test.js`).
- Add/adjust tests when changing audit logic or shared utility behavior.

## Commit & Pull Request Guidelines
- Follow observed commit style: `feat: ...`, `chore: ...`, `docs: ...` (concise, scoped summaries).
- Include version/release tags when relevant (example: `feat: v2.16.0 ...`).
- PRs should include:
  - change summary and affected paths,
  - related issue/task link,
  - screenshots or WeChat DevTools captures for UI changes,
  - test/lint results and any manual verification steps.

## Media Storage Runbook
- For Cloudflare R2 + Tencent Lighthouse import/deployment operations, always read:
  - `docs/Cloudflare-R2-音频与大文件存储迁移运维手册.md`
- When modifying audio source paths/caching behavior, follow the "给 AI 的快速执行清单" and "完成定义（DoD）" sections in that runbook.
