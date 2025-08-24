# Panel-UI — Project Structure

> Monorepo structure using **pnpm workspaces** with minimal tooling and local development integration.

---

## Overview

Panel-UI uses a monorepo structure to facilitate development and testing:

- **`panel-ui/`**: Core npm package (the library)
- **`demo-app/`**: Integration testing and demonstration app
- **`docs/`**: Documentation and design documents

---

## Monorepo Structure

```
panel-ui/                     # Repository root
├── pnpm-workspace.yaml       # pnpm workspace configuration
├── package.json              # Root package.json (workspace management)
├── docs/                     # Documentation
│   ├── main_design_document.md
│   └── project_structure.md
├── packages/
│   ├── panel-ui/             # Core library package
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts      # Main export
│   │   │   ├── workspace/    # Workspace management
│   │   │   ├── components/   # Vue components
│   │   │   ├── persistence/  # Persistence plugins
│   │   │   └── types/        # TypeScript definitions
│   │   ├── dist/             # Built output (if needed)
│   │   └── README.md
│   └── demo-app/             # Demo application
│       ├── package.json
│       ├── src/
│       │   ├── main.ts
│       │   ├── App.vue
│       │   └── components/   # Demo-specific components
│       ├── public/
│       ├── index.html
│       └── vite.config.ts    # Vite for demo app only
```

---

## Package Configuration

### Root `package.json`

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
    "type-check": "pnpm --recursive type-check"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - 'packages/*'
```

---

## Core Library Package (`packages/panel-ui/`)

### Minimal Dependencies Approach

The core library should have **minimal tooling dependencies**:

- **No Vite/Webpack**: Direct TypeScript compilation if builds are needed
- **No dev server**: Demo app handles development serving
- **Minimal build process**: May not need builds at all for local development

### `packages/panel-ui/package.json`

```json
{
  "name": "@panel-ui/core",
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "import": "./src/index.ts",
      "types": "./src/index.ts"
    }
  },
  "files": [
    "src",
    "dist"
  ],
  "scripts": {
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
    "@vue/tsconfig": "^0.5.0"
  }
}
```

### Source Structure

```
packages/panel-ui/src/
├── index.ts                  # Main exports
├── workspace/
│   ├── createWorkspace.ts    # Core workspace factory
│   ├── WorkspaceInstance.ts  # Workspace class/composable
│   └── types.ts              # Workspace-related types
├── components/
│   ├── PWorkspace.vue        # Internal workspace component
│   ├── PSplit.vue            # Split container
│   ├── PGrid.vue             # Grid container
│   ├── PStack.vue            # Stack container
│   ├── PTabbed.vue           # Tabbed container
│   └── PPanel.vue            # Panel wrapper
├── persistence/
│   ├── index.ts              # Plugin exports
│   ├── InMemoryPersistence.ts
│   ├── LocalStoragePersistence.ts
│   └── types.ts              # Persistence interfaces
├── bridge/
│   ├── types.ts              # UI abstraction interfaces
│   └── fallback.ts           # Fallback implementations
└── types/
    ├── index.ts              # Main type exports
    ├── workspace.ts          # Workspace types
    ├── layout.ts             # Layout node types
    └── events.ts             # Event types
```

---

## Demo Application (`packages/demo-app/`)

### Purpose

- **Integration testing**: Test panel-ui package in real usage
- **Development environment**: Live development with HMR
- **Documentation**: Visual examples and use cases
- **Local package loading**: Uses panel-ui directly from source

### `packages/demo-app/package.json`

```json
{
  "name": "panel-ui-demo",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit"
  },
  "dependencies": {
    "@panel-ui/core": "workspace:*",
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

### Vite Configuration

```ts
// packages/demo-app/vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@panel-ui/core': '../panel-ui/src'
    }
  }
})
```

---

## Development Workflow

### Local Development

```bash
# Install dependencies
pnpm install

# Start demo app (loads panel-ui from source)
pnpm dev

# Type check everything
pnpm type-check

# Run tests
pnpm test
```

### Package Development

1. **Edit panel-ui source** in `packages/panel-ui/src/`
2. **See changes immediately** in demo app (via workspace link)
3. **No build step required** for development
4. **Type checking** ensures API consistency

### Build Process (If Needed)

```bash
# Build library (if distribution build is needed)
pnpm build

# Build demo for deployment
pnpm build:demo
```

---

## Key Benefits

1. **Minimal tooling**: Core library has no build dependencies
2. **Fast development**: Direct source loading, no build steps
3. **Integration testing**: Demo app tests real usage patterns
4. **Workspace isolation**: Each package manages its own dependencies
5. **Type safety**: TypeScript across entire monorepo

---

## Questions to Resolve

1. **Build requirement**: Do we need a build step for the library at all?
2. **Distribution**: How will the package be published (source vs built)?
3. **Bridge packages**: Where do Vuetistic bridge packages fit in structure?
4. **Testing strategy**: Unit tests in library, integration tests in demo?
