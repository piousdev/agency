# Design: Business Center Overview Redesign

## Context

The Business Center is an internal-only dashboard serving both executives
(high-level KPIs) and operations leads (detailed metrics). The current uniform
grid layout doesn't provide adequate visual hierarchy or accessibility support.

**Constraints:**

- Must follow Server-First architecture (ARCHITECTURE.md)
- Must use existing design tokens from globals.css
- Must maintain all existing functionality
- Must support both light and dark modes

**User Preferences (from research phase):**

- Primary persona: Both executives and operations equally
- Chart style: Rich interactive charts with tooltips
- Layout: Bento grid with combination hero (Intake + Capacity)
- Motion: Reduced motion (respect prefers-reduced-motion)

## Goals / Non-Goals

**Goals:**

- Implement bento grid layout with asymmetric card sizes
- Add hero cards for Intake Queue and Team Capacity
- Enhance charts with Recharts accessibilityLayer
- Achieve WCAG 2.2 AA compliance for keyboard navigation
- Use semantic color tokens consistently

**Non-Goals:**

- Real-time WebSocket updates (future enhancement)
- 3D visualizations
- AI-powered personalization
- Mobile app support

## Decisions

### Decision 1: Bento Grid Implementation

**What:** Create custom BentoGrid component based on Magic UI pattern using CSS
Grid.

**Why:** Magic UI provides production-ready patterns specifically designed for
shadcn/ui compatibility. Their approach uses `auto-rows-[22rem]` with flexible
column spans.

**Implementation:**

```tsx
const BentoGrid = ({ children, className }: BentoGridProps) => (
  <div
    className={cn(
      'grid w-full auto-rows-[18rem] grid-cols-4 gap-4',
      'lg:auto-rows-[20rem]',
      className
    )}
  >
    {children}
  </div>
);
```

**Alternatives considered:**

- CSS Flexbox: Less suitable for asymmetric layouts
- Third-party grid library: Adds unnecessary dependency

### Decision 2: Hero Card Layout

**What:** Intake Queue and Team Capacity each span 2 columns in the first row.

**Why:** User selected "Combination view" - both metrics are equally important
for operational oversight.

**Layout Structure:**

```
Row 1: [Hero: Intake Queue (col-span-2)] [Hero: Team Capacity (col-span-2)]
Row 2: [Active Projects] [Completed] [Content Projects] [Software Projects]
Row 3: [Performance Charts - full width]
```

### Decision 3: Accessible Charts

**What:** Use Recharts with `accessibilityLayer` prop and shadcn/ui
ChartTooltip.

**Why:**

- Recharts native accessibility support for keyboard navigation
- shadcn/ui chart wrapper provides consistent theming
- Respects prefers-reduced-motion automatically

**Implementation:**

```tsx
<AreaChart accessibilityLayer data={data}>
  <ChartTooltip content={<ChartTooltipContent />} />
</AreaChart>
```

### Decision 4: Keyboard Navigation Pattern

**What:** Implement tab-stop navigation with focus-visible indicators.

**Why:** WCAG 2.1.1 requires all interactive elements to be keyboard accessible.

**Implementation:**

- Cards: `tabIndex={0}` with
  `focus-visible:outline-2 focus-visible:outline-ring`
- Charts: Native Recharts keyboard support via accessibilityLayer
- Actions: Standard button focus management

### Decision 5: Color Token Usage

**What:** Use semantic tokens from globals.css for status indicators.

**Why:** Ensures consistency across light/dark modes and maintains 4.5:1
contrast ratios.

**Mapping:**

```tsx
const statusColors = {
  available: 'text-success bg-success/10',
  at_capacity: 'text-warning bg-warning/10',
  overloaded: 'text-error bg-error/10',
};
```

## Risks / Trade-offs

| Risk                              | Mitigation                                 |
| --------------------------------- | ------------------------------------------ |
| Bento layout complexity           | Keep to 2 row heights max, test on mobile  |
| Chart performance with large data | Use ResponsiveContainer, limit data points |
| Accessibility regression          | Manual keyboard testing, axe-core audit    |
| Dark mode contrast issues         | Test both modes with contrast checker      |

## Migration Plan

1. Create new components alongside existing ones
2. Build BentoGrid, BentoCard in `components/` directory
3. Refactor page.tsx to use new layout
4. Remove old BusinessMetricCard after verification
5. No database or API changes required

**Rollback:** Revert page.tsx to previous version (existing components remain
functional)

## Open Questions

- Should sparklines in hero cards be real-time or static? (Recommend: Static for
  MVP)
- Should we add loading skeletons for each card? (Recommend: Yes, using Skeleton
  component)
