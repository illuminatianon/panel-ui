# Panel-UI

> A complete workspace management system with built-in state management and pluggable persistence, inspired by tiling window managers.

[![npm version](https://badge.fury.io/js/panel-ui.svg)](https://badge.fury.io/js/panel-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🏗️ **Complete workspace management** with built-in state handling
- 🔧 **Function-based workspace creation** (`createWorkspace()`)
- 💾 **Pluggable persistence** (in-memory, localStorage, custom)
- 🎨 **Headless components** with optional Vuetistic bridge
- 📱 **Responsive layouts** (split, grid, stack, tabbed)
- ⌨️ **Keyboard navigation** and accessibility support
- 🔄 **Reactive state management** with Vue 3 composition API

## Installation

```bash
npm install panel-ui vue
# or
pnpm add panel-ui vue
# or
yarn add panel-ui vue
```

## Quick Start

```typescript
import { createWorkspace, createLocalStoragePersistence, fallbackBridge } from 'panel-ui'

// Create workspace with persistence
const workspace = createWorkspace({
  id: 'main-workspace',
  persistence: createLocalStoragePersistence(),
  primitives: fallbackBridge()
})

// Register panels
workspace.registerPanel({
  id: 'editor',
  component: EditorComponent,
  title: 'Code Editor',
  chrome: 'full'
})

workspace.registerPanel({
  id: 'terminal',
  component: TerminalComponent,
  title: 'Terminal',
  chrome: 'minimal'
})

// Add panels to workspace
workspace.addPanel('editor')
workspace.addPanel('terminal')
workspace.splitPanel('editor', 'horizontal')

// Mount workspace component
const app = createApp(workspace.component)
app.mount('#app')
```

## Core Concepts

### Workspace Instance

Created via `createWorkspace()`, manages state and provides a Vue component:

```typescript
const workspace = createWorkspace({
  id: 'my-workspace',
  initialLayout?: LayoutNode,
  persistence?: PersistencePlugin,
  primitives?: PanelUiPrimitives
})
```

### Panel Configuration

Panels are registered with the workspace:

```typescript
interface PanelConfig {
  id: string
  component: Component
  title?: string
  chrome?: 'full' | 'minimal' | 'none'
  draggable?: boolean
  resizable?: boolean
  closable?: boolean
}
```

### Persistence Plugins

Built-in persistence options:

```typescript
// In-memory (default, clears on refresh)
const inMemory = createInMemoryPersistence()

// Local storage with debouncing
const localStorage = createLocalStoragePersistence({
  key: 'my-workspace',
  debounceMs: 500
})

// Custom persistence
const customPersistence: PersistencePlugin = {
  async save(workspaceId, state) { /* ... */ },
  async load(workspaceId) { /* ... */ },
  async clear(workspaceId) { /* ... */ }
}
```

## API Reference

### Workspace Methods

```typescript
// Panel operations
workspace.registerPanel(config: PanelConfig): void
workspace.addPanel(panelId: string, options?: AddPanelOptions): void
workspace.removePanel(panelId: string): void
workspace.focusPanel(panelId: string): void

// Layout operations
workspace.splitPanel(panelId: string, direction: 'horizontal' | 'vertical'): void
workspace.movePanel(panelId: string, targetId: string, position: 'before' | 'after' | 'tab'): void

// Persistence
workspace.save(): Promise<void>
workspace.load(): Promise<void>
workspace.export(): WorkspaceState
workspace.import(state: WorkspaceState): void
```

### Layout Types

```typescript
interface LayoutNode {
  id: string
  type: 'split' | 'grid' | 'stack' | 'tabbed' | 'panel'
  children?: LayoutNode[]
  panelId?: string // for leaf nodes
  direction?: 'horizontal' | 'vertical' // for splits
  ratio?: number // for sizing
  activeTab?: string // for tabbed containers
}
```

## Vuetistic Integration

For Vuetistic theming and components:

```typescript
import { vuetisticBridge } from 'panel-ui'

const workspace = createWorkspace({
  id: 'main-workspace',
  primitives: vuetisticBridge()
})
```

## TypeScript Support

Panel-UI is written in TypeScript and provides full type definitions:

```typescript
import type { 
  WorkspaceInstance, 
  PanelConfig, 
  LayoutNode, 
  PersistencePlugin 
} from 'panel-ui'
```

## Browser Support

- Modern browsers with ES2020 support
- Vue 3.4+ required
- TypeScript 5.0+ recommended

## Contributing

See the [main repository](https://github.com/your-org/panel-ui) for contribution guidelines.

## License

MIT © [Your Name](https://github.com/your-org)
