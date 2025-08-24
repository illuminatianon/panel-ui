# Semantic Release Strategy (Monorepo)

**Packages**

* **`packages/panel-ui`** — the publishable library (to npm)
* **`packages/demo-app`** — the test rig (not published)

This document describes how to use **`semantic-release-monorepo`** to publish **only `panel-ui`** while leaving `demo-app` out of npm.

---

## Goals

* Fully automated releases for `panel-ui` using Conventional Commits.
* Monorepo-aware commit filtering (only changes that touch `packages/panel-ui/**` influence `panel-ui`’s version).
* Clear, namespaced tags (e.g., `panel-ui-v1.2.3`).
* Keep `demo-app` private and never published to npm.

## Non‑Goals

* Coordinated multi-package publishing (we only publish `panel-ui`).
* Cross-package dependency bumping (not needed for two independent packages).

---

## Repo Layout

```
.
├─ package.json           # workspaces + dev deps
├─ pnpm-workspace.yaml    # or Yarn workspaces
└─ packages/
   ├─ panel-ui/
   │  ├─ package.json
   │  ├─ .releaserc.json
   │  └─ ... (src, dist, etc.)
   └─ demo-app/
      ├─ package.json ("private": true)
      └─ ...
```

> **Note:** If you prefer a single root `.releaserc`, you can, but this guide keeps config **scoped to the package** that publishes (`packages/panel-ui/.releaserc.json`) for clarity.

---

## Why `semantic-release-monorepo`

`semantic-release` by default considers **all commits since the last tag**. The `semantic-release-monorepo` preset assigns commits to a package **based on files touched**, then it **namespaces git tags** per package (default: `<package>-v<version>`). This is exactly what we want for `panel-ui` in a shared repo.

---

## Root configuration

### `package.json`

```jsonc
{
  "name": "panel-ui-monorepo",
  "private": true,
  "workspaces": ["packages/*"], // Yarn classic; for pnpm use pnpm-workspace.yaml
  "devDependencies": {
    "semantic-release": "^23",
    "semantic-release-monorepo": "^8",
    "@semantic-release/changelog": "^6",
    "@semantic-release/commit-analyzer": "^13",
    "@semantic-release/git": "^12",
    "@semantic-release/github": "^10",
    "@semantic-release/npm": "^12",
    "@semantic-release/release-notes-generator": "^12"
  },
  "scripts": {
    // Run releases for panel-ui only
    "release:panel-ui": "pnpm -F panel-ui exec -- npx --no-install semantic-release -e semantic-release-monorepo",
    "release:panel-ui:dry": "pnpm -F panel-ui exec -- npx --no-install semantic-release -e semantic-release-monorepo --dry-run"
  }
}
```

### `pnpm-workspace.yaml` (if using pnpm)

```yaml
packages:
  - "packages/*"
```

> **Yarn alternative:** `yarn workspace panel-ui semantic-release -e semantic-release-monorepo` (replace the `pnpm` script with a Yarn workspace command).

---

## `packages/panel-ui` configuration

### `packages/panel-ui/package.json`

```jsonc
{
  "name": "panel-ui", // or your scoped name e.g., "@everbearing/panel-ui"
  "version": "0.0.0-development", // semantic-release manages the real version
  "private": false,
  "main": "dist/index.cjs",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "tsc -p tsconfig.build.json && vite build" // example; ensure dist exists before release
  },
  "publishConfig": {
    // add registry if you need a custom one, otherwise omit
    // "registry": "https://registry.npmjs.org"
  }
}
```

### `packages/panel-ui/.releaserc.json`

```json
{
  "extends": "semantic-release-monorepo",
  // Optional: explicit tag pattern (default is <pkg>-v<version>)
  "tagFormat": "panel-ui-v${version}",
  "plugins": [
    ["@semantic-release/commit-analyzer", { "preset": "conventionalcommits" }],
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", { "changelogFile": "CHANGELOG.md" }],
    ["@semantic-release/npm", { "pkgRoot": "." }],
    ["@semantic-release/git", {
      "assets": ["CHANGELOG.md", "package.json"],
      "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }],
    "@semantic-release/github"
  ]
}
```

**Notes**

* We **run semantic-release from the package directory** (via the workspace filter), so `pkgRoot` is `"."`.
* If you instead run semantic-release from the repo root, set `pkgRoot` to `"packages/panel-ui"` in the npm plugin.
* The build should run **before** release; ensure your CI job runs `pnpm -F panel-ui build` prior to `semantic-release`.

---

## `packages/demo-app` configuration (do not publish)

### `packages/demo-app/package.json`

```jsonc
{
  "name": "demo-app",
  "private": true,         // prevents accidental npm publish
  "version": "0.0.0-development",
  "scripts": { "start": "vite" }
}
```

**We do not execute semantic-release in this package.**

* Keep no `.releaserc` in `demo-app`, and
* Ensure CI runs release **only** for `panel-ui` (see workflow below).

If you still want GitHub releases/tags for demo (rare), add a minimal `.releaserc.json` **without** the npm plugin or with `{ "npmPublish": false }`, but the default/recommended approach is **no release** for demo.

---

## GitHub Actions workflow

Create `.github/workflows/release.yml`:

```yaml
name: Release panel-ui

on:
  push:
    branches: [main]
    paths:
      - 'packages/panel-ui/**'
      - '.github/workflows/release.yml'
      - 'packages/panel-ui/.releaserc.json'
      - 'packages/panel-ui/package.json'

permissions:
  contents: write
  packages: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # semantic-release needs full history

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'

      - name: Install
        run: pnpm i --frozen-lockfile

      - name: Build panel-ui
        run: pnpm -F panel-ui build

      - name: Release panel-ui
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: pnpm -F panel-ui exec -- npx --no-install semantic-release -e semantic-release-monorepo
```

### Why the path filter?

It prevents demo-only changes from triggering a release job. If a single PR touches both `panel-ui` and `demo-app`, the job still runs—but commit filtering (by files touched) ensures only `panel-ui` changes determine the version.

---

## Commit Conventions

Use **Conventional Commits** in the repo. Examples:

* `feat(panel): add split ratio snapping` → **minor**
* `fix(workspace): null active pane guard` → **patch**
* `feat!: remove deprecated maximize scope` → **major**

You don’t need special scopes such as `demo:`—monorepo mode filters by **paths** automatically.

---

## Verification & Dry Runs

* Local dry-run (no tags/publish):

  ```bash
  pnpm -F panel-ui exec -- npx --no-install semantic-release -e semantic-release-monorepo --dry-run
  ```
* Check that the log shows `panel-ui-vX.Y.Z` tag computation, generated notes, and `@semantic-release/npm` preparing/publishing.

---

## Tagging & Release Notes

* Tags are namespaced per package. Default is `<package>-v<version>`; we set `tagFormat` to `panel-ui-v${version}` for clarity.
* Release notes are generated from commits that **touched** `packages/panel-ui/**`.

---

## Publishing from a subdirectory / build output

* When run **inside** `packages/panel-ui`, `@semantic-release/npm` publishes from the current directory. Ensure `dist/` exists and `files` in `package.json` includes built artifacts.
* If you run semrel from the **repo root**, set `pkgRoot: "packages/panel-ui"` in the npm plugin to publish the package in that subfolder.

---

## Common Pitfalls & Safeguards

* **Missing full git history**: set `fetch-depth: 0` in Actions checkout.
* **Accidental demo publish**: `"private": true` in `demo-app/package.json`, and never run semrel there.
* **No changes detected**: monorepo mode will skip release if no `packages/panel-ui/**` files changed since the last `panel-ui-v*` tag.
* **Registry auth**: set `NPM_TOKEN` secret; Node setup step sets registry URL.

---

## Alternatives (FYI)

* **multi-semantic-release** can orchestrate many packages at once and update local dep ranges, but for a two-package setup we don’t need the extra complexity. This doc stays focused on `semantic-release-monorepo`.

---

## Checklist

* [ ] `demo-app/package.json` has `"private": true`.
* [ ] `packages/panel-ui/.releaserc.json` exists and extends `semantic-release-monorepo`.
* [ ] CI workflow runs `release:panel-ui` only.
* [ ] `NPM_TOKEN` and `GITHUB_TOKEN` secrets configured.
* [ ] `panel-ui` build step produces `dist/` before release.

---

## Quick Start

```bash
# install deps in root
pnpm add -D semantic-release semantic-release-monorepo @semantic-release/{changelog,commit-analyzer,git,github,npm,release-notes-generator}

# dry run (no tags, no publish)
pnpm run release:panel-ui:dry

# real release (on CI)
pnpm run release:panel-ui
```
