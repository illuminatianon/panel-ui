export interface DragPayload {
  panelId: string
  sourcePosition: { x: number; y: number }
  targetPosition?: { x: number; y: number }
}
