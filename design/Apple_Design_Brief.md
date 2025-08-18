## Apple Design Brief

Objective: Evolve the UI to embody Apple HIG principles—Clarity, Deference, Depth—while preserving behavior and tests.

### Visual Language
- Typography: System UI stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, "Helvetica Neue", Arial, sans-serif`) with semantic roles mapped to utilities.
- Color: Neutral, restrained backgrounds and a single accent. Light and dark themes with WCAG AA text contrast.
- Shape: Soft radii with 6–16px scale; hairline separators over heavy borders.
- Depth: Subtle elevation (shadows) for surfaces. Clear, soft focus rings.
- Motion: Fast and subtle; respect `prefers-reduced-motion`.

### Design Tokens
Define CSS variables in `:root` and `.dark` and map to Tailwind. Key tokens:
- Colors: `--bg`, `--bg-elev`, `--surface`, `--text`, `--text-muted`, `--sep`, `--accent`, `--accent-contrast`, semantic `--success`, `--warn`, `--danger`.
- Radii: `--radius-xs: 6px; --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px;`
- Spacing: 4/8pt scale: 4, 8, 12, 16, 20, 24, 32, 40
- Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`; `--ring` for focus
- Motion: `--ease`, `--dur-fast`, `--dur`, `--dur-slow`
- Typography roles (size/line-height/weight):
  - display 56/64, largeTitle 34/40, title1 28/34, title2 22/28, title3 20/26, headline 17/24, body 17/24, callout 16/22, subheadline 15/22, footnote 13/18, caption 12/16

### Component Rules
- Buttons: Filled (accent), Tinted (subtle bg with accent text), Plain (no bg; icon/text) with hover/active/disabled/focus-visible.
- Inputs: 44px min height, clear focus ring, subtle separators and elevation on focus.
- Surfaces: Cards and Sheets with soft elevation and hairline separators; toolbars may use slight translucency.
- Lists: Comfortable row height, muted separators, optional disclosure chevrons.
- Tabs/Segmented: Underline or segmented pill with motion.
- Toasts: Unobtrusive, content-forward.

### Accessibility
- Hit targets ≥ 44×44px, keyboard navigable, visible `:focus-visible` outlines.
- Headings order and landmarks; modals trap focus and support Escape to close.
- Contrast AA+ across tokens.

### Deliverables
- Token layer + Tailwind mapping
- Refactored primitives aligned with tokens
- Playground route with light/dark demos
- A11y script and report

### Notes
- Do not add SF Pro or SF Symbols unless already licensed in repo. Use system fonts and `lucide-react` icons.
- Keep diffs small and incremental.

