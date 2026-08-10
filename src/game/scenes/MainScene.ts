import Phaser from 'phaser'
import { SceneKeys } from '../config/sceneKeys'
import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/eventTypes'
import type {
  BubbleDescriptor,
  BubbleRevealCompletePayload,
  ButtonClickedPayload,
  ButtonDescriptor,
  ConceptsConfirmedPayload,
  DavidBounds,
} from '../events/eventTypes'
import {
  BUBBLE_DELAY_AFTER_FADE,
  BUBBLE_MAX_WIDTH,
  FADE_DURATION,
  HOME_BG_COLOR,
  HOME_TITLE_COLOR,
  RESULT_CHIPS_FEEDBACK_MAX_WIDTH,
} from '../config/uiConstants'
import { ACTIVITY1_FEEDBACK_PARTIAL, ACTIVITY1_FEEDBACK_SUCCESS } from '../data/activities'

const FONT_FAMILY = "'Poppins', sans-serif"
// Phaser dibuja el texto en un canvas interno propio de cada objeto Text; sin
// indicarle la densidad de píxeles real de la pantalla, ese canvas se genera a
// baja resolución y luego se estira, dando un aspecto borroso en pantallas HiDPI.
const TEXT_RESOLUTION = Math.max(window.devicePixelRatio || 1, 2)

// División manual en frases (ver BubbleDescriptor.sentences): cada elemento
// se escribe, se deja leído y se borra para dar paso al siguiente.
const INTRO_MESSAGE_SENTENCES = [
  'Hoy será tu primer día en hostelería.',
  'Debes entrar y buscar a David, el encargado. Él te ayudará y te enseñará todo lo que necesitas.',
  '¡Buena suerte!',
]
const INTRO_MESSAGE = INTRO_MESSAGE_SENTENCES.join(' ')

const TRAINING_MESSAGE_SENTENCES = [
  '¡Hola! Soy David, bienvenido/a al equipo.',
  'Antes de empezar a trabajar quiero enseñarte cómo hacemos las cosas aquí.',
  'La seguridad alimentaria es responsabilidad de todos, y cada decisión que tomes puede ayudar a proteger a nuestros clientes.',
  'Durante tu formación recorrerás las distintas zonas del restaurante y pondrás en práctica todo lo que vayas aprendiendo.',
]
const TRAINING_MESSAGE = TRAINING_MESSAGE_SENTENCES.join(' ')

const DAVID_HEIGHT_RATIO = 0.85
const DAVID_SIDE_MARGIN = 60
const DAVID_BOTTOM_MARGIN = 0

type DavidSide = 'left' | 'right'

const HOME_SIDE_MARGIN_RATIO = 0.09
// La columna de texto ocupa la izquierda; la imagen de portada, la derecha.
const HOME_TEXT_COLUMN_RATIO = 0.41
const HOME_TITLE_TOP_RATIO = 0.14
const HOME_TITLE = 'Manipulador de\nalimentos'
const HOME_TITLE_LINE_SPACING = 4
// El tamaño de letra del titular se calcula a partir del ancho de pantalla
// (con un mínimo y un máximo) para que nunca se salga del lienzo en
// ventanas o pantallas estrechas, ni desborde la columna de texto (más
// estrecha ahora que la imagen ocupa la mitad derecha).
const HOME_TITLE_FONT_RATIO = 0.04
const HOME_TITLE_FONT_MIN = 26
const HOME_TITLE_FONT_MAX = 50
const HOME_SUBTITLE = 'Aprende todo lo que necesitas saber\npara trabajar en hostelería.'
const HOME_SUBTITLE_GAP = 18
const HOME_SUBTITLE_COLOR = '#1a1a1a'
const HOME_SUBTITLE_FONT_RATIO = 0.0155
const HOME_SUBTITLE_FONT_MIN = 14
const HOME_SUBTITLE_FONT_MAX = 20
// Pegada a la esquina inferior derecha: sin margen a la derecha ni abajo, y
// empezando más abajo que antes para que quede en la mitad inferior. El área
// se ensancha (columna de texto más estrecha, sin hueco extra) para que la
// imagen salga más grande.
const HOME_IMAGE_TOP_RATIO = 0.2
const HOME_IMAGE_BOTTOM_RATIO = 1
const HOME_IMAGE_LEFT_GAP_RATIO = 0

const HANDLER_DEFINITION_SENTENCES = [
  'Un manipulador de alimentos es cualquier persona que, por su trabajo, entra en contacto con alimentos o realiza tareas que pueden influir en su seguridad.',
  'No solo son manipuladores de alimentos quienes cocinan.',
  'También lo son las personas que reciben mercancías, almacenan productos, envasan alimentos, transportan pedidos, sirven platos y limpian utensilios, equipos o superficies que estarán en contacto con los alimentos.',
]
const HANDLER_DEFINITION_MESSAGE = HANDLER_DEFINITION_SENTENCES.join(' ')

const HANDLER_IMPORTANCE_SENTENCES = [
  'Como has visto, en un establecimiento hay muchas personas que pueden influir en la seguridad de los alimentos, aunque no todas trabajen directamente en la cocina.',
  'Sin embargo, nuestro trabajo no solo afecta a los alimentos. Cada decisión que tomamos puede tener consecuencias para distintas personas y para el propio establecimiento.',
  'Ven conmigo. Quiero enseñarte por qué es tan importante hacer bien nuestro trabajo.',
]
const HANDLER_IMPORTANCE_MESSAGE = HANDLER_IMPORTANCE_SENTENCES.join(' ')

const BARRA_MESSAGE =
  'Una mala práctica puede afectar a más personas de las que parece. \n' +
  'Observa cada situación y colócala junto a quien puede verse afectado. Algunas podrían tener consecuencias en más de un grupo, pero céntrate en su efecto principal.'

/**
 * Escena principal. Dibuja el fondo del restaurante, la sala de formación y
 * David, y orquesta la secuencia y temporización entre pantallas. Toda la UI
 * (botones de navegación, bocadillos y las dos actividades con sus
 * resultados) vive en React (`GameUIOverlay`); esta escena solo les envía
 * "snapshots" de qué mostrar a través del EventBus.
 */
export class MainScene extends Phaser.Scene {
  private background?: Phaser.GameObjects.Image
  private davidImage?: Phaser.GameObjects.Image
  private davidSide: DavidSide = 'left'
  private davidBounds: DavidBounds | null = null

  private homeTitle?: Phaser.GameObjects.Text
  private homeSubtitle?: Phaser.GameObjects.Text
  private homeImage?: Phaser.GameObjects.Image
  private homeSubtitleBottom: number | null = null

  // ---- Puente con el overlay de React (botones y bocadillos) ----
  private activeButtons: ButtonDescriptor[] = []
  private buttonHandlers: Record<string, () => void> = {}
  private activeBubbles: BubbleDescriptor[] = []
  private bubbleCompleteHandlers: Partial<Record<'bubble1' | 'bubble2', () => void>> = {}

  constructor() {
    super(SceneKeys.Main)
  }

  create(): void {
    const { width, height } = this.scale

    // El fondo del restaurante no se carga hasta la transición: la portada
    // es una página en blanco, sin foto de fondo.
    this.cameras.main.setBackgroundColor(HOME_BG_COLOR)

    EventBus.on(GameEvents.ButtonClicked, this.handleButtonClicked, this)
    EventBus.on(GameEvents.BubbleRevealComplete, this.handleBubbleRevealComplete, this)
    EventBus.on(GameEvents.ConceptsConfirmed, this.handleConceptsConfirmed, this)

    this.showHomeIntro(width, height)

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this)

    EventBus.emit(GameEvents.CurrentSceneReady, { scene: this })
  }

  // ---- Puente con el overlay de React ----

  private setButton(descriptor: Omit<ButtonDescriptor, 'visible'>, onClick: () => void): void {
    this.buttonHandlers[descriptor.id] = onClick
    this.upsertButton({ ...descriptor, visible: true })
  }

  /** Desvanece un botón (sin retirarlo del snapshot) en vez de quitarlo de golpe. */
  private hideButton(id: string): void {
    this.activeButtons = this.activeButtons.map((button) => (button.id === id ? { ...button, visible: false } : button))
    this.syncButtons()
  }

  private upsertButton(descriptor: ButtonDescriptor): void {
    this.activeButtons = [...this.activeButtons.filter((button) => button.id !== descriptor.id), descriptor]
    this.syncButtons()
  }

  private syncButtons(): void {
    EventBus.emit(GameEvents.SetButtons, this.activeButtons)
  }

  private handleButtonClicked(payload: ButtonClickedPayload): void {
    this.buttonHandlers[payload.id]?.()
  }

  private setBubble(descriptor: Omit<BubbleDescriptor, 'visible'>, onComplete?: () => void): void {
    if (onComplete) {
      this.bubbleCompleteHandlers[descriptor.id] = onComplete
    } else {
      delete this.bubbleCompleteHandlers[descriptor.id]
    }
    this.upsertBubble({ ...descriptor, visible: true })
  }

  private revealBubble(id: 'bubble1' | 'bubble2'): void {
    this.activeBubbles = this.activeBubbles.map((bubble) => (bubble.id === id ? { ...bubble, revealed: true } : bubble))
    this.syncBubbles()
  }

  /** Desvanece un bocadillo (sin retirarlo del snapshot) en vez de quitarlo de golpe. */
  private hideBubble(id: 'bubble1' | 'bubble2'): void {
    this.activeBubbles = this.activeBubbles.map((bubble) => (bubble.id === id ? { ...bubble, visible: false } : bubble))
    this.syncBubbles()
  }

  private upsertBubble(descriptor: BubbleDescriptor): void {
    this.activeBubbles = [...this.activeBubbles.filter((bubble) => bubble.id !== descriptor.id), descriptor]
    this.syncBubbles()
  }

  private syncBubbles(): void {
    EventBus.emit(GameEvents.SetBubbles, this.activeBubbles)
  }

  private handleBubbleRevealComplete(payload: BubbleRevealCompletePayload): void {
    this.bubbleCompleteHandlers[payload.id]?.()
  }

  private setActivity1Visible(visible: boolean): void {
    EventBus.emit(GameEvents.SetActivity1, { visible })
  }

  private setActivity2Visible(visible: boolean): void {
    EventBus.emit(GameEvents.SetActivity2, { visible })
  }

  /**
   * La Actividad 1 (chips de conceptos) vive por completo en
   * `Activity1Screen.tsx`; al confirmar, nos avisa de si hubo algún fallo
   * para elegir el texto del bocadillo de feedback y seguir la secuencia
   * habitual (bocadillo -> "Continuar").
   */
  private handleConceptsConfirmed(payload: ConceptsConfirmedPayload): void {
    const feedback = payload.hasWrongSelection ? ACTIVITY1_FEEDBACK_PARTIAL : ACTIVITY1_FEEDBACK_SUCCESS

    this.setBubble(
      {
        id: 'bubble1',
        text: feedback,
        // Bocadillo de feedback: texto completo de una vez, sin dividir en frases.
        sentences: [feedback],
        tailSide: 'left',
        maxWidth: RESULT_CHIPS_FEEDBACK_MAX_WIDTH,
        verticalAnchor: 'bottom',
        horizontalAnchor: 'david',
        revealed: false,
      },
      () => this.showContinueButton(),
    )
    this.time.delayedCall(FADE_DURATION + BUBBLE_DELAY_AFTER_FADE, () => this.revealBubble('bubble1'))
  }

  private syncSceneMetrics(): void {
    EventBus.emit(GameEvents.SceneMetrics, {
      width: this.scale.width,
      height: this.scale.height,
      david: this.davidBounds,
      homeSubtitleBottom: this.homeSubtitleBottom,
    })
  }

  /** Pantalla "Home": portada inicial, título, subtítulo y botón "Empezar el curso". */
  private showHomeIntro(width: number, height: number): void {
    const left = width * HOME_SIDE_MARGIN_RATIO
    const textColumnWidth = width * HOME_TEXT_COLUMN_RATIO - left

    this.homeTitle = this.add
      .text(left, height * HOME_TITLE_TOP_RATIO, HOME_TITLE, {
        fontFamily: FONT_FAMILY,
        fontStyle: 'bold',
        fontSize: `${this.getHomeTitleFontSize(width)}px`,
        color: HOME_TITLE_COLOR,
        lineSpacing: HOME_TITLE_LINE_SPACING,
        wordWrap: { width: textColumnWidth },
        resolution: TEXT_RESOLUTION,
      })
      .setOrigin(0, 0)

    this.homeSubtitle = this.add
      .text(left, this.homeTitle.y + this.homeTitle.height + HOME_SUBTITLE_GAP, HOME_SUBTITLE, {
        fontFamily: FONT_FAMILY,
        fontSize: `${this.getHomeSubtitleFontSize(width)}px`,
        color: HOME_SUBTITLE_COLOR,
        wordWrap: { width: textColumnWidth },
        resolution: TEXT_RESOLUTION,
      })
      .setOrigin(0, 0)

    this.setButton(
      { id: 'start-course', label: 'Empezar el curso', disabled: false, variant: 'home', size: 'default', anchor: 'home-start' },
      () => this.beginTransition(),
    )

    this.homeImage = this.add.image(0, 0, 'portada').setOrigin(0.5)

    this.repositionHomeIntro(width, height)
  }

  private destroyHomeIntro(): void {
    this.hideButton('start-course')
    this.homeTitle?.destroy()
    this.homeTitle = undefined
    this.homeSubtitle?.destroy()
    this.homeSubtitle = undefined
    this.homeImage?.destroy()
    this.homeImage = undefined
    this.homeSubtitleBottom = null
    this.syncSceneMetrics()
  }

  /** Pantalla "Restaurante": fachada exterior, bocadillo de introducción y botón "Entrar al restaurante". */
  private beginTransition(): void {
    this.hideButton('start-course')

    this.cameras.main.fadeOut(FADE_DURATION, 0, 0, 0)
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.destroyHomeIntro()

      // La foto del restaurante no aparece hasta este punto: la portada es
      // una página en blanco sin ella.
      const { width, height } = this.scale
      this.background = this.add.image(width / 2, height / 2, 'restaurante').setOrigin(0.5)
      this.updateBackgroundScale(width, height)

      this.cameras.main.fadeIn(FADE_DURATION, 0, 0, 0)
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
        this.time.delayedCall(BUBBLE_DELAY_AFTER_FADE, () =>
          this.setBubble(
            {
              id: 'bubble1',
              text: INTRO_MESSAGE,
              sentences: INTRO_MESSAGE_SENTENCES,
              tailSide: 'right',
              maxWidth: BUBBLE_MAX_WIDTH,
              verticalAnchor: 'center',
              horizontalAnchor: 'screen',
              revealed: true,
            },
            () => this.showEnterButton(),
          ),
        )
      })
    })
  }

  private showEnterButton(): void {
    this.setButton(
      { id: 'enter-restaurant', label: 'Entrar al restaurante', disabled: false, variant: 'normal', size: 'default', anchor: 'bottom-center' },
      () => {
        EventBus.emit(GameEvents.EnterRestaurant, undefined)
        this.transitionToSala()
      },
    )
  }

  /** Pantalla "Sala": David da la bienvenida, bocadillo de formación y botón "¡Empecemos!". */
  private transitionToSala(): void {
    this.hideButton('enter-restaurant')

    this.cameras.main.fadeOut(FADE_DURATION, 0, 0, 0)
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.hideBubble('bubble1')

      this.background?.setTexture('sala')
      this.updateBackgroundScale(this.scale.width, this.scale.height)
      this.showDavid()

      this.cameras.main.fadeIn(FADE_DURATION, 0, 0, 0)
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
        this.time.delayedCall(BUBBLE_DELAY_AFTER_FADE, () =>
          // El pico de "bocadilloIzq" cuelga hacia la izquierda, en dirección a David.
          this.setBubble(
            {
              id: 'bubble1',
              text: TRAINING_MESSAGE,
              sentences: TRAINING_MESSAGE_SENTENCES,
              tailSide: 'left',
              maxWidth: BUBBLE_MAX_WIDTH,
              verticalAnchor: 'center',
              horizontalAnchor: 'screen',
              revealed: true,
            },
            () => this.showStartTrainingButton(),
          ),
        )
      })
    })
  }

  private showStartTrainingButton(): void {
    this.setButton(
      { id: 'start-training', label: '¡Empecemos!', disabled: false, variant: 'normal', size: 'default', anchor: 'bottom-center' },
      () => {
        EventBus.emit(GameEvents.StartTraining, undefined)
        this.startConceptsActivity()
      },
    )
  }

  /** Pantalla "Actividad 1": chips de conceptos y su resultado, íntegros en Activity1Screen.tsx. */
  private startConceptsActivity(): void {
    this.hideButton('start-training')
    this.hideBubble('bubble1')
    this.setActivity1Visible(true)
  }

  private showContinueButton(): void {
    this.setButton(
      { id: 'continue-feedback', label: 'Continuar', disabled: false, variant: 'normal', size: 'default', anchor: 'bottom-right' },
      () => {
        EventBus.emit(GameEvents.ContinueFromFeedback, undefined)
        this.proceedAfterFeedback()
      },
    )
  }

  /**
   * Botón "Continuar" tras el bocadillo explicativo, en la esquina inferior
   * derecha. Al pulsarlo da paso a la pantalla "Importancia manipulador": el
   * bocadillo de "por qué es importante" y el botón "Seguir a David".
   */
  private showFinalContinueButton(): void {
    this.setButton(
      { id: 'continue-handler-intro', label: 'Continuar', disabled: false, variant: 'normal', size: 'default', anchor: 'bottom-right' },
      () => {
        EventBus.emit(GameEvents.ContinueFromHandlerIntro, undefined)
        this.hideButton('continue-handler-intro')
        this.hideBubble('bubble1')

        this.time.delayedCall(FADE_DURATION + BUBBLE_DELAY_AFTER_FADE, () => {
          this.setBubble(
            {
              id: 'bubble1',
              text: HANDLER_IMPORTANCE_MESSAGE,
              sentences: HANDLER_IMPORTANCE_SENTENCES,
              tailSide: 'left',
              maxWidth: BUBBLE_MAX_WIDTH,
              verticalAnchor: 'center',
              horizontalAnchor: 'davidNear',
              revealed: true,
            },
            () => this.showFollowDavidButton(),
          )
        })
      },
    )
  }

  /** Botón "Seguir a David" en la esquina inferior derecha, tras el bocadillo de importancia. */
  private showFollowDavidButton(): void {
    this.setButton(
      { id: 'follow-david', label: 'Seguir a David', disabled: false, variant: 'normal', size: 'default', anchor: 'bottom-right' },
      () => {
        EventBus.emit(GameEvents.FollowDavid, undefined)
        this.transitionToBarra()
      },
    )
  }

  /** Pantalla "Barra": al pulsar "Seguir a David", fundido a negro, cambio de fondo a la barra y David al lado derecho. */
  private transitionToBarra(): void {
    this.hideButton('follow-david')

    this.cameras.main.fadeOut(FADE_DURATION, 0, 0, 0)
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.hideBubble('bubble1')

      this.background?.setTexture('barra')
      this.updateBackgroundScale(this.scale.width, this.scale.height)
      this.showDavid('right')

      this.cameras.main.fadeIn(FADE_DURATION, 0, 0, 0)
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
        this.time.delayedCall(BUBBLE_DELAY_AFTER_FADE, () =>
          this.setBubble(
            {
              id: 'bubble1',
              text: BARRA_MESSAGE,
              tailSide: 'right',
              maxWidth: BUBBLE_MAX_WIDTH,
              verticalAnchor: 'center',
              horizontalAnchor: 'screen',
              revealed: true,
            },
            () => this.startActivity2(),
          ),
        )
      })
    })
  }

  /** Pantalla "Actividad 2": arrastrar cada tarjeta hasta su categoría, íntegra en Activity2Screen.tsx. */
  private startActivity2(): void {
    this.hideBubble('bubble1')
    this.setActivity2Visible(true)
  }

  /**
   * Pantalla "Definición manipulador": al pulsar "Continuar" en el Resultado 1,
   * la Actividad 1 (chips + bocadillo de feedback) se desvanece (el escenario
   * y David se quedan tal cual) y aparece un único bocadillo explicativo
   * (definición y alcance, frase a frase), seguido del botón "Continuar".
   */
  private proceedAfterFeedback(): void {
    this.hideButton('continue-feedback')
    this.hideBubble('bubble1')
    this.setActivity1Visible(false)

    this.time.delayedCall(FADE_DURATION + BUBBLE_DELAY_AFTER_FADE, () => {
      this.setBubble(
        {
          id: 'bubble1',
          text: HANDLER_DEFINITION_MESSAGE,
          sentences: HANDLER_DEFINITION_SENTENCES,
          tailSide: 'left',
          maxWidth: BUBBLE_MAX_WIDTH,
          verticalAnchor: 'center',
          horizontalAnchor: 'davidNear',
          revealed: true,
        },
        () => this.showFinalContinueButton(),
      )
    })
  }

  /** Destruye cualquier David previo antes de crear el nuevo: nunca debe haber dos a la vez. */
  private showDavid(side: DavidSide = 'left'): void {
    this.davidImage?.destroy()
    this.davidSide = side
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

    const { width } = this.scale
    const x =
      this.davidSide === 'right'
        ? width - DAVID_SIDE_MARGIN - this.davidImage.displayWidth / 2
        : DAVID_SIDE_MARGIN + this.davidImage.displayWidth / 2
    const y = height - DAVID_BOTTOM_MARGIN
    this.davidImage.setPosition(x, y)

    this.davidBounds = {
      x: x - this.davidImage.displayWidth / 2,
      y: y - this.davidImage.displayHeight,
      width: this.davidImage.displayWidth,
      height: this.davidImage.displayHeight,
    }
    this.syncSceneMetrics()
  }

  private getHomeTitleFontSize(width: number): number {
    return Phaser.Math.Clamp(width * HOME_TITLE_FONT_RATIO, HOME_TITLE_FONT_MIN, HOME_TITLE_FONT_MAX)
  }

  private getHomeSubtitleFontSize(width: number): number {
    return Phaser.Math.Clamp(width * HOME_SUBTITLE_FONT_RATIO, HOME_SUBTITLE_FONT_MIN, HOME_SUBTITLE_FONT_MAX)
  }

  private repositionHomeIntro(width: number, height: number): void {
    const left = width * HOME_SIDE_MARGIN_RATIO
    const textColumnWidth = width * HOME_TEXT_COLUMN_RATIO - left

    this.homeTitle
      ?.setPosition(left, height * HOME_TITLE_TOP_RATIO)
      .setFontSize(this.getHomeTitleFontSize(width))
      .setWordWrapWidth(textColumnWidth)

    if (this.homeTitle && this.homeSubtitle) {
      this.homeSubtitle
        .setPosition(left, this.homeTitle.y + this.homeTitle.height + HOME_SUBTITLE_GAP)
        .setFontSize(this.getHomeSubtitleFontSize(width))
        .setWordWrapWidth(textColumnWidth)
      this.homeSubtitleBottom = this.homeSubtitle.y + this.homeSubtitle.height
    } else {
      this.homeSubtitleBottom = null
    }

    if (this.homeImage) {
      // Pegada a la esquina inferior derecha: sin margen a la derecha ni abajo.
      const imageLeft = width * (HOME_TEXT_COLUMN_RATIO + HOME_IMAGE_LEFT_GAP_RATIO)
      const imageTop = height * HOME_IMAGE_TOP_RATIO
      const areaWidth = Math.max(1, width - imageLeft)
      const areaHeight = Math.max(1, height * HOME_IMAGE_BOTTOM_RATIO - imageTop)

      const scale = Math.min(areaWidth / this.homeImage.width, areaHeight / this.homeImage.height)
      this.homeImage.setOrigin(1, 1).setScale(scale)
      this.homeImage.setPosition(width, height * HOME_IMAGE_BOTTOM_RATIO)
    }

    this.syncSceneMetrics()
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    const { width, height } = gameSize

    this.background?.setPosition(width / 2, height / 2)
    this.updateBackgroundScale(width, height)
    this.positionDavid(height)
    this.repositionHomeIntro(width, height)
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
    EventBus.off(GameEvents.ButtonClicked, this.handleButtonClicked, this)
    EventBus.off(GameEvents.BubbleRevealComplete, this.handleBubbleRevealComplete, this)
    EventBus.off(GameEvents.ConceptsConfirmed, this.handleConceptsConfirmed, this)
  }
}
