# Testing Configuration

## ADDED Requirements

### Requirement: Separate Test Runners

The system SHALL maintain separate test runners for unit tests and E2E tests to
prevent conflicts and ensure proper test execution.

#### Scenario: Unit tests run independently

- **WHEN** developer runs `pnpm test` command
- **THEN** only Vitest unit tests execute
- **AND** Playwright E2E tests are excluded
- **AND** all unit tests pass without E2E test interference

#### Scenario: E2E tests run independently

- **WHEN** developer runs `pnpm test:e2e` command
- **THEN** only Playwright E2E tests execute
- **AND** Vitest unit tests are not included
- **AND** tests run in proper browser environment

### Requirement: Mock External Services in Tests

The system SHALL provide mocks for external services (SMTP, third-party APIs) to
enable reliable integration testing without external dependencies.

#### Scenario: SMTP mock in API tests

- **WHEN** integration tests require email sending
- **THEN** mock SMTP transport is used instead of real SMTP server
- **AND** tests can verify email content without actual sending
- **AND** tests do not fail due to missing SMTP credentials

#### Scenario: Test environment isolation

- **WHEN** tests are executed
- **THEN** test environment uses `.env.test` configuration
- **AND** production credentials are never exposed
- **AND** tests are repeatable and deterministic
