### Accessibility Report (Baseline)

Run procedure:
- Build app: `npm run build`
- Preview: `npm run preview`
- A11y check: `npm run a11y`

Baseline findings (to be updated after first run):
- Headings: verify order on all pages
- Labels: ensure `label` elements for all inputs
- Landmarks: `header`, `nav`, `main`, `footer` present
- Contrast: token pairs meet AA+ in both themes
- Focus: visible focus rings across controls
- Modals: focus trap and escape to close (Radix provides this; verify instances)

Action items:
- Add missing aria-labels on icon-only buttons
- Ensure 44x44 hit targets
- Verify keyboard navigation in `Tabs`, `Menu`, `Select`, `Dialog`

