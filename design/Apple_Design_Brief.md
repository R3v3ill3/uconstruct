### Apple Design Brief – Target Look & Feel

#### Principles
- Clarity: content-first typography, generous whitespace, readable contrast.
- Deference: reduced chrome, subtle separations, light textures.
- Depth: soft elevation, motion that supports hierarchy, not distracts.

#### Typography (system stack)
Font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, "Helvetica Neue", Arial, sans-serif`.

Roles and scale (px):
- display 56/64
- largeTitle 34/40
- title1 28/34
- title2 22/28
- title3 20/26
- headline 17/24
- body 17/24
- callout 16/22
- subheadline 15/22
- footnote 13/18
- caption 12/16

#### Color tokens (light/dark)
- `--bg`, `--bg-elev`, `--surface`, `--text`, `--text-muted`, `--sep`
- `--accent`, `--accent-contrast`
- Semantic: `--success`, `--warn`, `--danger`
All colors meet WCAG AA for text on background.

#### Radius
- `--radius-xs: 6px; --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px;`

#### Elevation
- `--shadow-sm`, `--shadow-md`, `--shadow-lg` with low alpha and soft y-offsets.
- Focus ring: accent-tinted outline; visible on `:focus-visible`.

#### Motion
- `--ease: cubic-bezier(0.2, 0, 0, 1); --dur-fast: 150ms; --dur: 200ms; --dur-slow: 300ms;`
- Respect `prefers-reduced-motion: reduce`.

#### Components
- Typography primitives: `Heading`, `Text` locked to roles above.
- Buttons: Filled, Tinted, Plain; sizes S/M/L with min height 44px; clear hover/active/disabled/focus states.
- Inputs: TextField, TextArea, Select, Switch, Slider with 44px min, hairline separators, clear focus rings.
- Surfaces: Card, Toolbar/NavigationBar, Sheet/Modal with soft elevation; large title pattern where appropriate.
- Lists: comfortable row height (48–56px), muted `--sep` separators; optional trailing chevrons.
- Tabs/Segmented: pill-based segmented control or underline with motion.
- Toast: unobtrusive; content forward.

#### Implementation rules
- Semantic DOM (`button`, `label`, `nav`, `header`, `main`, ...).
- Keyboard support for all controls; visible `:focus-visible` outlines.
- Single icon family (Lucide), consistent stroke width 1.5–2.0.
- Dark mode via `.dark` class with system default.

#### Deliverables
- Token layer in `src/styles/tokens.css` + Tailwind config mapping.
- Theme provider + Mode toggle in header.
- Core primitives updated; 44px minimum heights.
- UI playground `/ui-playground` route for review.

