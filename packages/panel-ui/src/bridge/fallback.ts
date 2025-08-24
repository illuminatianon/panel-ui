import { defineComponent, h } from 'vue'
import type { PanelUiPrimitives } from './types'

export function fallbackBridge(): PanelUiPrimitives {
  const Button = defineComponent({
    name: 'FallbackButton',
    setup(_, { slots }) {
      return () => h('button', { class: 'panel-ui-button' }, slots.default?.())
    }
  })

  const Icon = (name: string) => defineComponent({
    name: 'FallbackIcon',
    setup() {
      return () => h('span', { class: 'panel-ui-icon' }, name)
    }
  })

  const Toolbar = defineComponent({
    name: 'FallbackToolbar',
    setup(_, { slots }) {
      return () => h('div', { class: 'panel-ui-toolbar' }, slots.default?.())
    }
  })

  return {
    Button,
    Icon,
    Toolbar
  }
}
