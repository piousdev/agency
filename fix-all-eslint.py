#!/usr/bin/env python3

import os
import re
import json
import subprocess
from pathlib import Path

base_path = Path("apps/web/src/components/default")
files_fixed = 0
total_fixes = 0

def fix_file(filepath):
    global total_fixes
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    fixes = 0

    # Fix 1: Template literals with numbers - wrap numeric values with String()
    # Match ${number} or ${object.number} patterns but NOT strings
    def fix_template_number(match):
        expr = match.group(1)
        # Skip if already wrapped with String()
        if 'String(' in expr:
            return match.group(0)
        # Check common number patterns
        if any(keyword in expr for keyword in ['length', 'count', 'total', 'size', 'width', 'height', 'index']):
            if '.' in expr:  # property access
                return '${String(' + expr + ')}'
        # Check for standalone number variables
        if expr in ['count', 'total', 'index', 'size', 'width', 'height']:
            return '${String(' + expr + ')}'
        return match.group(0)

    # This is complex, skip for now

    # Fix 2: Unused vars - prefix with _
    # Pattern: variable declarations that are unused
    # This requires AST - skip

    # Fix 3: prefer-nullish-coalescing - || to ?? for specific cases
    # Only for: optional?.property || defaultValue patterns
    content = re.sub(r'(\w+\?\.\w+)\s*\|\|\s*', r'\1 ?? ', content)

    # Fix 4: no-unescaped-entities - fix quotes in JSX
    # ' -> &apos; or " -> &quot; or use {''}
    # Skip - needs context

    # Fix 5: no-unnecessary-condition
    # Skip - needs type info

    if content != original:
        fixes += 1
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

# Find all TypeScript files
for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            filepath = os.path.join(root, file)
            if fix_file(filepath):
                files_fixed += 1
                print(f"Fixed: {filepath}")

print(f"\nFixed {files_fixed} files")
