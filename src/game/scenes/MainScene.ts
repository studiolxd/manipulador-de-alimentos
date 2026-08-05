import Phaser from 'phaser'
import { SceneKeys } from '../config/sceneKeys'
import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/eventTypes'

const BUTTON_FILL_COLOR = 0xf2c584
const BUTTON_FILL_HOVER_COLOR = 0x9e4d4c
const BUTTON_TEXT_NORMAL = '#000000'
const BUTTON_TEXT_HOVER = '#ffffff'
const BUTTON_WIDTH = 210
const BUTTON_HEIGHT = 56
const BUTTON_HORIZONTAL_PADDING = 32
const BUTTON_TOP_MARGIN = 40
const BUTTON_BOTTOM_MARGIN = 40
const FONT_FAMILY = "'Poppins', sans-serif"
// Phaser dibuja el texto en un canvas interno propio de cada objeto Text; sin
// indicarle la densidad de píxeles real de la pantalla, ese canvas se genera a
// baja resolución y luego se estira, dando un aspecto borroso en pantallas HiDPI.
const TEXT_RESOLUTION = Math.max(window.devicePixelRatio || 1, 2)

const FADE_DURATION = 600
const BUBBLE_DELAY_AFTER_FADE = 700
const BUBBLE_MAX_WIDTH = 520
const BUBBLE_PADDING = 26
const BUBBLE_CENTER_Y_RATIO = 0.5
const BUBBLE_TEXT_COLOR = '#2b2b2b'
const TYPEWRITER_DELAY = 55

type BubbleImageKey = 'bocadilloIzq' | 'bocadilloDer'

// Las imágenes "Bocadillo izq/der.png" son ambas de 1760x1328px. Dentro de ese
// lienzo, el rectángulo del bocadillo (sin el pico) ocupa una zona concreta,
// distinta en cada imagen porque el pico cuelga hacia un lado u otro. Estos
// valores se midieron directamente sobre los píxeles de cada archivo.
const BUBBLE_IMAGE_WIDTH = 1760
const BUBBLE_IMAGE_HEIGHT = 1328
const BUBBLE_BOX_TOP = 65
const BUBBLE_BOX_BOTTOM = 777
const BUBBLE_BOX_BOUNDS: Record<BubbleImageKey, { left: number; right: number }> = {
  bocadilloIzq: { left: 113, right: 1758 },
  bocadilloDer: { left: 1, right: 1646 },
}
const BUBBLE_BOX_SOURCE_WIDTH = BUBBLE_BOX_BOUNDS.bocadilloIzq.right - BUBBLE_BOX_BOUNDS.bocadilloIzq.left
const BUBBLE_BOX_SOURCE_HEIGHT = BUBBLE_BOX_BOTTOM - BUBBLE_BOX_TOP

const INTRO_MESSAGE =
  'Hoy será tu primer día en hostelería. \n' +
  'Debes entrar y buscar a David, el encargado. Él te ayudará y te enseñará todo lo que necesitas. \n' +
  '¡Buena suerte!'

const TRAINING_MESSAGE =
  '¡Hola! Bienvenido/a al equipo. \n' +
  'Antes de empezar a trabajar quiero enseñarte cómo hacemos las cosas aquí. La seguridad alimentaria es responsabilidad de todos, y cada decisión que tomes puede ayudar a proteger a nuestros clientes. \n' +
  'Durante tu formación recorrerás las distintas zonas del restaurante y pondrás en práctica todo lo que vayas aprendiendo.'

const DAVID_HEIGHT_RATIO = 0.85
const DAVID_LEFT_MARGIN = 60
const DAVID_BOTTOM_MARGIN = 0

interface ButtonHandles {
  rect: Phaser.GameObjects.Rectangle
  text: Phaser.GameObjects.Text
}

/**
 * Escena principal. Muestra el fondo del restaurante, la sala de formación
 * y los bocadillos/botones que guían al jugador entre ambas.
 */
export class MainScene extends Phaser.Scene {
  private background?: Phaser.GameObjects.Image
  private davidImage?: Phaser.GameObjects.Image
  private startButtonHandles?: ButtonHandles
  private bottomButtonHandles?: ButtonHandles

  private bubbleImage?: Phaser.GameObjects.Image
  private bubbleImageKey: BubbleImageKey = 'bocadilloDer'
  private bubbleScale = 1
  private bubbleText?: Phaser.GameObjects.Text
  private bubbleFullText = ''
  private bubbleCharIndex = 0
  private bubbleOnComplete?: () => void
  private typewriterEvent?: Phaser.Time.TimerEvent

  constructor() {
    super(SceneKeys.Main)
  }

  create(): void {
    const { width, height } = this.scale

    this.cameras.main.setBackgroundColor('#1d1f2b')

    this.background = this.add.image(width / 2, height / 2, 'restaurante').setOrigin(0.5)
    this.updateBackgroundScale(width, height)

    const startPos = this.getStartButtonPosition(width)
    this.startButtonHandles = this.createButton(startPos.x, startPos.y, 'Comenzar', () =>
      this.beginTransition(),
    )

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this)

    EventBus.emit(GameEvents.CurrentSceneReady, { scene: this })
  }

  private createButton(x: number, y: number, label: string, onClick: () => void): ButtonHandles {
    const text = this.add
      .text(x, y, label, {
        fontFamily: FONT_FAMILY,
        fontSize: '22px',
        color: BUTTON_TEXT_NORMAL,
        resolution: TEXT_RESOLUTION,
      })
      .setOrigin(0.5)

    // El ancho se adapta al texto (con un mínimo) para que etiquetas largas
    // no se salgan del recuadro.
    const buttonWidth = Math.max(BUTTON_WIDTH, text.width + BUTTON_HORIZONTAL_PADDING * 2)

    const rect = this.add
      .rectangle(x, y, buttonWidth, BUTTON_HEIGHT, BUTTON_FILL_COLOR, 1)
      .setInteractive({ useHandCursor: true })

    text.setDepth(1)

    const setHighlighted = () => {
      rect.setFillStyle(BUTTON_FILL_HOVER_COLOR, 1)
      text.setColor(BUTTON_TEXT_HOVER)
    }

    const setNormal = () => {
      rect.setFillStyle(BUTTON_FILL_COLOR, 1)
      text.setColor(BUTTON_TEXT_NORMAL)
    }

    rect.on(Phaser.Input.Events.POINTER_OVER, setHighlighted)
    rect.on(Phaser.Input.Events.POINTER_DOWN, setHighlighted)
    rect.on(Phaser.Input.Events.POINTER_OUT, setNormal)
    rect.on(Phaser.Input.Events.POINTER_UP, () => {
      setNormal()
      onClick()
    })

    return { rect, text }
  }

  private destroyButton(handles?: ButtonHandles): void {
    handles?.rect.destroy()
    handles?.text.destroy()
  }

  private beginTransition(): void {
    this.startButtonHandles?.rect.disableInteractive()

    this.cameras.main.fadeOut(FADE_DURATION, 0, 0, 0)
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.destroyButton(this.startButtonHandles)
      this.startButtonHandles = undefined

      this.cameras.main.fadeIn(FADE_DURATION, 0, 0, 0)
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
        this.time.delayedCall(BUBBLE_DELAY_AFTER_FADE, () =>
          this.showBubble(INTRO_MESSAGE, 'bocadilloDer', () => this.showEnterButton()),
        )
      })
    })
  }

  private showBubble(text: string, imageKey: BubbleImageKey, onComplete: () => void): void {
    const { width, height } = this.scale
    const pos = this.getBubblePosition(width, height)
    const desiredWidth = Math.min(width * 0.85, BUBBLE_MAX_WIDTH)

    this.bubbleFullText = text
    this.bubbleImageKey = imageKey
    this.bubbleOnComplete = onComplete

    this.bubbleText = this.add
      .text(pos.x, pos.y, text, {
        fontFamily: FONT_FAMILY,
        fontSize: '19px',
        color: BUBBLE_TEXT_COLOR,
        align: 'center',
        wordWrap: { width: desiredWidth - BUBBLE_PADDING * 2 },
        resolution: TEXT_RESOLUTION,
      })
      .setOrigin(0.5)
      .setDepth(1)

    // La imagen del bocadillo se escala de forma uniforme (sin deformar el pico
    // ni el grosor del trazo) lo justo para que su recuadro interior quepa el
    // texto ya escrito, calculando el mayor de los dos factores (ancho/alto).
    const scaleFromWidth = desiredWidth / BUBBLE_BOX_SOURCE_WIDTH
    const requiredHeight = this.bubbleText.height + BUBBLE_PADDING * 2
    const scaleFromHeight = requiredHeight / BUBBLE_BOX_SOURCE_HEIGHT
    this.bubbleScale = Math.max(scaleFromWidth, scaleFromHeight)

    this.bubbleImage = this.add.image(0, 0, imageKey).setOrigin(0.5).setScale(this.bubbleScale).setDepth(0)
    this.positionBubbleImage(pos.x, pos.y)

    this.bubbleText.setText('')
    this.bubbleCharIndex = 0
    this.typewriterEvent = this.time.addEvent({
      delay: TYPEWRITER_DELAY,
      loop: true,
      callback: () => this.advanceTypewriter(),
    })
  }

  private advanceTypewriter(): void {
    this.bubbleCharIndex += 1
    this.bubbleText?.setText(this.bubbleFullText.slice(0, this.bubbleCharIndex))

    if (this.bubbleCharIndex >= this.bubbleFullText.length) {
      this.typewriterEvent?.remove()
      this.typewriterEvent = undefined
      this.bubbleOnComplete?.()
    }
  }

  /**
   * Coloca la imagen del bocadillo para que el centro de su recuadro (no el
   * centro de la imagen completa, que incluye el pico y sus márgenes) caiga
   * exactamente en (boxCenterX, boxCenterY).
   */
  private positionBubbleImage(boxCenterX: number, boxCenterY: number): void {
    if (!this.bubbleImage) {
      return
    }

    const bounds = BUBBLE_BOX_BOUNDS[this.bubbleImageKey]
    const boxSourceCenterX = (bounds.left + bounds.right) / 2
    const boxSourceCenterY = (BUBBLE_BOX_TOP + BUBBLE_BOX_BOTTOM) / 2
    const offsetX = (boxSourceCenterX - BUBBLE_IMAGE_WIDTH / 2) * this.bubbleScale
    const offsetY = (boxSourceCenterY - BUBBLE_IMAGE_HEIGHT / 2) * this.bubbleScale

    this.bubbleImage.setPosition(boxCenterX - offsetX, boxCenterY - offsetY)
  }

  private showEnterButton(): void {
    const pos = this.getBottomButtonPosition(this.scale.width, this.scale.height)
    this.bottomButtonHandles = this.createButton(pos.x, pos.y, 'Entrar al restaurante', () => {
      EventBus.emit(GameEvents.EnterRestaurant, undefined)
      this.transitionToSala()
    })
  }

  private transitionToSala(): void {
    this.bottomButtonHandles?.rect.disableInteractive()

    this.cameras.main.fadeOut(FADE_DURATION, 0, 0, 0)
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.destroyButton(this.bottomButtonHandles)
      this.bottomButtonHandles = undefined
      this.destroyBubble()

      this.background?.setTexture('sala')
      this.updateBackgroundScale(this.scale.width, this.scale.height)
      this.showDavid()

      this.cameras.main.fadeIn(FADE_DURATION, 0, 0, 0)
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
        this.time.delayedCall(BUBBLE_DELAY_AFTER_FADE, () =>
          // El pico de "bocadilloIzq" cuelga hacia la izquierda, en dirección a David.
          this.showBubble(TRAINING_MESSAGE, 'bocadilloIzq', () => this.showStartTrainingButton()),
        )
      })
    })
  }

  private showStartTrainingButton(): void {
    const pos = this.getBottomButtonPosition(this.scale.width, this.scale.height)
    this.bottomButtonHandles = this.createButton(pos.x, pos.y, '¡Empecemos!', () => {
      EventBus.emit(GameEvents.StartTraining, undefined)
    })
  }

  private destroyBubble(): void {
    this.bubbleImage?.destroy()
    this.bubbleImage = undefined
    this.bubbleText?.destroy()
    this.bubbleText = undefined
  }

  private showDavid(): void {
    this.davidImage = this.add.image(0, 0, 'david').setOrigin(0.5, 1)
    this.positionDavid(this.scale.height)
  }

  private positionDavid(height: number): void {
    if (!this.davidImage) {
      return
    }

    const targetHeight = height * DAVID_HEIGHT_RATIO
    const scale = targetHeight / this.davidImage.height
    this.davidImage.setScale(scale)

    const x = DAVID_LEFT_MARGIN + this.davidImage.displayWidth / 2
    const y = height - DAVID_BOTTOM_MARGIN
    this.davidImage.setPosition(x, y)
  }

  private getStartButtonPosition(width: number): { x: number; y: number } {
    return { x: width / 2, y: BUTTON_TOP_MARGIN + BUTTON_HEIGHT / 2 }
  }

  private getBottomButtonPosition(width: number, height: number): { x: number; y: number } {
    return { x: width / 2, y: height - BUTTON_BOTTOM_MARGIN - BUTTON_HEIGHT / 2 }
  }

  private getBubblePosition(width: number, height: number): { x: number; y: number } {
    return { x: width / 2, y: height * BUBBLE_CENTER_Y_RATIO }
  }

  private repositionButton(handles: ButtonHandles | undefined, x: number, y: number): void {
    handles?.rect.setPosition(x, y)
    handles?.text.setPosition(x, y)
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    const { width, height } = gameSize

    this.background?.setPosition(width / 2, height / 2)
    this.updateBackgroundScale(width, height)
    this.positionDavid(height)

    const startPos = this.getStartButtonPosition(width)
    this.repositionButton(this.startButtonHandles, startPos.x, startPos.y)

    const bottomPos = this.getBottomButtonPosition(width, height)
    this.repositionButton(this.bottomButtonHandles, bottomPos.x, bottomPos.y)

    if (this.bubbleText && this.bubbleImage) {
      const bubblePos = this.getBubblePosition(width, height)
      this.bubbleText.setPosition(bubblePos.x, bubblePos.y)
      this.positionBubbleImage(bubblePos.x, bubblePos.y)
    }
  }

  private updateBackgroundScale(width: number, height: number): void {
    if (!this.background) {
      return
    }

    const scale = Math.max(width / this.background.width, height / this.background.height)
    this.background.setScale(scale)
  }

  private handleShutdown(): void {
    this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this)
    this.typewriterEvent?.remove()
  }
}
