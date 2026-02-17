# Tech Stack

## Platform
- WeChat Mini Program (微信小程序)
- Framework: glass-easel component framework
- Language: JavaScript (ES5 strict) + TypeScript
- Compiler: SWC with TypeScript plugin

## UI Components
- Vant Weapp (@vant/weapp ^1.11.7)
- Custom components in `miniprogram/components/`

## Key Configurations
- Lazy loading: `lazyCodeLoading: "requiredComponents"`
- Style version: v2
- Base library: 3.10.0+

## Development Environment
- IDE: WeChat DevTools (微信开发者工具)
- OS: Windows
- Node.js: >=18 <23
- Package manager: npm 10

## Common Commands

```bash
# Install dependencies
cd miniprogram && npm install

# Build npm packages (run in WeChat DevTools)
# Menu: 工具 -> 构建npm

# Fix Vant font paths
npm run fix-fonts

# Generate version file
npm run generate-version

# Validate JSON files (PowerShell)
npm run check
# or
powershell -File validate-bom-json.ps1
```

## Build & Deploy
1. Open project in WeChat DevTools
2. Build npm: 工具 -> 构建npm
3. Compile and preview
4. Upload for review via DevTools

## Key Dependencies
- @vant/weapp: UI component library
- @types/wechat-miniprogram: TypeScript definitions
- typescript: ^5.9.3

## Testing (Development)
- fast-check: ^4.5.3 - Property-based testing library (for audit tools)
- Jest: ^30.2.0 - Test runner for property-based tests
- Test location: `miniprogram/utils/audit/__tests__/`
- Run tests: `cd miniprogram && npm test`

## File Types
- `.js` - JavaScript (ES5)
- `.ts` - TypeScript (compiled by DevTools)
- `.wxml` - WeChat template markup
- `.wxss` - WeChat stylesheet (CSS-like)
- `.json` - Page/component configuration
- `.mp3` - ATC communication audio files
