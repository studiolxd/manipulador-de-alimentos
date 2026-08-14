import type { Scene } from 'phaser'

/**
 * Identificadores centralizados de los eventos que viajan por el EventBus.
 * Añade aquí una nueva entrada por cada evento nuevo entre React y Phaser.
 */
export const GameEvents = {
  CurrentSceneReady: 'current-scene-ready',
  EnterRestaurant: 'enter-restaurant',
  StartTraining: 'start-training',
  ContinueFromFeedback: 'continue-from-feedback',
  FollowDavid: 'follow-david',
  FollowDavidToKitchen: 'follow-david-to-kitchen',
  StartKitchenTask: 'start-kitchen-task',
  // Phaser -> React: qué botones/bocadillos mostrar y con qué métricas de
  // escena posicionarlos. Phaser sigue siendo el dueño de la orquestación;
  // React solo renderiza el último snapshot recibido de cada uno.
  SetButtons: 'set-buttons',
  SetBubbles: 'set-bubbles',
  SceneMetrics: 'scene-metrics',
  // Pantallas de actividad completas (Actividad 1 y 2, con sus resultados):
  // Phaser solo dice cuándo se muestran/ocultan, todo lo demás (datos,
  // selección, drag & drop, resultado) lo gestiona el propio componente.
  SetActivity1: 'set-activity1',
  SetActivity2: 'set-activity2',
  // Activa los tres platos de la Encimera como botones + indicación de
  // seleccionar uno.
  SetCounterSelect: 'set-counter-select',
  // React -> Phaser: interacción del jugador con los elementos que ahora
  // vive en el DOM, y datos medidos en el DOM que Phaser necesita (p.ej.
  // para colocar los chips de resultado por encima de un bocadillo).
  ButtonClicked: 'button-clicked',
  BubbleRevealComplete: 'bubble-reveal-complete',
  BubbleBoundsReport: 'bubble-bounds-report',
  ConceptsConfirmed: 'concepts-confirmed',
  Activity2Confirmed: 'activity2-confirmed',
} as const

export interface CurrentSceneReadyPayload {
  scene: Scene
}

export type ButtonAnchor = 'bottom-center' | 'bottom-right' | 'bottom-left' | 'home-start'
export type ButtonVariant = 'normal' | 'home' | 'confirm'
export type ButtonSize = 'default' | 'compact'

export interface ButtonDescriptor {
  id: string
  label: string
  disabled: boolean
  // false = retirado, se desvanece y deja de responder a clics (mismo
  // ritmo que los fundidos de pantalla completa) en vez de desaparecer de
  // golpe. Los botones no se eliminan del snapshot: se ocultan.
  visible: boolean
  variant: ButtonVariant
  size: ButtonSize
  anchor: ButtonAnchor
}

export type BubbleVerticalAnchor = 'center' | 'top' | 'bottom'
// 'screen' centra en toda la pantalla; 'david' centra en el hueco libre a la
// derecha de David; 'davidNear' se pega a su borde derecho.
export type BubbleHorizontalAnchor = 'screen' | 'david' | 'davidNear'

// Hacia qué lado cuelga el pico del bocadillo (dibujado con CSS): 'left'
// cuando David/el punto de referencia queda a la izquierda, 'right' cuando
// queda a la derecha.
export type BubbleTailSide = 'left' | 'right'

export interface BubbleDescriptor {
  id: 'bubble1' | 'bubble2'
  text: string
  // División manual del texto en frases para la máquina de escribir (ver
  // useSentenceTypewriter): cada una se escribe, se deja leída y se borra
  // para dar paso a la siguiente. Si se omite, se deriva automáticamente de
  // `text` partiendo por ".". Pasar un único elemento (el propio `text`)
  // muestra el texto completo de una vez, sin dividir ni ciclar.
  sentences?: string[]
  tailSide: BubbleTailSide
  maxWidth: number
  verticalAnchor: BubbleVerticalAnchor
  horizontalAnchor: BubbleHorizontalAnchor
  // false = montado/medido pero invisible (equivalente al antiguo
  // `startHidden`); true = revelar (o ya revelado) con máquina de escribir.
  revealed: boolean
  // false = retirado, se desvanece igual que el resto de la pantalla en
  // vez de desaparecer de golpe. Independiente de `revealed`.
  visible: boolean
}

export interface DavidBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface SceneMetricsPayload {
  width: number
  height: number
  david: DavidBounds | null
  // Borde inferior real del subtítulo de la portada (Phaser Text), en px de
  // escena. Solo el botón "Empezar el curso" lo necesita, para colocarse
  // justo debajo sin duplicar la lógica de word-wrap del título en React.
  homeSubtitleBottom: number | null
}

export interface ButtonClickedPayload {
  id: string
}

export interface BubbleRevealCompletePayload {
  id: 'bubble1' | 'bubble2'
}

export interface BubbleBoundsReportPayload {
  id: 'bubble1' | 'bubble2'
  topEdge: number
}

export interface SetActivityPayload {
  visible: boolean
}

export interface ConceptsConfirmedPayload {
  hasWrongSelection: boolean
  hasMissedCorrect: boolean
}

export interface Activity2ConfirmedPayload {
  allCorrect: boolean
}

/** Mapa evento -> payload, usado por EventBus para tipar emit/on/off sin `any`. */
export interface GameEventPayloads {
  [GameEvents.CurrentSceneReady]: CurrentSceneReadyPayload
  [GameEvents.EnterRestaurant]: undefined
  [GameEvents.StartTraining]: undefined
  [GameEvents.ContinueFromFeedback]: undefined
  [GameEvents.FollowDavid]: undefined
  [GameEvents.FollowDavidToKitchen]: undefined
  [GameEvents.StartKitchenTask]: undefined
  [GameEvents.SetButtons]: ButtonDescriptor[]
  [GameEvents.SetBubbles]: BubbleDescriptor[]
  [GameEvents.SceneMetrics]: SceneMetricsPayload
  [GameEvents.SetActivity1]: SetActivityPayload
  [GameEvents.SetActivity2]: SetActivityPayload
  [GameEvents.SetCounterSelect]: SetActivityPayload
  [GameEvents.ButtonClicked]: ButtonClickedPayload
  [GameEvents.BubbleRevealComplete]: BubbleRevealCompletePayload
  [GameEvents.BubbleBoundsReport]: BubbleBoundsReportPayload
  [GameEvents.ConceptsConfirmed]: ConceptsConfirmedPayload
  [GameEvents.Activity2Confirmed]: Activity2ConfirmedPayload
}
