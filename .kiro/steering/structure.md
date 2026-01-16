# Project Structure

## Root Layout
```
miniprogram/           # Main mini program source
├── app.json          # App config, pages, subpackages, tabbar
├── app.ts            # App entry point
├── app.wxss          # Global styles
├── pages/            # Main pages (20 pages in main package)
├── package*/         # Subpackages (59 total)
├── utils/            # Shared utilities (55 files)
├── data/             # Shared data files
├── components/       # Shared components
├── images/           # TabBar icons
├── audio/            # Shared audio files
└── assets/           # Fonts and static assets

docs/                 # Reference documentation (markdown)
.kiro/                # Kiro configuration
工具脚本/              # Utility scripts
广告/                  # Ad configuration docs
更新说明/              # Version release notes
审计IOSA/             # IOSA audit reference
```

## Subpackage Architecture (59 packages)

### Functional Packages (28)
- `packageA` - ICAO vocabulary (icaoPackage)
- `packageB` - Abbreviations (Boeing, Airbus, COMAC, Jeppesen, AIP)
- `packageC` - Airport database (airportPackage)
- `packageD` - Definitions (definitionsPackage)
- `packageF` - ACR (Actual Climb Rate)
- `packageG` - Dangerous goods
- `packageH` - Twin engine operations
- `packageO` - Misc pages (30 pages: calculators, tools, reports)
- `packageCCAR` - CCAR regulations (caacPackage)
- `packageIOSA` - IOSA audit standards
- `packageWeather` - Weather tools
- `packageDuty` - Duty time calculator
- `packageCompetence` - Competence management
- `packageDiet` - Pilot diet guidelines
- `packageMedical` - Medical standards
- `packageICAO` - ICAO publications
- `packageRadiation` - Radiation exposure
- `packageQAR` - QAR data analysis
- `packageWalkaround` - A330 walkaround inspection
- `packageWalkaroundImages1-4` - Walkaround images (split for size)
- `packageWalkaroundImagesShared` - Shared walkaround images
- `packageCommFailure` - Communication failure procedures (11 pages)
- `packageAircraftParameters` - Aircraft parameters
- `packageAircraftPerformance` - Aircraft performance data
- `packageTermCenter` - Terminology center

### Audio Packages (31 countries/regions)
Named pattern: `package{Country}` (e.g., `packageJapan`, `packageSingapore`)
Each contains ATC communication recordings (.mp3) and data files for that region.

Countries: Japan, Philippines, Korean, Singapore, Thailand, Russia, Srilanka, Australia, Turkey, France, America, Italy, UAE, UK, Taipei, Macau, HongKong, Canada, Egypt, NewZealand, Malaysia, Indonesia, Vietnam, India, Cambodia, Myanmar, Uzbekistan, Maldive, Spain, Germany, Holland

## Key Directories

### `miniprogram/utils/` - Core Utilities (55 files)
- `base-page.js` - **REQUIRED** page base class
- `version-manager.js` - Versioned cache key management
- `ad-*.js` - Advertisement management (6 files)
- `audio-*.js` - Audio caching and playback (10 files)
- `*-manager.js` - Various feature managers
- `env-*.js` - Environment detection and diagnostics

### `miniprogram/pages/` - Main Pages (20 pages)
TabBar pages (5):
1. `search/` - 资料查询 (Reference search)
2. `flight-calculator/` - 计算工具 (Calculator tools)
3. `cockpit/` - 驾驶舱 (GPS cockpit display)
4. `operations/` - 通信 (Communication tools)
5. `home/` - 我的首页 (User profile/settings)

Other main pages:
- `airline-recordings/` - ATC recordings entry
- `recording-categories/` - Recording categories
- `recording-clips/` - Recording clips list
- `audio-player/` - Audio player
- `communication-rules/` - Communication rules
- `airport-map/` - Airport map
- `offline-center/` - Offline data center
- etc.

### `miniprogram/data/` - Shared Data
- Region-specific data in `data/regions/`
- Emergency procedures, phraseology, weather advisories
- Incident investigation data

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
Configured in `app.json` under `preloadRule`. Each TabBar page and key pages preload specific subpackages to optimize loading.
