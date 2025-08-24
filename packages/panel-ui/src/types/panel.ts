import type { Component } from 'vue'

export interface PanelConfig {
  id: string
  component: Component
  title?: string
  chrome?: 'full' | 'minimal' | 'none'
  draggable?: boolean
  resizable?: boolean
  closable?: boolean
}
