## ADDED Requirements

### Requirement: Overview Display - Bento Grid Layout

The Business Center overview page SHALL use a bento grid layout with asymmetric card sizes to establish visual hierarchy between key metrics.

#### Scenario: Render bento grid structure

- **WHEN** internal user navigates to /dashboard/business-center
- **THEN** page displays bento grid with CSS Grid layout
- **AND** grid uses `auto-rows-[18rem]` base with `lg:auto-rows-[20rem]` for larger screens
- **AND** grid maintains 4-column structure with `gap-4` spacing

#### Scenario: Hero cards span multiple columns

- **WHEN** displaying Intake Queue and Team Capacity metrics
- **THEN** each hero card spans 2 columns (col-span-2)
- **AND** hero cards appear in the first row of the grid
- **AND** hero cards contain enhanced visualizations (sparklines, breakdowns)

#### Scenario: Standard cards fill remaining grid

- **WHEN** displaying Active Projects, Content Projects, Software Projects, and Completed metrics
- **THEN** each card spans 1 column (default span)
- **AND** cards appear in subsequent grid rows

### Requirement: Overview Display - Accessible Charts

The Business Center overview charts SHALL implement WCAG 2.2 AA accessibility standards with keyboard navigation and screen reader support.

#### Scenario: Charts support keyboard navigation

- **WHEN** user tabs to a chart component
- **THEN** chart receives focus with visible focus indicator (focus-visible:outline-ring)
- **AND** user can navigate data points using arrow keys via Recharts accessibilityLayer
- **AND** tooltips display on keyboard focus, not just mouse hover

#### Scenario: Charts respect reduced motion

- **WHEN** user has `prefers-reduced-motion: reduce` enabled
- **THEN** chart animations are disabled
- **AND** transitions are instant rather than animated
- **AND** all data remains visible and interactive

#### Scenario: Charts provide accessible descriptions

- **WHEN** screen reader encounters chart
- **THEN** chart has descriptive aria-label explaining the data visualization
- **AND** data point values are announced when focused

### Requirement: Overview Display - Semantic Color Tokens

The Business Center overview SHALL use semantic color tokens from globals.css for consistent theming across light and dark modes.

#### Scenario: Status indicators use semantic colors

- **WHEN** displaying team member availability status
- **THEN** available status uses `--success` token (text-success, bg-success/10)
- **AND** at_capacity status uses `--warning` token (text-warning, bg-warning/10)
- **AND** overloaded status uses `--error` token (text-error, bg-error/10)

#### Scenario: Charts use chart color tokens

- **WHEN** rendering multi-series chart data
- **THEN** series colors use `--chart-1` through `--chart-5` tokens
- **AND** colors maintain 4.5:1 contrast ratio against backgrounds
- **AND** colors adapt appropriately in dark mode

### Requirement: Overview Display - Loading States

The Business Center overview SHALL display loading skeleton states while data is being fetched.

#### Scenario: Skeleton displayed during load

- **WHEN** section data is loading
- **THEN** BentoCard displays animated Skeleton component matching card dimensions
- **AND** skeleton matches the card's expected content layout

#### Scenario: Error state displayed on failure

- **WHEN** section data fails to load
- **THEN** BentoCard displays Empty component with error variant
- **AND** retry action is provided to refetch data

### Requirement: Overview Display - Focus Management

The Business Center overview cards SHALL be keyboard accessible with clear focus indicators.

#### Scenario: Cards are focusable

- **WHEN** user tabs through the page
- **THEN** each BentoCard receives focus in logical order
- **AND** cards have `tabIndex={0}` for keyboard accessibility

#### Scenario: Focus indicator visible

- **WHEN** card receives keyboard focus
- **THEN** card displays visible outline using `focus-visible:outline-2 focus-visible:outline-ring`
- **AND** outline is visible in both light and dark modes
