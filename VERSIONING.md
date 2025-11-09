# Versioning Guide

This project uses [Changesets](https://github.com/changesets/changesets) for version management and changelog generation, following industry-standard practices for monorepo versioning.

## Overview

**Changesets** is the official Turborepo recommendation for managing versions in monorepos. It provides:

- ✅ Independent versioning for each package (`@repo/web` and `@repo/api`)
- ✅ Automatic CHANGELOG.md generation
- ✅ GitHub integration (commit links, PR links, contributor attribution)
- ✅ Semantic versioning enforcement
- ✅ Simple, intuitive workflow

## Semantic Versioning

We follow [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes that require user action
- **MINOR** (1.0.0 → 1.1.0): New features that are backward-compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes and small improvements

## When to Create a Changeset

Create a changeset when your changes affect users or other developers:

### ✅ Create Changeset For:

- New features or functionality
- Bug fixes
- Breaking changes (API changes, schema changes)
- Performance improvements
- Dependency updates that affect behavior
- Changes to public APIs

### ❌ Skip Changeset For:

- Documentation updates (README, comments)
- Internal refactoring (no behavior change)
- Development tooling changes (ESLint, Prettier config)
- Tests (unless fixing a test that was incorrect)
- Configuration files that don't affect output

## Workflow

### 1. Make Your Changes

Develop your feature or bug fix as usual:

```bash
git checkout -b feature/my-new-feature
# Make your changes
pnpm dev
pnpm test
```

### 2. Create a Changeset

When your changes are ready, create a changeset:

```bash
pnpm changeset
```

This interactive command will ask:

1. **Which packages changed?** - Select `@repo/web`, `@repo/api`, or both
2. **What type of change?** - Choose major, minor, or patch
3. **Summary** - Write a brief description of your changes

Example interaction:

```
🦋  Which packages would you like to include?
◉ @repo/web
◉ @repo/api

🦋  Which packages should have a major bump?
◯ @repo/web
◯ @repo/api

🦋  Which packages should have a minor bump?
◉ @repo/web
◯ @repo/api

🦋  Which packages should have a patch bump?
◯ @repo/web
◉ @repo/api

🦋  Please enter a summary for this change:
Add user dashboard with analytics
Fix database connection timeout issue
```

This creates a new file in `.changeset/` with your changes.

### 3. Commit the Changeset

Commit the generated changeset file with your code changes:

```bash
git add .changeset/your-changeset-file.md
git add .
git commit -m "feat: add user dashboard"
git push origin feature/my-new-feature
```

### 4. Version Packages (Maintainers)

When ready to release (typically after merging to main), run:

```bash
pnpm changeset:version
```

This command:

- Consumes all changesets in `.changeset/`
- Updates `package.json` versions according to semver
- Updates `CHANGELOG.md` files with organized entries
- Deletes consumed changeset files

Review the changes:

```bash
git diff apps/web/package.json
git diff apps/web/CHANGELOG.md
git diff apps/api/package.json
git diff apps/api/CHANGELOG.md
```

### 5. Commit Version Updates

```bash
git add .
git commit -m "chore: version packages"
git push
```

### 6. Publish (Optional - Future)

When we're ready to publish to npm (future):

```bash
pnpm changeset:publish
git push --follow-tags
```

## Commands Reference

| Command                  | Description                    |
| ------------------------ | ------------------------------ |
| `pnpm changeset`         | Create a new changeset         |
| `pnpm changeset:version` | Update versions and CHANGELOGs |
| `pnpm changeset:status`  | View pending changesets        |
| `pnpm changeset:publish` | Publish to npm (future)        |

## Changeset File Format

Changesets are stored as markdown files in `.changeset/`:

```markdown
---
'@repo/web': minor
'@repo/api': patch
---

Add user dashboard with analytics and fix database connection timeout.

The dashboard now includes:

- Real-time analytics charts
- User activity tracking
- Performance metrics

Also fixes a timeout issue in the database connection pool.
```

## Examples

### Example 1: New Feature in Web App

```bash
# After building a new login page
pnpm changeset

# Select: @repo/web
# Bump: minor
# Summary: Add new login page with social auth
```

### Example 2: Bug Fix in API

```bash
# After fixing a database query
pnpm changeset

# Select: @repo/api
# Bump: patch
# Summary: Fix user query timeout in large datasets
```

### Example 3: Breaking Change

```bash
# After changing API endpoint structure
pnpm changeset

# Select: @repo/api, @repo/web
# Bump: major for @repo/api, major for @repo/web
# Summary: BREAKING: Restructure authentication endpoints
```

## GitHub Integration

Our configuration includes GitHub integration, which adds:

- **Commit links**: Direct links to commits in CHANGELOG
- **PR links**: Links to pull requests (when available)
- **Contributors**: Attribution to change authors

Example CHANGELOG entry with GitHub integration:

```markdown
### Minor Changes

- [#42](https://github.com/piousdev/agency/pull/42) [`abc1234`](https://github.com/piousdev/agency/commit/abc1234) Thanks [@username](https://github.com/username)! - Add user dashboard with analytics
```

To enable full GitHub integration locally (optional):

1. Create a GitHub Personal Access Token (Settings → Developer settings → Personal access tokens)
2. Add to `.env` (not committed):
   ```
   GITHUB_TOKEN=your_token_here
   ```

Note: This is only needed for local CHANGELOG generation. CI/CD can use `GITHUB_TOKEN` automatically.

## Best Practices

### 1. Write Clear Summaries

❌ Bad:

```
Fix stuff
Update code
Minor changes
```

✅ Good:

```
Fix user query timeout in large datasets
Add password reset functionality
BREAKING: Remove deprecated /v1/auth endpoint
```

### 2. Group Related Changes

If multiple changes are related, include them in one changeset summary:

```markdown
---
'@repo/web': minor
'@repo/api': minor
---

Add user profile editing feature

- Add profile edit form in web app
- Create PUT /api/users/:id endpoint
- Add validation for profile fields
- Update user schema in database
```

### 3. Mark Breaking Changes Clearly

Always prefix breaking changes with `BREAKING:`:

```markdown
---
'@repo/api': major
---

BREAKING: Remove deprecated authentication endpoints

The following endpoints have been removed:

- POST /v1/auth/login (use /api/auth/sign-in instead)
- POST /v1/auth/register (use /api/auth/sign-up instead)

Migration guide: Update all API calls to use the new /api/auth/\* endpoints.
```

### 4. Update Dependents

When changing `@repo/api`, consider if `@repo/web` needs updates:

```markdown
---
'@repo/api': minor
'@repo/web': patch
---

Add new user status field to API

API now returns a `status` field in user objects. Web app updated to display this information.
```

## FAQ

### Q: I forgot to create a changeset before merging. What do I do?

Create a changeset after merging:

```bash
git checkout main
git pull
pnpm changeset
git add .changeset
git commit -m "chore: add missing changeset"
git push
```

### Q: Can I edit a changeset after creating it?

Yes! Changesets are just markdown files in `.changeset/`. Edit them before running `pnpm changeset:version`.

### Q: Should I commit changeset files?

Yes! Always commit changeset files with your code changes. They're part of your PR.

### Q: How do I check what will be released?

```bash
pnpm changeset:status
```

This shows pending changesets and the version bumps they will cause.

### Q: Can I create an empty changeset?

Yes, for changes that don't warrant a version bump:

```bash
pnpm changeset --empty
```

### Q: What if I need to version packages together?

Edit `.changeset/config.json` and use the `linked` or `fixed` options. See [Changesets documentation](https://github.com/changesets/changesets/blob/main/docs/linked-packages.md) for details.

## Resources

- [Changesets GitHub Repository](https://github.com/changesets/changesets)
- [Changesets Documentation](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md)
- [Semantic Versioning 2.0.0](https://semver.org/)
- [Turborepo Versioning Guide](https://turbo.build/repo/docs/handbook/publishing-packages/versioning-and-publishing)

## Need Help?

If you're unsure whether to create a changeset or what bump type to use:

1. Check the examples above
2. Ask in your pull request - reviewers can help
3. When in doubt, create a changeset - it's better to have one than not

---

**Remember**: Changesets are about communicating changes to users and other developers. Write summaries that help people understand what changed and why it matters.
