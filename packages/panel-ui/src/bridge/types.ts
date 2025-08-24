import type { Component } from 'vue'

export interface PanelUiPrimitives {
  Button: Component
  Icon: (name: string) => Component
  Toolbar: Component
  // Extend for trays, menus if needed
}

export const PanelUiKey = Symbol('PanelUiPrimitives')
