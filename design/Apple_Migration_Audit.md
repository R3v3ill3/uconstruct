### Project UI Audit – Apple Design Migration

#### Stack detection
- Framework: React 18 with Vite
- Routing: `react-router-dom`
- UI libs: Radix Primitives + shadcn/ui pattern
- Styling: TailwindCSS 3, class-based dark mode (`.dark`)
- Icons: `lucide-react`
- Theming: CSS variables defined in `src/index.css` (HSL). Tailwind config maps to vars. No dedicated theme switcher in layout.

#### Current tokens (from `src/index.css` and `tailwind.config.ts`)
- Colors: `--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, and a `--sidebar-*` group. Light and `.dark` provided.
- Radius: `--radius` consumed by Tailwind radii.
- Motion: Tailwind animate plugin used; no global duration/easing vars.
- Typography: No explicit font stack override; Tailwind defaults. No Apple scale mapping.
- Shadow/elevation: `shadow-sm` used in components; no tiered elevation tokens.
- Spacing: Tailwind default scale used; no explicit 4/8 grid documentation.

#### Component inventory (from `src/components/ui`)
- Buttons: shadcn-style `button` with variants: default, destructive, outline, secondary, ghost, link. Sizes: sm, default, lg, icon.
- Inputs: `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `slider` based on Radix.
- Surfaces: `card`, `dialog`/`sheet`, `popover`, `hover-card`, `dropdown-menu`, `menubar`, `navigation-menu`, `sidebar`.
- Structure: `Layout` with header, nav items, user menu. No large title/toolbar pattern.
- Tabs: Segmented background with active pill; no animated underline.
- Toast: `toaster` and `sonner` present.

#### Gaps vs Apple HIG (Clarity, Deference, Depth)
- Typography: Missing system font stack and named roles (display/largeTitle/title...). Text sizes vary by utility; needs predictable scale.
- Color: Palette is neutral; accent is blue-ish. Need semantic tokens `--bg`, `--surface`, `--text`, `--text-muted`, `--sep`, `--accent`, `--accent-contrast`, with AA contrast guaranteed across light/dark.
- Shape & Depth: Borders used widely; should reduce in favor of subtle separators and soft shadows. Need elevation tokens and hairline separators.
- Motion: Animations exist (accordion, dialogs) but no global easing/duration or `prefers-reduced-motion` guard.
- Hit targets: Many controls use `h-10` (~40px). Apple min is 44px; standardize inputs/buttons to min 44px.
- Focus: Focus rings present via Tailwind ring; ensure visibility and consistency on all controls.
- Icons: Lucide is consistent; ensure stroke width uniform (1.5–2.0) and muted color in inactive states.
- Dark mode: `.dark` tokens exist; no theme switcher surfaced in UI; relies on external provider for `sonner` only.
- Layout & spacing: No documented grid; margins vary. Need consistent layout margins (16–24px mobile, larger on desktop), max content widths.
- Lists: Separators rely on `border`; prefer hairline `--sep` and relaxed row heights.

#### Risks/constraints
- Preserve component APIs; shadcn variants widely used; extend without breaking.
- Keep bundle size; reuse existing Radix/shadcn.
- No licensed SF Pro; use system font stack.

#### Recommended workstreams
1) Introduce design tokens with Apple-aligned roles (typography, color, radius, elevation, spacing, motion) as CSS variables and map in Tailwind.
2) Add system font stack and typography primitives (Heading/Text) that map to Apple roles.
3) Augment `Button` with Apple variants: Filled, Tinted, Plain; make 44px default height.
4) Normalize `Input`/`Textarea` heights, separators, and focus rings; add clear, subtle shadows on elevation.
5) Add `--sep` hairline borders; reduce heavy borders across `Layout`, `Card`, lists.
6) Add prefers-reduced-motion guard and global `--ease` and duration vars; apply to buttons, tabs, cards.
7) Add theme switcher (system default) and expose in header.
8) Create UI playground route to visualize tokens and states.

### Project UI Audit – Apple Design Migration

#### Stack detection
\- Framework: React 18 with Vite
\- Routing: `react-router-dom`
\- UI libs: Radix Primitives + shadcn/ui pattern
\- Styling: TailwindCSS 3, class-based dark mode (`.dark`)
\- Icons: `lucide-react`
\- Theming: CSS variables defined in `src/index.css` (HSL). Tailwind config maps to vars. No dedicated theme switcher in layout.

#### Current tokens (from `src/index.css` and `tailwind.config.ts`)
\- Colors: `--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, and a `--sidebar-*` group. Light and `.dark` provided.
\- Radius: `--radius` consumed by Tailwind radii.
\- Motion: Tailwind animate plugin used; no global duration/easing vars.
\- Typography: No explicit font stack override; Tailwind defaults. No Apple scale mapping.
\- Shadow/elevation: `shadow-sm` used in components; no tiered elevation tokens.
\- Spacing: Tailwind default scale used; no explicit 4/8 grid documentation.

#### Component inventory (from `src/components/ui`)
\- Buttons: shadcn-style `button` with variants: default, destructive, outline, secondary, ghost, link. Sizes: sm, default, lg, icon.
\- Inputs: `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `slider` based on Radix.
\- Surfaces: `card`, `dialog`/`sheet`, `popover`, `hover-card`, `dropdown-menu`, `menubar`, `navigation-menu`, `sidebar`.
\- Structure: `Layout` with header, nav items, user menu. No large title/toolbar pattern.
\- Tabs: Segmented background with active pill; no animated underline.
\- Toast: `toaster` and `sonner` present.

#### Gaps vs Apple HIG (Clarity, Deference, Depth)
\- Typography: Missing system font stack and named roles (display/largeTitle/title...). Text sizes vary by utility; needs predictable scale.
\- Color: Palette is neutral; accent is blue-ish. Need semantic tokens `--bg`, `--surface`, `--text`, `--text-muted`, `--sep`, `--accent`, `--accent-contrast`, with AA contrast guaranteed across light/dark.
\- Shape & Depth: Borders used widely; should reduce in favor of subtle separators and soft shadows. Need elevation tokens and hairline separators.
\- Motion: Animations exist (accordion, dialogs) but no global easing/duration or `prefers-reduced-motion` guard.
\- Hit targets: Many controls use `h-10` (~40px). Apple min is 44px; standardize inputs/buttons to min 44px.
\- Focus: Focus rings present via Tailwind ring; ensure visibility and consistency on all controls.
\- Icons: Lucide is consistent; ensure stroke width uniform (1.5–2.0) and muted color in inactive states.
\- Dark mode: `.dark` tokens exist; no theme switcher surfaced in UI; relies on external provider for `sonner` only.
\- Layout & spacing: No documented grid; margins vary. Need consistent layout margins (16–24px mobile, larger on desktop), max content widths.
\- Lists: Separators rely on `border`; prefer hairline `--sep` and relaxed row heights.

#### Risks/constraints
\- Preserve component APIs; shadcn variants widely used; extend without breaking.
\- Keep bundle size; reuse existing Radix/shadcn.
\- No licensed SF Pro; use system font stack.

#### Recommended workstreams
1) Introduce design tokens with Apple-aligned roles (typography, color, radius, elevation, spacing, motion) as CSS variables and map in Tailwind.
2) Add system font stack and typography primitives (Heading/Text) that map to Apple roles.
3) Augment `Button` with Apple variants: Filled, Tinted, Plain; make 44px default height.
4) Normalize `Input`/`Textarea` heights, separators, and focus rings; add clear, subtle shadows on elevation.
5) Add `--sep` hairline borders; reduce heavy borders across `Layout`, `Card`, lists.
6) Add prefers-reduced-motion guard and global `--ease` and duration vars; apply to buttons, tabs, cards.
7) Add theme switcher (system default) and expose in header.
8) Create UI playground route to visualize tokens and states.

