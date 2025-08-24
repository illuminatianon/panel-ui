import type { LayoutNode } from './layout'
import type { PanelConfig } from './panel'

export interface WorkspaceState {
  id: string
  layout: LayoutNode
  panels: Record<string, PanelConfig>
  focus: string | null
  metadata: {
    version: string
    lastModified: number
  }
}
