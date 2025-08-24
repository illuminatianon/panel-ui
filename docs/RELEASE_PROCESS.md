# Release Process

This document describes the automated release process for the `panel-ui` package using semantic-release and conventional commits.

## Overview

The Panel-UI project uses **fully automated releases** with:
- **Conventional Commits** for version determination
- **Semantic Release** for automated publishing
- **Monorepo-aware** filtering (only `panel-ui` changes trigger releases)
- **GitHub Actions** for CI/CD automation

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/) to determine version bumps automatically.

### Commit Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type | Description | Version Bump |
|------|-------------|--------------|
| `feat` | New feature | **Minor** (0.1.0) |
| `fix` | Bug fix | **Patch** (0.0.1) |
| `docs` | Documentation only | **None** |
| `style` | Code style changes | **None** |
| `refactor` | Code refactoring | **None** |
| `perf` | Performance improvements | **Patch** (0.0.1) |
| `test` | Adding tests | **None** |
| `chore` | Maintenance tasks | **None** |

### Breaking Changes

Add `!` after the type or include `BREAKING CHANGE:` in the footer for **Major** version bumps:

```bash
feat!: remove deprecated maximize API
# or
feat: add new workspace API

BREAKING CHANGE: The maximize method has been removed. Use the new focus API instead.
```

### Examples

```bash
# Patch release (0.0.1)
fix: resolve panel focus issue when switching tabs
fix(workspace): handle null active pane guard

# Minor release (0.1.0)
feat: add split ratio snapping
feat(persistence): add IndexedDB storage plugin

# Major release (1.0.0)
feat!: remove deprecated maximize scope
feat: redesign workspace API

BREAKING CHANGE: The workspace API has been completely redesigned.
```

## Release Workflow

### Automatic Releases

1. **Make changes** to `packages/panel-ui/**`
2. **Commit with conventional format**
3. **Push to main branch** (or merge PR)
4. **GitHub Actions triggers** automatically
5. **Semantic release analyzes** commits since last release
6. **Version is determined** based on commit types
7. **Package is built and published** to npm
8. **GitHub release is created** with changelog
9. **Git tag is created** (format: `panel-ui-v1.2.3`)

### Manual Testing (Dry Run)

Test the release process locally without publishing:

```bash
# Test what version would be released
pnpm release:panel-ui:dry
```

This will:
- Analyze commits since last release
- Show what version would be published
- Generate changelog preview
- **Not publish** to npm or create tags

## Monorepo Behavior

### Path Filtering

Only changes to these paths trigger releases:
- `packages/panel-ui/**` - Core library changes
- `.github/workflows/release.yml` - Workflow changes
- `packages/panel-ui/.releaserc.json` - Release config changes
- `packages/panel-ui/package.json` - Package config changes

### Commit Filtering

Semantic release automatically filters commits by files touched:
- Only commits that modify `packages/panel-ui/**` affect versioning
- Changes to `packages/demo-app/**` are ignored for releases
- Mixed commits (touching both packages) still work correctly

### Example Scenarios

| Commit | Files Changed | Release Triggered? |
|--------|---------------|-------------------|
| `feat: add new panel type` | `packages/panel-ui/src/` | ✅ Yes |
| `docs: update demo examples` | `packages/demo-app/src/` | ❌ No |
| `fix: resolve build issue` | Both packages | ✅ Yes (panel-ui changes count) |

## Release Artifacts

Each release creates:

1. **npm Package**: Published to [npmjs.com](https://www.npmjs.com/package/panel-ui)
2. **GitHub Release**: With auto-generated changelog
3. **Git Tag**: Format `panel-ui-v1.2.3`
4. **Changelog**: Updated `packages/panel-ui/CHANGELOG.md`

## Version Management

- **Current version**: Always `0.0.0-development` in `package.json`
- **Actual version**: Managed by semantic-release
- **Git tags**: Namespaced per package (`panel-ui-v1.2.3`)
- **npm version**: Automatically updated during release

## Troubleshooting

### No Release Triggered

**Possible causes:**
- No conventional commits since last release
- Only non-release commit types (`docs`, `chore`, etc.)
- No changes to `packages/panel-ui/**`
- Workflow path filters not matched

**Solution:** Check commit history and ensure conventional format

### Release Failed

**Common issues:**
1. **NPM_TOKEN expired**: Update GitHub secret
2. **Build failed**: Fix TypeScript/build errors
3. **Tests failed**: Fix failing tests
4. **Duplicate version**: Usually resolves automatically

### Skip CI

Add `[skip ci]` to commit message to skip the entire workflow:

```bash
git commit -m "docs: update README [skip ci]"
```

## Best Practices

### Commit Messages

- **Be descriptive**: Explain what changed and why
- **Use present tense**: "add feature" not "added feature"
- **Include scope**: `feat(workspace): add split panels`
- **Reference issues**: `fix: resolve panel focus (#123)`

### Pull Requests

- **Squash commits** with conventional format
- **Include breaking changes** in PR description
- **Test locally** before merging
- **Review changelog** impact

### Release Timing

- **Releases are immediate** after merge to main
- **No manual intervention** required
- **Hotfixes** can be released immediately
- **Features** accumulate until next release

## Related Documentation

- [NPM Token Setup](./NPM_TOKEN_SETUP.md) - Configure npm publishing
- [Semantic Release Strategy](./semantic_release_strategy.md) - Technical details
- [Bootstrap Guide](./BOOTSTRAP.md) - Initial setup

## Quick Reference

```bash
# Local development
pnpm dev                    # Start demo app
pnpm build                  # Build library
pnpm type-check            # Type checking

# Release testing
pnpm release:panel-ui:dry  # Test release (no publish)

# Commit examples
git commit -m "feat: add new workspace API"
git commit -m "fix: resolve panel focus issue"
git commit -m "feat!: remove deprecated methods"
```
