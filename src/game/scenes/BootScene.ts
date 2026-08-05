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
    this.load.image('restaurante', 'Restaurante.jpg')
    this.load.image('sala', 'Sala.jpg')
    this.load.svg('david', 'David.svg')
    this.load.image('bocadilloIzq', 'Bocadillo izq.png')
    this.load.image('bocadilloDer', 'Bocadillo der.png')
  }

  create(): void {
    // Espera a que la tipografía Poppins esté disponible para que el texto dibujado
    // en el canvas de Phaser no arranque con la fuente de sistema y luego "salte".
    Promise.all([document.fonts.load('400 16px "Poppins"'), document.fonts.load('600 16px "Poppins"')])
      .catch(() => undefined)
      .finally(() => this.scene.start(SceneKeys.Main))
  }
}
