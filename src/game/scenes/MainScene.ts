import Phaser from 'phaser'
import { SceneKeys } from '../config/sceneKeys'
import { EventBus } from '../events/EventBus'
import { GameEvents, type UpdateMainTextPayload } from '../events/eventTypes'

const DEFAULT_TEXT = 'Juego preparado'

/**
 * Escena temporal de prueba. Sirve para validar el arranque de Phaser,
 * el redimensionado responsive y la comunicación con React.
 */
export class MainScene extends Phaser.Scene {
  private statusText?: Phaser.GameObjects.Text

  constructor() {
    super(SceneKeys.Main)
  }

  create(): void {
    const { width, height } = this.scale

    this.cameras.main.setBackgroundColor('#1d1f2b')

    this.statusText = this.add
      .text(width / 2, height / 2, DEFAULT_TEXT, {
        fontFamily: 'sans-serif',
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this)
    EventBus.on(GameEvents.UpdateMainText, this.handleUpdateMainText, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this)

    EventBus.emit(GameEvents.CurrentSceneReady, { scene: this })
  }

  private handleUpdateMainText({ text }: UpdateMainTextPayload): void {
    this.statusText?.setText(text)
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.statusText?.setPosition(gameSize.width / 2, gameSize.height / 2)
  }

  private handleShutdown(): void {
    this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this)
    EventBus.off(GameEvents.UpdateMainText, this.handleUpdateMainText, this)
  }
}
