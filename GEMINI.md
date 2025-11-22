# GEMINI.md: FlightToolbox Project

This document provides a comprehensive overview of the FlightToolbox project, its structure, and development conventions to guide future interactions and development.

## Project Overview

**FlightToolbox (飞行工具箱)** is a sophisticated WeChat Mini Program designed for airline pilots. Its primary goal is to serve as an "offline-first" digital toolkit, providing essential information and utilities for flight operations.

- **Purpose:** To provide pilots with quick access to reference materials, calculation tools, and operational data, with a focus on offline availability.
- **Core Features:**
    - **Data Search (资料查询):** A central search function.
    - **Calculator Tools (计算工具):** A suite of aviation-specific calculators (e.g., descent, crosswind, temperature correction).
    - **Cockpit (驾驶舱):** A "cockpit" mode that utilizes GPS for location-based data.
    - **Communications (通信):** Provides standard phraseology, communication failure guidance, and a large library of ATC audio recordings for various countries.
    - **My Home (我的首页):** A personalized user section.
- **Technologies:**
    - **Frontend:** WeChat Mini Program Framework (`glass-easel`)
    - **Language:** TypeScript
    - **UI Library:** Vant WeApp
    - **Package Manager:** NPM

## Architecture

The application's architecture is heavily influenced by the WeChat Mini Program platform's constraints and features.

- **Monorepo Structure:** The root directory acts as a workspace, with the main application code located in the `miniprogram/` directory.
- **Sub-packaging (分包):** The application is highly modular and makes extensive use of the "sub-packages" feature. This is crucial for managing the application's large size and optimizing initial load times. Features are encapsulated into distinct packages (e.g., `packageAircraftPerformance`, `packageDuty`, `packageJapan`) which are loaded on demand.
- **Preloading:** The `preloadRule` in `miniprogram/app.json` is configured to intelligently preload certain sub-packages in the background when a user navigates to related sections, improving perceived performance.
- **Offline First:** The description in `miniprogram/package.json` explicitly states an "offline-first" design philosophy, implying local data storage and functionality that works without a constant internet connection.

## Building and Running

The project is developed, built, and deployed using the official **WeChat DevTools**.

- **Prerequisites:** WeChat DevTools IDE.
- **Setup:**
    1. Clone the repository.
    2. Open the project folder (`/mnt/d/FlightToolbox`) in WeChat DevTools. The tool should automatically recognize the project configuration.
    3. The `appid` is `wxf887e89fc2604637`.
- **Running:**
    - The `dev` script in `package.json` simply prints a message: `'请在微信开发者工具中预览'` (Please preview in WeChat DevTools).
    - Use the "Preview" or "Test" functions within the DevTools to run the miniprogram on a physical device or in the simulator.
- **Building:**
    - The project uses manual NPM packaging (`packNpmManually: true`).
    - To build dependencies, use the "Tools" -> "Build NPM" command in the WeChat DevTools menu.
    - The root `build` script delegates to this process.

## Development Conventions

- **Code Style:**
    - **Indentation:** 2 spaces, using spaces instead of tabs. This is configured in `project.config.json`.
    - **Linting:** A `lint` script is present in `miniprogram/package.json`, which suggests that code quality checks are in place.
- **File Structure:**
    - All miniprogram source code resides in `miniprogram/`.
    - Main pages are in `miniprogram/pages/`.
    - Modular features are organized into `miniprogram/package*/` directories, each acting as a self-contained sub-package.
    - Global styles and application logic are in `miniprogram/app.wxss` and `miniprogram/app.ts` respectively.
- **Dependencies:** Project dependencies are managed via `npm`. The primary UI component library is `@vant/weapp`.
