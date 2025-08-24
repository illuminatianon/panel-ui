# Panel-UI — Design Document (v0.5)

> A **complete workspace management system** with **built-in state management** and **pluggable persistence**, inspired by tiling window managers. Built with **Vue 3** + **TypeScript**, using **render functions** for maximum flexibility and function-based workspace creation.

---

## 0) Vuetistic Integration & Dependency Strategy

### Principle

Panel-UI is **headless and semantic-first**:

* No hard dependency on Vuetistic in the core.
* Integration is optional and occurs via a **bridge package** that maps Vuetistic components and tokens into Panel-UI’s semantic primitives.

---

### Package Structure

**Core:** `@panel-ui/core`

* No Vuetistic imports.
* Exposes semantic, headless components (`PPanel`, `PWorkspace`, etc.).
* Provides a **UI Abstraction Layer (UIAL)** for injected primitives (buttons, icons, toolbars).

**Bridge:** `@panel-ui/bridge-vuetistic`

* The only package that imports Vuetistic.
* Implements the `PanelUiPrimitives` interface using Vuetistic components (`VBtn`, `VIcon`, `VToolbar`).
* Ships a `tokens.css` mapping Vuetistic tokens → Panel-UI CSS vars.

---

### Installation

```bash
pnpm add @panel-ui/core @panel-ui/bridge-vuetistic vuetistic
```

**App Setup**

```ts
import { createPanelUi } from '@panel-ui/core'
import { vuetisticBridge } from '@panel-ui/bridge-vuetistic'

app.use(createPanelUi({ primitives: vuetisticBridge() }))
```

---

### UI Abstraction Layer

```ts
export interface PanelUiPrimitives {
  Button: Component
  Icon: (name: string) => Component
  Toolbar: Component
  // Extend for trays, menus if needed
}

export const PanelUiKey = Symbol('PanelUiPrimitives')
```

**Fallback:**
If no bridge is provided:

* Panel-UI logs a warning and uses minimal native HTML elements.
* `strict` mode can enforce hard failure.

---

### Theming

* Core defines **neutral CSS vars**:

```css
:root {
  --pui-gap-1: 4px;
  --pui-radius-md: 10px;
  --pui-surface: #fff;
  --pui-accent: #3b82f6;
}
```

* Bridge maps Vuetistic tokens:

```css
:root {
  --pui-surface: var(--v-surface);
  --pui-accent: var(--v-primary);
}
```

---

### Versioning

* Core: peer `vue@^3.x`.
* Bridge: peer `vuetistic@^3.2.0`.
* Runtime guard warns if Vuetistic version is incompatible.

---

## 1) Vision & Principles

### What

A complete workspace management system with tiling-window ergonomics, providing everything needed to create and operate complex panel-based layouts.

### Why

Provide a **self-contained workspace solution** that handles state management, layout operations, and persistence—while remaining flexible through pluggable architecture.

### How

* Function-based workspace creation (`createWorkspace()`)
* Built-in state management with reactive patterns
* Pluggable persistence layer
* Semantic APIs for all workspace operations
* Headless components with Vuetistic bridge

**Core principles**

* **Self-contained:** Panel-UI ships with everything needed for workspace management
* **Function-based:** Workspaces created via functions, not components
* **Plugin-driven persistence:** Flexible storage strategies via plugins
* **Semantic APIs:** Rich, declarative methods for workspace manipulation
* **Deterministic rendering:** Reactive state drives consistent UI updates
* **Composable:** Slots and subcomponents enable deep customization
* **Accessible & performant:** ARIA roles, keyboard-first UX, efficient DOM

---

## 2) Goals / Non-Goals

### Goals

* Provide complete workspace management with built-in state handling
* Offer semantic APIs for all workspace operations (`split`, `focus`, `drag`, etc.)
* Ship with everything needed to create and operate panel-based layouts
* Support pluggable persistence strategies (in-memory, localStorage, custom)
* Wrap Vuetistic via a **bridge adapter** for theming and UI primitives
* Enable function-based workspace creation and management
* Provide headless, semantic components for layouts (split, grid, stack, tabbed)
* Enable chromeless/nested panels via configuration

### Non-Goals

* Hard coupling to external state management libraries (Pinia, Vuex)
* Opinionated persistence implementation (handled via plugins)
* Hard coupling to Vuetistic (bridge pattern maintains flexibility)

---

## 3) High-Level Architecture

**State authority:** Panel-UI workspace instances manage their own state internally.
**Panel-UI role:** Provide complete workspace management with semantic APIs and reactive rendering.

### Function-Based Workspace Creation

```ts
// Create workspace with built-in state management
const workspace = createWorkspace({
  id: 'main-workspace',
  initialLayout?: LayoutNode,
  persistence?: PersistencePlugin,
  // other config
})

// Semantic API for workspace operations
workspace.addPanel(panelConfig)
workspace.splitPanel(panelId, direction)
workspace.removePanel(panelId)
workspace.focusPanel(panelId)

// Mount the workspace component
app.mount(workspace.component)
```

### Architecture Flow
**User Action → Workspace API → Internal State Update → Reactive Re-render**

### Persistence Plugin System
```ts
interface PersistencePlugin {
  save(workspaceId: string, state: WorkspaceState): Promise<void>
  load(workspaceId: string): Promise<WorkspaceState | null>
  clear(workspaceId: string): Promise<void>
}

// Built-in implementations
const inMemoryPersistence = createInMemoryPersistence()
const localStoragePersistence = createLocalStoragePersistence()
```

---

## 4) Core Concepts & Data Model

**Layout Tree**

```ts
interface LayoutNode {
  id: string;
  kind: 'split' | 'grid' | 'stack' | 'tabbed' | 'pane';
  children?: LayoutNode[];
  ratio?: number;
}
```

---

## 5) Components Overview

### Workspace System

* **Workspace Instance**: Created via `createWorkspace()`, manages state and provides component
* **Internal Components**: `PWorkspace`, `PSplit`, `PGrid`, `PStack`, `PTabbed` (used internally)

### Panel Interface

Panels register with workspace via configuration:

```ts
interface PanelConfig {
  id: string
  component: Component
  title?: string
  chrome?: 'full' | 'minimal' | 'none'
  draggable?: boolean
  resizable?: boolean
  closable?: boolean
}

// Register panel with workspace
workspace.registerPanel(panelConfig)
workspace.addPanel(panelId, { position?, parentId? })
```

### Workspace API

```ts
interface WorkspaceInstance {
  // State management
  readonly state: Readonly<WorkspaceState>
  readonly component: Component

  // Panel operations
  addPanel(panelId: string, options?: AddPanelOptions): void
  removePanel(panelId: string): void
  focusPanel(panelId: string): void

  // Layout operations
  splitPanel(panelId: string, direction: 'horizontal' | 'vertical'): void
  movePanel(panelId: string, targetId: string, position: 'before' | 'after' | 'tab'): void

  // Persistence
  save(): Promise<void>
  load(): Promise<void>
  export(): WorkspaceState
  import(state: WorkspaceState): void
}
```

---

## 6) Wrapping Policy

* **Wrap** primitives that require **Panel-UI semantics** (TitleBar buttons, gutters).
* **Use Vuetistic directly** only in the bridge (never in core).
* Core components delegate UI rendering via injected `PanelUiPrimitives`.

---

## 7) Vuetistic Bridge Behavior

* Maps Vuetistic tokens → Panel-UI CSS vars.
* Provides Vuetistic components for `Button`, `Icon`, `Toolbar`.
* Exposes `uiProps` in core for safe passthrough (e.g., button size, color).

---

## 8) Accessibility & Theming

* **ARIA roles:** `tabpanel`, `tablist`, `toolbar`.
* **Keyboard navigation:** roving tabindex, shortcuts for tab switching, close.
* **Theming:** driven by tokens; dense layout defaults.

---

## 9) Event Model

* Semantic events: `split(nodeId, dir)`, `maximizeRequested(paneId)`, `focus(paneId)`.
* Drag lifecycle: `drag:start|over|end`.
* Resize intent: `resizeRequested(payload)`.

---

## 10) Suggested Type Signatures

```ts
interface PPanelProps {
  id: string;
  chrome?: 'full'|'minimal'|'none';
  draggable?: boolean;
  resizable?: boolean;
  focusable?: boolean;
  interactive?: boolean;
}

interface PPanelEmits {
  close: () => void;
  maximizeRequested: () => void;
  minimizeRequested: () => void;
  'drag:start': (payload: DragPayload) => void;
}
```

---

## 11) Workspace State Management

### Internal State Structure

```ts
interface WorkspaceState {
  id: string
  layout: LayoutNode
  panels: Record<string, PanelConfig>
  focus: string | null
  metadata: {
    version: string
    lastModified: number
  }
}

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

### Reactive Patterns

Workspace instances use Vue's reactivity system internally:
- State is reactive and drives component updates
- Computed properties for derived state (active panels, layout tree)
- Watch effects for persistence triggers
- No external dependencies on Pinia/Vuex required

---

## 12) Package & Versioning

**@panel-ui/core**

```json
"peerDependencies": { "vue": "^3.4.0" }
```

**@panel-ui/bridge-vuetistic**

```json
"peerDependencies": {
  "vue": "^3.4.0",
  "vuetistic": "^3.2.0"
}
```

---

## 13) Testing & CI

* **Core:** ARIA roles, events, no Vuetistic import.
* **Bridge:** Vuetistic compatibility, token mapping.
* **Visual:** Storybook showcasing:

  * Core fallback mode.
  * Vuetistic-themed mode (light/dark).

---

### Appendix: Complete Example Setup

```ts
import { createApp } from 'vue'
import { createWorkspace, createLocalStoragePersistence } from '@panel-ui/core'
import { vuetisticBridge } from '@panel-ui/bridge-vuetistic'

// Create workspace with persistence
const workspace = createWorkspace({
  id: 'main-workspace',
  persistence: createLocalStoragePersistence(),
  primitives: vuetisticBridge()
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

### Built-in Persistence Plugins

```ts
// In-memory (default, clears on refresh)
const inMemory = createInMemoryPersistence()

// Local storage
const localStorage = createLocalStoragePersistence({
  key: 'my-workspace',
  debounceMs: 500
})

// Custom persistence
const customPersistence: PersistencePlugin = {
  async save(workspaceId, state) {
    await api.saveWorkspace(workspaceId, state)
  },
  async load(workspaceId) {
    return await api.loadWorkspace(workspaceId)
  },
  async clear(workspaceId) {
    await api.clearWorkspace(workspaceId)
  }
}
```
