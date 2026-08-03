import type { Scene } from 'phaser'

/**
 * Identificadores centralizados de los eventos que viajan por el EventBus.
 * Añade aquí una nueva entrada por cada evento nuevo entre React y Phaser.
 */
export const GameEvents = {
  CurrentSceneReady: 'current-scene-ready',
  UpdateMainText: 'update-main-text',
} as const

export interface CurrentSceneReadyPayload {
  scene: Scene
}

export interface UpdateMainTextPayload {
  text: string
}

/** Mapa evento -> payload, usado por EventBus para tipar emit/on/off sin `any`. */
export interface GameEventPayloads {
  [GameEvents.CurrentSceneReady]: CurrentSceneReadyPayload
  [GameEvents.UpdateMainText]: UpdateMainTextPayload
}
