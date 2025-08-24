export interface LayoutNode {
  id: string
  type: 'split' | 'grid' | 'stack' | 'tabbed' | 'panel'
  children?: LayoutNode[]
  panelId?: string // for leaf nodes
  direction?: 'horizontal' | 'vertical' // for splits
  ratio?: number // for sizing
  activeTab?: string // for tabbed containers
}
