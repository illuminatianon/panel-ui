import type { PersistencePlugin } from './types'
import type { WorkspaceState } from '../types'

export interface LocalStorageOptions {
  key?: string
  debounceMs?: number
}

export function createLocalStoragePersistence(options: LocalStorageOptions = {}): PersistencePlugin {
  const { key = 'panel-ui-workspace', debounceMs = 500 } = options
  
  let saveTimeout: number | null = null

  const debouncedSave = (workspaceId: string, state: WorkspaceState) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    
    saveTimeout = window.setTimeout(() => {
      try {
        const storageKey = `${key}-${workspaceId}`
        localStorage.setItem(storageKey, JSON.stringify(state))
      } catch (error) {
        console.warn('Failed to save workspace to localStorage:', error)
      }
    }, debounceMs)
  }

  return {
    async save(workspaceId: string, state: WorkspaceState): Promise<void> {
      debouncedSave(workspaceId, state)
    },

    async load(workspaceId: string): Promise<WorkspaceState | null> {
      try {
        const storageKey = `${key}-${workspaceId}`
        const stored = localStorage.getItem(storageKey)
        return stored ? JSON.parse(stored) : null
      } catch (error) {
        console.warn('Failed to load workspace from localStorage:', error)
        return null
      }
    },

    async clear(workspaceId: string): Promise<void> {
      try {
        const storageKey = `${key}-${workspaceId}`
        localStorage.removeItem(storageKey)
      } catch (error) {
        console.warn('Failed to clear workspace from localStorage:', error)
      }
    }
  }
}
