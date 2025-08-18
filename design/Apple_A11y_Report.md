### Accessibility Report (Baseline)

Run procedure:
- Build app: `npm run build`
- Preview: `npm run preview`
- A11y check: `npm run a11y`

Automated run output:
- `npm run a11y` executed: Preview started and reachable. No automated assertions yet (placeholder script). Integrate axe/lighthouse in CI for page audits.

Manual findings (current pass):
- Headings: New typography primitives encourage correct roles; page shells should ensure a single `h1` per view. Index uses `Heading` largeTitle as `h1`.
- Labels: Form controls in shadcn components support labels; ensure all icon-only buttons include `aria-label` (added to theme toggle).
- Landmarks: `Layout` provides `header` and `main`; navigation links are semantic.
- Contrast: Tokens provide AA-compliant pairs; verify content vs surface in both themes (OK by inspection; needs automated confirmation).
- Focus: Visible across all updated controls via Tailwind ring; Select items now respond to focus-visible; Tabs underline + ring visible.
- Hit targets: Buttons/inputs/toggles/avatars increased to ≥44px where applicable.
- Modals: Radix `Dialog` manages focus and supports Escape to close; overlay improved for deference.

Next actions:
- Integrate axe-core in e2e or run Lighthouse in CI; export scores.
- Sweep app pages for any residual `h-9/h-10` icon-only controls and add `aria-label` where missing.
- Verify keyboard navigation in `Tabs`, `Menu`, `Select`, `Dialog` flows; add tests if needed.

