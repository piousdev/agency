# Change: Add Versioning and Changelog System

## Why

The project currently lacks a standardized approach to versioning and changelog management. As we prepare for production deployment and potential future publishing of packages, we need:

- **Clear version tracking** - Know which version is deployed and what changed
- **Automated changelogs** - Generate human-readable changelogs from changes
- **Monorepo versioning** - Handle independent versioning for `@repo/web` and `@repo/api`
- **Release automation** - Streamline the release process with tooling
- **Industry standards** - Follow Turborepo and monorepo best practices

## What Changes

- Install and configure **Changesets** (official Turborepo recommendation)
- Set up changeset workflow for version management
- Configure automatic CHANGELOG.md generation
- Add versioning scripts to package.json
- Configure GitHub integration for better changelog context
- Document versioning workflow for contributors

## Impact

- **Affected specs**: New capability - `versioning`
- **Affected code**:
  - Root `package.json` - Add Changesets CLI and scripts
  - `.changeset/config.json` - Changesets configuration
  - `turbo.json` - Add version/publish pipeline tasks
  - New CHANGELOG.md files for each package
  - Documentation updates (README.md, CONTRIBUTING.md)

**Benefits**:

- Professional version management aligned with industry standards
- Clear communication of changes to users/stakeholders
- Preparation for npm package publishing (future)
- Better release coordination across API and Web packages
- Automated changelog generation saves time
