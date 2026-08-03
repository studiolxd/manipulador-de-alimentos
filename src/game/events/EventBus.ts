import Phaser from 'phaser'
import type { GameEventPayloads } from './eventTypes'

/**
 * Canal de comunicación desacoplado entre React y Phaser.
 * Ninguno de los dos entornos conoce al otro: ambos solo hablan con este bus.
 */
class TypedEventBus extends Phaser.Events.EventEmitter {
  emit<K extends keyof GameEventPayloads>(event: K, payload: GameEventPayloads[K]): boolean {
    return super.emit(event, payload)
  }

  on<K extends keyof GameEventPayloads>(
    event: K,
    listener: (payload: GameEventPayloads[K]) => void,
    context?: unknown,
  ): this {
    return super.on(event, listener, context)
  }

  off<K extends keyof GameEventPayloads>(
    event: K,
    listener?: (payload: GameEventPayloads[K]) => void,
    context?: unknown,
  ): this {
    return super.off(event, listener, context)
  }
}

export const EventBus = new TypedEventBus()
