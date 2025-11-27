#!/usr/bin/env tsx
/**
 * Create Changelog Entry Script
 *
 * Generates a new dated changelog MDX file based on package.json version.
 *
 * Usage:
 *   pnpm changelog:create                    # Use current package.json version
 *   pnpm changelog:create --version 0.2.0    # Specify version
 *   pnpm changelog:create --name "Beta"      # Specify release name
 *   pnpm changelog:create --date 2025-11-15  # Specify date (YYYY-MM-DD)
 *
 * Examples:
 *   pnpm changelog:create --version 0.2.0 --name "Beta Release"
 *   pnpm changelog:create --name "Performance Update"
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

// Parse command line arguments
const { values } = parseArgs({
  options: {
    version: { type: 'string' },
    name: { type: 'string' },
    date: { type: 'string' },
    help: { type: 'boolean', short: 'h' },
  },
});

if (values.help) {
  console.log(`
Create Changelog Entry

Generates a new dated changelog MDX file based on package.json version.

Usage:
  pnpm changelog:create [options]

Options:
  --version <version>   Version number (e.g., 0.2.0)
  --name <name>         Release name (e.g., "Beta Release")
  --date <YYYY-MM-DD>   Release date (defaults to today)
  -h, --help            Show this help message

Examples:
  pnpm changelog:create
  pnpm changelog:create --version 0.2.0 --name "Beta Release"
  pnpm changelog:create --name "Performance Update"
  `);
  process.exit(0);
}

// Import the changelog utilities
// Note: This uses dynamic import because we're in a script context
async function main() {
  const { createChangelogEntry, getCurrentDateSlug } = await import('../src/lib/changelog.js');

  // Get version from package.json if not specified
  let version = values.version;
  if (!version) {
    try {
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { version?: string };
      version = packageJson.version;

      if (!version) {
        console.error('❌ No version found in package.json');
        process.exit(1);
      }

      console.log(`📦 Using version from package.json: ${version}`);
    } catch (error) {
      console.error('❌ Error reading package.json:', error);
      process.exit(1);
    }
  }

  // Parse release name
  const releaseName = values.name ?? 'Release';

  // Parse date
  let date: Date;
  if (values.date) {
    date = new Date(values.date);
    if (Number.isNaN(date.getTime())) {
      console.error('❌ Invalid date format. Use YYYY-MM-DD');
      process.exit(1);
    }
  } else {
    date = new Date();
  }

  const isoString = date.toISOString();
  const dateString = isoString.substring(0, isoString.indexOf('T'));

  console.log('\n📝 Creating changelog entry...\n');
  console.log(`  Version:      ${version}`);
  console.log(`  Release Name: ${releaseName}`);
  console.log(`  Date:         ${dateString}`);
  console.log(`  Date Slug:    ${getCurrentDateSlug()}\n`);

  // Create the changelog entry
  const result = createChangelogEntry({
    version,
    releaseName,
    date,
  });

  if (!result.success) {
    console.error(`❌ Error: ${result.error ?? 'Unknown error'}`);
    process.exit(1);
  }

  console.log(`✅ Changelog created successfully!`);
  console.log(`📁 Location: content/changelog/${result.dateSlug}/index.mdx`);
  console.log(`🔗 URL: /dashboard/changelog/${result.dateSlug}\n`);
  console.log(`Next steps:`);
  console.log(`  1. Edit the changelog file to add release details`);
  console.log(`  2. Commit the changes to version control`);
  console.log(`  3. View it at /dashboard/changelog in your app\n`);
}

main().catch((error: unknown) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
