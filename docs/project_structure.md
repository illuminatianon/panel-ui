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
│   │   │   ├── bridge/       # Vuetistic bridge (in core)
│   │   │   └── types/        # TypeScript definitions
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

### Development vs Distribution Strategy

The core library uses **different strategies for development vs distribution**:

**Development (Local):**
- **TypeScript source**: Demo app loads `.ts` files directly
- **Zero build tooling**: No compilation step during development
- **Fast iteration**: Instant changes, no build step

**Distribution (npm):**
- **Built artifacts**: Compiled JavaScript + TypeScript definitions
- **Semantic release**: Automated publishing with conventional commits
- **Build process**: Required for npm distribution

See [Semantic Release Strategy](./semantic_release_strategy.md) for complete publishing details.

### `packages/panel-ui/package.json`

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
    "@vue/tsconfig": "^0.5.0"
  }
}
```

**Key Changes for Distribution:**
- **Version**: `0.0.0-development` (managed by semantic-release)
- **Main/Module/Types**: Point to built `dist/` artifacts
- **Files**: Only include `dist/`, `README.md`, `LICENSE`
- **Build script**: Compiles TypeScript and bundles for distribution

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
│   ├── index.ts              # Bridge exports
│   ├── types.ts              # UI abstraction interfaces
│   ├── vuetistic.ts          # Vuetistic bridge implementation
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

**Key Points:**
- **Private**: `true` prevents accidental npm publishing
- **Workspace dependency**: Uses `panel-ui` via workspace link
- **No semantic-release**: Demo app is never published

### Vite Configuration

```ts
// packages/demo-app/vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'panel-ui': '../panel-ui/src'
    }
  }
})
```

**Development vs Production:**
- **Development**: Vite alias points to TypeScript source
- **Production**: Would use built artifacts from `dist/` (if needed)

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

## Architectural Decisions Made

### 1. **Dual Development/Distribution Strategy**
- **Decision**: TypeScript source for development, built artifacts for npm distribution
- **Rationale**: Fast development iteration + standard npm package distribution
- **Implementation**: Demo app uses source via Vite alias, npm gets built `dist/`
- **Build process**: Required for semantic-release publishing

### 2. **Bridge in Core Package**
- **Decision**: Vuetistic bridge lives in `packages/panel-ui/src/bridge/`
- **Rationale**: Simpler package structure, easier maintenance
- **Implementation**: Optional import, no hard dependency on Vuetistic

### 3. **Monorepo Structure**
- **Decision**: pnpm workspaces with `panel-ui` + `demo-app`
- **Rationale**: Clean separation, local development integration
- **Benefit**: Demo app tests real usage patterns with zero build friction

---

## Future Considerations

1. **Additional Bridges**: Material UI, Ant Design, etc. can be added to bridge folder
2. **Testing Strategy**: Unit tests in library, integration tests in demo app
3. **Build Optimization**: Bundle size optimization, tree-shaking improvements
4. **Documentation**: Auto-generated API docs from TypeScript definitions

## Related Documentation

- [Main Design Document](./main_design_document.md) - Complete architectural overview
- [Semantic Release Strategy](./semantic_release_strategy.md) - Automated publishing setup
