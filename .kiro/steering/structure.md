# Project Structure

## Root Layout
```
miniprogram/           # Main mini program source
├── app.json          # App config, pages, subpackages, tabbar
├── app.ts            # App entry point
├── app.wxss          # Global styles
├── pages/            # Main pages (in main package)
├── package*/         # Subpackages (57 total)
├── utils/            # Shared utilities
├── data/             # Shared data files
├── components/       # Shared components
├── images/           # TabBar icons
└── assets/           # Fonts and static assets

docs/                 # Reference documentation (markdown)
.kiro/                # Kiro configuration
```

## Subpackage Architecture (57 packages)

### Functional Packages (21)
- `packageA` - ICAO vocabulary
- `packageB` - Abbreviations (Boeing, Airbus, COMAC, Jeppesen, AIP)
- `packageC` - Airport database
- `packageD` - Definitions
- `packageF` - ACR (Actual Climb Rate)
- `packageG` - Dangerous goods
- `packageH` - Twin engine operations
- `packageO` - Misc pages (calculators, tools, reports)
- `packageCCAR` - CCAR regulations
- `packageIOSA` - IOSA audit standards
- `packageWeather` - Weather tools
- `packageDuty` - Duty time calculator
- `packageWalkaround` - A330 walkaround inspection
- `packageWalkaroundImages1-4` - Walkaround images (split for size)
- `packageCommFailure` - Communication failure procedures
- `packageAircraftPerformance` - Aircraft performance data
- `packageTermCenter` - Terminology center

### Audio Packages (31 countries/regions)
Named pattern: `package{Country}` (e.g., `packageJapan`, `packageSingapore`)
Each contains ATC communication recordings for that region.

## Key Directories

### `miniprogram/utils/` - Core Utilities
- `base-page.js` - **REQUIRED** page base class
- `version-manager.js` - Versioned cache key management
- `ad-*.js` - Advertisement management
- `audio-*.js` - Audio caching and playback
- `*-manager.js` - Various feature managers

### `miniprogram/pages/` - Main Pages
TabBar pages (5):
1. `search/` - Reference search (home)
2. `flight-calculator/` - Calculator tools
3. `cockpit/` - GPS cockpit display
4. `operations/` - Communication tools
5. `home/` - User profile/settings

### `miniprogram/data/` - Shared Data
- Region-specific data in `data/regions/`
- Emergency procedures, phraseology, weather advisories

## Page File Convention
Each page consists of 4 files:
```
page-name/
├── index.js    # Page logic (use BasePage)
├── index.json  # Page config
├── index.wxml  # Template
└── index.wxss  # Styles
```

## Subpackage Preloading
Configured in `app.json` under `preloadRule`. Each TabBar page preloads specific subpackages to optimize loading.
