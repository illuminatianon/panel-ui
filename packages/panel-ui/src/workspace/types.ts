import type { Component } from 'vue'
import type { LayoutNode, PanelConfig, WorkspaceState } from '../types'
import type { PersistencePlugin } from '../persistence/types'
import type { PanelUiPrimitives } from '../bridge/types'

export interface WorkspaceConfig {
  id: string
  initialLayout?: LayoutNode
  persistence?: PersistencePlugin
  primitives?: PanelUiPrimitives
}

export interface AddPanelOptions {
  position?: 'before' | 'after' | 'tab'
  parentId?: string
}

export interface WorkspaceInstance {
  // State management
  readonly state: Readonly<WorkspaceState>
  readonly component: Component

  // Panel operations
  registerPanel(config: PanelConfig): void
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
