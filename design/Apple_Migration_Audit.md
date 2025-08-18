## Apple Design Migration Audit

This audit inventories the current UI system and identifies gaps relative to Apple Human Interface Guidelines (HIG) principles: Clarity, Deference, Depth.

### Stack and Foundation
- Framework: Vite + React 18 + TypeScript
- Styling: Tailwind CSS (dark mode via `.dark` class), `tailwindcss-animate`
- Component primitives: shadcn/ui built on Radix UI
- Icons: `lucide-react`
- Theme variables: HSL CSS variables in `src/index.css` (background/foreground, card, popover, primary/secondary, accent, destructive, muted, border/input/ring, sidebar set)
- Config: `tailwind.config.ts` maps Tailwind colors to CSS vars and sets `borderRadius` to `--radius`

### Typography
- Font family: not explicitly overridden; inherits Tailwind default (likely UI system fonts on many platforms but not enforced)
- Scale usage: ad-hoc Tailwind text classes across pages (e.g., `text-xl`, `text-2xl`), no codified typographic roles
- Line-height/weights: implicit via Tailwind defaults; no semantic mapping to Apple roles (display, largeTitle, title1–3, headline, body, etc.)

### Color System
- Present tokens: generic semantic set (primary/secondary/muted/accent/destructive) and surfaces (background/card/popover)
- Missing: Apple-like minimal neutral palette with a single accent and explicit tokens for `--text`, `--text-muted`, `--sep` (hairline), `--surface` vs `--bg-elev` layering, and semantic states `success/warn/danger`
- Contrast: defaults likely meet AA for most pairs but not formally verified

### Layout & Spacing
- Spacing: Tailwind defaults; no enforced 4/8pt rhythm documented
- Layout margins: pages use `p-6`, containers center with Tailwind `container` config; not standardized across all pages
- Surfaces: cards use `rounded-lg border bg-card shadow-sm`; borders are sometimes heavier than necessary vs hairline separators

### Shape & Depth
- Radii: `--radius` drives Tailwind `lg/md/sm`; single knob, not a full radii scale (`xs/sm/md/lg`)
- Shadows: uses Tailwind `shadow-sm`; no elevation scale tokens
- Focus: visible via `focus-visible:ring-2` tied to `--ring`, OK but not tuned to Apple-like subtle ring

### Motion
- Present: `tailwindcss-animate` for some Radix components; default durations/easing
- Missing: global motion tokens (`--ease`, `--dur-fast`, `--dur`, `--dur-slow`) and respect for `prefers-reduced-motion`

### Components
- Buttons: shadcn variants (`default`, `secondary`, `outline`, `ghost`, `link`, `destructive`). No Apple-style `Filled`, `Tinted`, `Plain` naming; base height 40px (`h-10`).
- Inputs: base height 40px (`h-10`), subtle border, good focus ring
- Card: neutral; relies on border + small shadow
- Modal/Sheet/Tabs/List: provided by shadcn/Radix; rely on shared tokens

### Navigation & Shell
- `src/components/Layout.tsx` header uses solid background with border; no translucency or large title pattern
- No theme switcher; `next-themes` is installed but provider not wired

### Accessibility
- Keyboard and focus generally handled by Radix + shadcn
- No automated a11y script in `package.json`

### Gaps vs HIG (Clarity, Deference, Depth)
- Clarity: Typography roles and consistent scale missing; neutral palette ok but lacks explicit text/separator tokens
- Deference: Chrome (borders) sometimes heavy; missing translucent navigation bar and hairline separators
- Depth: Elevation not tokenized; motion not standardized; min hit-target 44px not met in several controls

### Recommendations Summary
1) Add token layer (`src/styles/tokens.css`) with light/dark and map to Tailwind colors; expand to Apple-like semantics.
2) Add typography roles and system font stack; expose utility classes.
3) Raise control heights to 44px, refine focus ring, add elevation and separators.
4) Wire `next-themes` provider + toggle; prefer class strategy.
5) Introduce `/ui-playground` to visualize tokens and components in both themes.
6) Add basic a11y script and document findings.

