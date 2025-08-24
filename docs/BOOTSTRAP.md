# Panel-UI Bootstrap Guide

> Step-by-step instructions to get the Panel-UI monorepo up and running from scratch.

**Check off tasks as you complete them** ✅

---

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] pnpm installed globally (`npm install -g pnpm`)
- [ ] Git repository initialized
- [ ] Code editor with TypeScript support (VS Code recommended)

---

## Phase 1: Monorepo Structure

### 1.1 Root Configuration

- [ ] Create `pnpm-workspace.yaml`:
```yaml
packages:
  - "packages/*"
```

- [ ] Create root `package.json`:
```json
{
  "name": "panel-ui-monorepo",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "pnpm --filter demo-app dev",
    "build": "pnpm --filter panel-ui build",
    "build:demo": "pnpm --filter demo-app build",
    "test": "pnpm --filter panel-ui test",
    "lint": "pnpm --recursive lint",
    "type-check": "pnpm --recursive type-check",
    "release:panel-ui": "pnpm -F panel-ui exec -- npx --no-install semantic-release -e semantic-release-monorepo",
    "release:panel-ui:dry": "pnpm -F panel-ui exec -- npx --no-install semantic-release -e semantic-release-monorepo --dry-run"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "semantic-release": "^23",
    "semantic-release-monorepo": "^8",
    "@semantic-release/changelog": "^6",
    "@semantic-release/commit-analyzer": "^13",
    "@semantic-release/git": "^12",
    "@semantic-release/github": "^10",
    "@semantic-release/npm": "^12",
    "@semantic-release/release-notes-generator": "^12"
  }
}
```

- [ ] Create `packages/` directory

### 1.2 Directory Structure

- [ ] Create directory structure:
```
packages/
├── panel-ui/
│   ├── src/
│   │   ├── workspace/
│   │   ├── components/
│   │   ├── persistence/
│   │   ├── bridge/
│   │   └── types/
│   └── tests/
└── demo-app/
    ├── src/
    │   └── components/
    └── public/
```

---

## Phase 2: Core Library Setup

### 2.1 Panel-UI Package Configuration

- [ ] Create `packages/panel-ui/package.json`:
```json
{
  "name": "panel-ui",
  "version": "0.0.0-development",
  "type": "module",
  "private": false,
  "main": "./dist/index.cjs",
  "module": "./dist/index.esm.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsc -p tsconfig.build.json && vite build",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.vue",
    "test": "vitest"
  },
  "peerDependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "vue": "^3.4.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "vite": "^5.0.0",
    "@vue/tsconfig": "^0.5.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0"
  }
}
```

### 2.2 TypeScript Configuration

- [ ] Create `packages/panel-ui/tsconfig.json`:
```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"],
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmitOnError": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

- [ ] Create `packages/panel-ui/tsconfig.build.json`:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist"
  },
  "include": ["src/**/*"],
  "exclude": ["**/*.test.*", "**/*.spec.*"]
}
```

### 2.3 Build Configuration

- [ ] Create `packages/panel-ui/vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PanelUI',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm.js' : 'cjs'}`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
```

### 2.4 Semantic Release Configuration

- [ ] Create `packages/panel-ui/.releaserc.json`:
```json
{
  "extends": "semantic-release-monorepo",
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

---

## Phase 3: Demo App Setup

### 3.1 Demo App Configuration

- [ ] Create `packages/demo-app/package.json`:
```json
{
  "name": "demo-app",
  "private": true,
  "version": "0.0.0-development",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit"
  },
  "dependencies": {
    "panel-ui": "workspace:*",
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.0"
  }
}
```

### 3.2 Demo App Build Configuration

- [ ] Create `packages/demo-app/vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Use source during development
      'panel-ui': '../panel-ui/src'
    }
  }
})
```

### 3.3 Demo App TypeScript Configuration

- [ ] Create `packages/demo-app/tsconfig.json`:
```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["src/**/*"],
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  }
}
```

---

## Phase 4: Initial Implementation

### 4.1 Core Library Skeleton

- [ ] Create `packages/panel-ui/src/index.ts`:
```ts
// Main exports
export { createWorkspace } from './workspace/createWorkspace'
export type { WorkspaceConfig, WorkspaceInstance } from './workspace/types'

// Persistence exports
export { createInMemoryPersistence, createLocalStoragePersistence } from './persistence'
export type { PersistencePlugin } from './persistence/types'

// Bridge exports
export { vuetisticBridge, fallbackBridge } from './bridge'
export type { PanelUiPrimitives } from './bridge/types'

// Type exports
export type { LayoutNode, PanelConfig } from './types'
```

- [ ] Create basic type definitions in `packages/panel-ui/src/types/index.ts`
- [ ] Create workspace factory stub in `packages/panel-ui/src/workspace/createWorkspace.ts`
- [ ] Create persistence plugin stubs in `packages/panel-ui/src/persistence/`
- [ ] Create bridge stubs in `packages/panel-ui/src/bridge/`

### 4.2 Demo App Skeleton

- [ ] Create `packages/demo-app/index.html`
- [ ] Create `packages/demo-app/src/main.ts`
- [ ] Create `packages/demo-app/src/App.vue`

---

## Phase 5: Installation & Verification

### 5.1 Install Dependencies

- [ ] Run `pnpm install` from root directory
- [ ] Verify all packages installed correctly
- [ ] Check workspace links: `pnpm list --depth=0`

### 5.2 Verification Tests

- [ ] Type check: `pnpm type-check`
- [ ] Build library: `pnpm build` (should create `packages/panel-ui/dist/`)
- [ ] Start demo: `pnpm dev` (should start Vite dev server)
- [ ] Test semantic release (dry run): `pnpm release:panel-ui:dry`

---

## Phase 6: Git & CI Setup

### 6.1 Git Configuration

- [ ] Create `.gitignore`:
```
node_modules/
dist/
.DS_Store
*.log
.env
.vscode/settings.json
```

- [ ] Initial commit with conventional commit message:
```bash
git add .
git commit -m "feat: initial project setup with monorepo structure"
```

### 6.2 GitHub Actions (Optional)

- [ ] Create `.github/workflows/release.yml` (see semantic_release_strategy.md)
- [ ] Set up `NPM_TOKEN` secret in GitHub repository settings
- [ ] Test CI pipeline

---

## Completion Checklist

- [ ] All packages install without errors
- [ ] TypeScript compilation works
- [ ] Demo app starts and loads panel-ui
- [ ] Semantic release dry run succeeds
- [ ] Git repository is properly configured
- [ ] Documentation is up to date

**🎉 Bootstrap Complete!** 

Next steps: Start implementing the core workspace functionality according to the main design document.
