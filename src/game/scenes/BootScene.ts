import Phaser from 'phaser'
import { SceneKeys } from '../config/sceneKeys'

/**
 * Punto de entrada del juego. Aquí se cargarán en el futuro los recursos
 * compartidos (fuentes, atlas de UI, barra de carga) antes de arrancar
 * la primera escena jugable.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Boot)
  }

  preload(): void {
    // Todos los assets cargados vía this.load respetarán el base de Vite (GitHub Pages, dev, etc).
    this.load.setBaseURL(import.meta.env.BASE_URL)
  }

  create(): void {
    this.scene.start(SceneKeys.Main)
  }
}
