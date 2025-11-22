## ADDED Requirements

### Requirement: Changesets Installation

The system SHALL have the Changesets CLI installed and configured to enable version management and changelog generation.

#### Scenario: Changesets initialized

- **WHEN** a developer runs `pnpm install`
- **THEN** @changesets/cli is available as a dev dependency
- **AND** the `.changeset` directory exists with valid config.json
- **AND** changeset commands are accessible via pnpm scripts

### Requirement: Version Management Workflow

The system SHALL provide a standardized workflow for creating changesets, versioning packages, and publishing releases.

#### Scenario: Developer creates a changeset

- **WHEN** a developer completes a feature or bug fix
- **AND** runs `pnpm changeset`
- **THEN** the CLI prompts for affected packages
- **AND** the CLI prompts for version bump type (major/minor/patch)
- **AND** the CLI prompts for a change summary
- **AND** a new changeset file is created in `.changeset/`

#### Scenario: Version bump is applied

- **WHEN** a developer runs `pnpm changeset:version`
- **THEN** all package.json files are updated with new versions
- **AND** CHANGELOG.md files are updated with change summaries
- **AND** consumed changeset files are deleted
- **AND** changes follow semantic versioning rules

### Requirement: Changelog Generation

The system SHALL automatically generate and maintain CHANGELOG.md files for all versioned packages.

#### Scenario: Changelog created for package

- **WHEN** `pnpm changeset:version` is executed
- **AND** a package has pending changesets
- **THEN** the package's CHANGELOG.md is created or updated
- **AND** the changelog includes version number, date, and changes
- **AND** changes are categorized by type (major/minor/patch)
- **AND** each change includes the summary from its changeset

#### Scenario: Changelog includes GitHub context

- **WHEN** GitHub changelog generator is configured
- **AND** GITHUB_TOKEN is available
- **THEN** changelog entries include commit links
- **AND** changelog entries include PR links (if available)
- **AND** changelog entries include contributor attribution

### Requirement: Monorepo Version Independence

The system SHALL support independent versioning for each package in the monorepo.

#### Scenario: Packages versioned independently

- **WHEN** only `@repo/web` has changes
- **AND** `pnpm changeset:version` is run
- **THEN** only `@repo/web` version is bumped
- **AND** `@repo/api` version remains unchanged
- **AND** only `@repo/web` CHANGELOG.md is updated

#### Scenario: Internal dependency version updated

- **WHEN** a shared package version is bumped
- **AND** other packages depend on it
- **THEN** dependent packages have their dependencies updated
- **AND** dependent packages receive a patch version bump
- **AND** the update is reflected in their CHANGELOG.md

### Requirement: Version Status Checking

The system SHALL provide commands to check the status of pending changesets and version changes.

#### Scenario: Status check shows pending changes

- **WHEN** a developer runs `pnpm changeset:status`
- **THEN** the CLI displays all packages with pending changesets
- **AND** the CLI shows the intended version bump for each package
- **AND** the CLI lists all changeset files to be consumed

#### Scenario: Status check in CI

- **WHEN** `pnpm changeset:status --since=main` is run in CI
- **AND** changes exist without changesets
- **THEN** the command exits with non-zero status code
- **AND** CI build fails to enforce changeset creation

### Requirement: Configuration Management

The system SHALL maintain versioning configuration in `.changeset/config.json` with appropriate defaults for the project.

#### Scenario: Configuration is valid

- **WHEN** `.changeset/config.json` exists
- **THEN** it specifies `baseBranch` as "main"
- **AND** it specifies `access` as "restricted"
- **AND** it specifies `updateInternalDependencies` as "patch"
- **AND** it specifies changelog generator (default or GitHub)
- **AND** it has empty `fixed` and `linked` arrays (independent versioning)

### Requirement: Documentation

The system SHALL provide clear documentation for the versioning workflow and conventions.

#### Scenario: Versioning guide exists

- **WHEN** a developer needs to understand versioning
- **THEN** VERSIONING.md exists in the project root
- **AND** the guide explains when to create changesets
- **AND** the guide explains version bump types (major/minor/patch)
- **AND** the guide explains the changeset workflow
- **AND** the guide includes example commands

#### Scenario: README includes versioning

- **WHEN** a developer reads the main README.md
- **THEN** it includes a section on versioning
- **AND** it references VERSIONING.md for details
- **AND** it lists the main changeset commands
