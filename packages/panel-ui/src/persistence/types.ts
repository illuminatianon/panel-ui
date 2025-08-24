import type { WorkspaceState } from '../types'

export interface PersistencePlugin {
  save(workspaceId: string, state: WorkspaceState): Promise<void>
  load(workspaceId: string): Promise<WorkspaceState | null>
  clear(workspaceId: string): Promise<void>
}
