#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const basePath = path.join(__dirname, 'apps/web/src/components/default');

// Get all TypeScript files
const files = glob.sync('**/*.{ts,tsx}', { cwd: basePath, absolute: true });

let totalFixes = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let fixes = 0;

  // Fix 1: || to ?? for nullish coalescing (but be careful - only for specific patterns)
  // Pattern: error ?? 'string' or value ?? defaultValue
  const beforeOr = content;
  content = content.replace(/(\berror\s*)\|\|\s*'/g, '$1?? \'');
  content = content.replace(/(\bresult\.error\s*)\|\|\s*'/g, '$1?? \'');
  content = content.replace(/(\bresult\.data\s*)\|\|\s*\{/g, '$1?? {');
  content = content.replace(/(\bdata\s*)\|\|\s*\[\]/g, '$1?? []');
  content = content.replace(/(\bdata\s*)\|\|\s*\{/g, '$1?? {');

  // But we need to revert certain cases where || is correct
  // Restore for boolean checks, non-null defaults, etc.
  content = content.replace(/(\?\?\s*')/g, '|| \'');  // Revert simple string defaults

  // Fix 2: Template literal with numbers - wrap with String()
  content = content.replace(/\$\{([^}]*?\.length)\}/g, '${String($1)}');
  content = content.replace(/\$\{(count|total|[a-z]+Count|[a-z]+Total)\}/g, '${String($1)}');
  content = content.replace(/\$\{([a-z]+\.(id|index|size|width|height|count))\}/g, '${String($1)}');

  // Fix 3: Remove unnecessary ?.  (THIS IS COMPLEX - skip for now)

  // Fix 4: Remove unused vars or prefix with _
  // This requires AST parsing - skip for script

  // Fix 5: Replace value! with proper checks (also complex - skip)

  if (content !== beforeOr) {
    fixes++;
    fs.writeFileSync(file, content);
    console.log(`Fixed ${path.relative(basePath, file)}`);
  }
});

console.log(`\nTotal files processed: ${files.length}`);
console.log(`Total fixes applied: ${totalFixes}`);
