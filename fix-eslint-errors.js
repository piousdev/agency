const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const basePath = path.join(__dirname, 'apps/web/src/components/default');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Fix 1: Unused variables - prefix with _
  // Match: const { variable } = ...
  // This is complex, needs AST parsing - skip

  // Fix 2: Template literals with numbers
  // Wrap numeric expressions in String()
  // Pattern: ${expression} where expression is a number
  content = content.replace(/\$\{([^}]+\.(?:length|count|total|size|width|height|index))\}/g, '${String($1)}');
  content = content.replace(/\$\{(payload\.storyPoints)\}/g, '${String($1)}');

  // Fix 3: No unescaped entities - replace ' with {`'`} or &apos;
  // In JSX text context: don't -> don&apos;t
  // This needs context awareness - skip for auto

  // Fix 4: No non-null assertions - replace value! with proper checks
  // This is complex - skip

  // Fix 5: No unnecessary conditions
  // Skip - needs type info

  // Fix 6: Prefer nullish coalescing for specific patterns
  // data || [] -> data ?? []
  // data || {} -> data ?? {}
  content = content.replace(/\bdata\s*\|\|\s*\[\]/g, 'data ?? []');
  content = content.replace(/\bdata\s*\|\|\s*\{\}/g, 'data ?? {}');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

function walkDir(dir) {
  let count = 0;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      count += walkDir(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (fixFile(filePath)) {
        console.log('Fixed:', filePath);
        count++;
      }
    }
  }

  return count;
}

const fixed = walkDir(basePath);
console.log(`\nFixed ${fixed} files`);
