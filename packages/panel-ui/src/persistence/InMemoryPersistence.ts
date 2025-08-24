import type { PersistencePlugin } from './types'
import type { WorkspaceState } from '../types'

export function createInMemoryPersistence(): PersistencePlugin {
  const storage = new Map<string, WorkspaceState>()

  return {
    async save(workspaceId: string, state: WorkspaceState): Promise<void> {
      storage.set(workspaceId, JSON.parse(JSON.stringify(state)))
    },

    async load(workspaceId: string): Promise<WorkspaceState | null> {
      const state = storage.get(workspaceId)
      return state ? JSON.parse(JSON.stringify(state)) : null
    },

    async clear(workspaceId: string): Promise<void> {
      storage.delete(workspaceId)
    }
  }
}
