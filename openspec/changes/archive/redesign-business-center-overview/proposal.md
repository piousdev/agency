# Change: Redesign Business Center Overview Page

## Why

The current Business Center overview page uses a uniform 4-column metric card
grid that doesn't effectively prioritize key operational data. Modern dashboard
design (2025 trends) emphasizes bento grid layouts, rich interactive charts, and
strong visual hierarchy to serve both executive and operational users
effectively.

## What Changes

- **Bento Grid Layout**: Replace uniform 4-column grid with asymmetric bento
  layout featuring hero cards for Intake Queue and Team Capacity
- **Rich Interactive Charts**: Upgrade from static progress bars to full
  Recharts with `accessibilityLayer`, tooltips, and responsive containers
- **Enhanced Accessibility**: Add WCAG 2.2 compliance with keyboard navigation,
  focus-visible states, ARIA attributes, and reduced-motion support
- **Design Token Consistency**: Use semantic colors from globals.css (--success,
  --warning, --error) throughout
- **Component Architecture**: Create reusable BentoGrid, BentoCard, and chart
  components following Magic UI patterns

## Impact

- Affected specs: `business-center` (adding Overview Display requirements)
- Affected code:
  - `apps/web/src/app/(default)/dashboard/business-center/page.tsx`
  - `apps/web/src/app/(default)/dashboard/business-center/components/` (new and
    modified)
- No breaking changes to existing functionality
- No API changes required

## Research Sources

| Source                             | Information Used                            |
| ---------------------------------- | ------------------------------------------- |
| Context7: `/magicuidesign/magicui` | BentoGrid & BentoCard component patterns    |
| Context7: `/shadcn-ui/ui`          | Card, Chart, Empty, Skeleton components     |
| Context7: `/recharts/recharts`     | ResponsiveContainer, accessibilityLayer     |
| Context7: `/websites/tailwindcss`  | focus-visible, aria variants, motion-reduce |
| WebSearch: 2025 Dashboard Trends   | Bento grids, data storytelling, minimalism  |
| WebSearch: WCAG 2.2 Accessibility  | Keyboard navigation, contrast ratios        |
