# ESLint Fix Report for /apps/web/src/components/default/

## Summary

- **Initial Errors**: 207
- **Current Errors**: 166
- **Errors Fixed**: 41 (19.8% reduction)
- **Warnings**: 101 (unchanged, as per requirements)

## Fixes Applied

### 1. Nullish Coalescing (`??` vs `||`)

- Fixed `result.error || 'message'` → `result.error ?? 'message'` (when
  appropriate)
- Fixed `optional?.property || default` → `optional?.property ?? default`
- Fixed patterns like `pm?.name || 'PM'` → `pm?.name ?? 'PM'`

### 2. Template Literal Type Expressions

- Wrapped numeric values with `String()` in template literals
- Fixed patterns like `${count}` → `${String(count)}`
- Fixed `${length}`, `${index}`, `${size}` patterns

### 3. Unused Variables

- Prefixed unused destructured variables with `_`
- Example: `{ lastEventTimestamp }` →
  `{ lastEventTimestamp: _lastEventTimestamp }`

### 4. Unnecessary Conditions

- Fixed `if (!value)` when value is always truthy
- Fixed unnecessary optional chaining patterns
- Changed comparisons from falsy checks to explicit checks

### 5. Default Props with Array Literals

- Created const references for default empty arrays
- Example: `availablePMs = []` → `availablePMs = EMPTY_PM_ARRAY`

### 6. Other Fixes

- Removed unused imports (e.g., `CardDescription`)
- Fixed async functions without await expressions
- Fixed unnecessary type conditionals

## Remaining Errors (166)

Top error categories still requiring fixes:

1. **restrict-template-expressions** (43): Number/any types in template literals
2. **no-unnecessary-condition** (29): Redundant type checks
3. **prefer-nullish-coalescing** (20): More `||` → `??` conversions needed
4. **no-unused-vars** (19): Variables that need prefixing or removal
5. **no-unescaped-entities** (8): JSX entities needing escaping
6. **no-unstable-nested-components** (7): Components defined during render
7. **react-hooks/static-components** (5): Hook dependencies issues
8. **no-non-null-assertion** (5): Non-null assertions (!)

## Files with Most Remaining Errors

1. `table-view.tsx` - 13 errors
2. `intake-pipeline-widget.tsx` - 9 errors
3. `request-card.tsx` - 8 errors
4. `request-form-client.tsx` - 7 errors
5. `swipeable-card.tsx` - 6 errors

## Notes

- All security warnings were left untouched (as requested)
- No eslint-disable comments were added (as requested)
- All fixes follow TypeScript strict mode requirements
- Proper type safety maintained throughout
