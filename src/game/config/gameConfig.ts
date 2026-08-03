import Phaser from 'phaser'
import { BootScene } from '../scenes/BootScene'
import { MainScene } from '../scenes/MainScene'

/**
 * Configuración centralizada de Phaser. Cualquier escena nueva debe
 * añadirse aquí, en el orden en que debe registrarse.
 */
export const createGameConfig = (parent: HTMLElement): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  parent,
  backgroundColor: '#1d1f2b',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MainScene],
})
