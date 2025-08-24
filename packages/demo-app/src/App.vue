<script setup lang="ts">
import { onMounted } from 'vue'
import { createWorkspace, createInMemoryPersistence, fallbackBridge } from 'panel-ui'

// Create a workspace instance
const workspace = createWorkspace({
  id: 'demo-workspace',
  persistence: createInMemoryPersistence(),
  primitives: fallbackBridge()
})

// Register a simple demo panel
workspace.registerPanel({
  id: 'welcome',
  component: {
    template: '<div style="padding: 20px;"><h2>Welcome to Panel-UI!</h2><p>This is a demo panel.</p></div>'
  },
  title: 'Welcome Panel',
  chrome: 'full'
})

// Add the panel to the workspace
onMounted(() => {
  workspace.addPanel('welcome')
})
</script>

<template>
  <div id="app">
    <h1>Panel-UI Demo</h1>
    <p>This demo shows the basic Panel-UI workspace functionality.</p>

    <div style="border: 1px solid #ccc; height: 400px; margin: 20px 0;">
      <component :is="workspace.component" />
    </div>

    <div style="margin-top: 20px;">
      <h3>Workspace State:</h3>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">{{ JSON.stringify(workspace.state, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 20px;
}

pre {
  font-size: 12px;
  max-height: 200px;
  overflow: auto;
}
</style>
