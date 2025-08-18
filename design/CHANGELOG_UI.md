## UI Changelog

### style(tokens): add Apple-style tokens and theme provider
- Added `src/styles/tokens.css` with light/dark color tokens, radii, elevation, and motion variables
- Mapped existing Tailwind variables to tokens via `src/index.css`
- Added `ThemeProvider` and integrated into `App`

### feat(ui): elevate core primitives and sizes
- `Button`: Added Apple-style variants (filled/tinted/plain), raised default size to 44px min, subtle motion
- `Input`/`Textarea`/`Select`: 44px min height, focus ring and subtle elevation on focus
- `Card`: hover elevation; consistent motion
- `Tabs`/`Switch`/`Slider`: motion-tuned transitions

### docs: audit and brief
- Added `design/Apple_Migration_Audit.md`
- Added `design/Apple_Design_Brief.md`
- Added `design/Apple_A11y_Report.md`

### playground
- Added `src/pages/UIPlayground.tsx` and route `/ui-playground` secured behind auth

### scripts
- Added `scripts/a11y-check` placeholder script and npm script alias

