## Accessibility Report (Initial Pass)

Scope: Token and theme migration toward Apple HIG, ensuring WCAG AA contrast and keyboard operability.

Checklist
- Headings and landmarks: Use semantic `header`, `nav`, `main`. Pages largely conform via Layout wrapper.
- Keyboard: Radix-based components provide keyboard navigation; focus ring visible via Tailwind + `--ring`.
- Hit targets: Raised core controls to 44px min (buttons, inputs, select trigger). Switch/slider adequate.
- Contrast: Tokens chosen for AA+ against backgrounds. Verify real content combinations during QA.
- Motion: Subtle transitions with `prefers-reduced-motion` respected by default (no forced animations); future work to add explicit media queries for reduced motion if needed.

Open Items
- Modal focus management: Confirm trap/restore across all dialogs.
- Error states: Ensure text contrast and icon affordances across variants.
- Dark mode imagery: If any images/illustrations exist, verify contrast in dark theme.

