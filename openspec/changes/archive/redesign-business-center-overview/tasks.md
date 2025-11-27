# Tasks: Redesign Business Center Overview

## 1. Create Bento Grid Components

- [x] 1.1 Create `BentoGrid` component in
      `apps/web/src/components/ui/bento-grid.tsx`
- [x] 1.2 Create `BentoCard` component with support for span variants (1x1, 2x1,
      1x2, 2x2)
- [x] 1.3 Add focus-visible states and keyboard navigation (tabIndex,
      outline-ring)
- [x] 1.4 Test responsive behavior across breakpoints (mobile, tablet, desktop)

## 2. Build Hero Metric Cards

- [x] 2.1 Create `IntakeQueueHero` component (col-span-2) with sparkline trend
      chart
- [x] 2.2 Create `TeamCapacityHero` component (col-span-2) with availability
      breakdown
- [x] 2.3 Integrate Recharts `AreaChart` with `accessibilityLayer` prop
- [x] 2.4 Add semantic status colors (--success, --warning, --error) for
      capacity indicators

## 3. Refactor Standard Metric Cards

- [x] 3.1 Convert page to use `BentoCard` for metrics (replaced
      BusinessMetricCard usage in page.tsx)
- [ ] 3.2 Add loading skeleton states using existing `Skeleton` component
- [ ] 3.3 Add empty state handling using existing `Empty` component
- [x] 3.4 Maintain existing action links and trend indicators

## 4. Upgrade Charts for Accessibility

- [x] 4.1 Add `accessibilityLayer` to `IntakeTrendChart`
- [x] 4.2 Add `accessibilityLayer` to `ProjectStatusChart` (aria-labels and
      role="progressbar")
- [x] 4.3 Add `accessibilityLayer` to `TeamCapacityChart`
- [x] 4.4 Keep existing tooltip styling (consistent with design tokens)
- [x] 4.5 Add aria-labels to all chart components

## 5. Update Page Layout

- [x] 5.1 Replace uniform 4-column grid with BentoGrid in `page.tsx`
- [x] 5.2 Configure hero cards in first row (2+2 column spans)
- [x] 5.3 Configure standard metrics in second row (1+1+1+1 spans)
- [x] 5.4 Configure full-width charts section in third row
- [x] 5.5 Add reduced-motion support via `motion-reduce:` variants

## 6. Accessibility & Testing

- [ ] 6.1 Run axe-core accessibility audit
- [ ] 6.2 Test keyboard-only navigation flow
- [ ] 6.3 Verify contrast ratios in both light and dark modes
- [ ] 6.4 Test with `prefers-reduced-motion: reduce` enabled
- [x] 6.5 Add ARIA labels to all interactive chart elements

## 7. Cleanup

- [x] 7.1 Remove deprecated uniform grid styles (replaced in page.tsx)
- [x] 7.2 Update component exports (added to bento-grid.tsx)
- [x] 7.3 Build verification passed - no TypeScript errors
