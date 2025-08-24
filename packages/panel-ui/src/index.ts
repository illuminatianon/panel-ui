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
