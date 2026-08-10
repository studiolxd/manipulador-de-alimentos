/**
 * Constantes compartidas entre Phaser (MainScene) y los componentes React
 * que dibujan los botones y bocadillos fuera del canvas. Vive aquí en vez de
 * en MainScene.ts porque ambos lados deben coincidir píxel a píxel.
 */

export const FONT_FAMILY = "'Poppins', sans-serif"

// Colores de botones (variant 'normal': naranja claro -> burdeos al hover).
export const COLOR_BUTTON_FILL = '#f2c584'
export const COLOR_BUTTON_FILL_HOVER = '#9e4d4c'
export const COLOR_BUTTON_TEXT_NORMAL = '#000000'
export const COLOR_BUTTON_TEXT_HOVER = '#ffffff'

// variant 'home' y variant 'confirm' (estado enabled) usan el mismo par,
// invertido respecto a 'normal': empiezan en burdeos y pasan a naranja.
export const COLOR_CONFIRM_FILL_DISABLED = '#d9d9d9'
export const COLOR_CONFIRM_TEXT_DISABLED = '#5a5a5a'

export const BUBBLE_TEXT_COLOR = '#2b2b2b'
export const HOME_BG_COLOR = '#ffffff'
export const HOME_TITLE_COLOR = '#9e4d4c'
export const HOME_SUBTITLE_COLOR = '#1a1a1a'

// Colores de los chips de resultado (Actividad 1 y 2): dependen de si la
// palabra/tarjeta fue seleccionada, no solo de si es correcta. Las no
// seleccionadas se quedan neutras (gris).
export const COLOR_CHIP_SELECTED_CORRECT_FILL = '#75a362'
export const COLOR_CHIP_SELECTED_CORRECT_TEXT = '#ffffff'
export const COLOR_CHIP_SELECTED_INCORRECT_FILL = '#de605b'
export const COLOR_CHIP_SELECTED_INCORRECT_TEXT = '#ffffff'
// Correcta pero no marcada: verde pálido, para señalar "esto también era
// correcto" sin confundirlo con un acierto (verde sólido) ni dejarlo neutro.
export const COLOR_CHIP_MISSED_CORRECT_FILL = '#dcead3'
export const COLOR_CHIP_MISSED_CORRECT_TEXT = '#4d7a3c'
export const COLOR_CHIP_NEUTRAL_FILL = '#d4d4d4'
export const COLOR_CHIP_NEUTRAL_TEXT = '#8a8a8a'

// Velo blanco semitransparente sobre el escenario durante las actividades.
export const ACTIVITY_OVERLAY_ALPHA = 0.78

// Tamaños de botón.
export const BUTTON_SIZE_DEFAULT = { width: 210, height: 56, fontSize: 22, horizontalPadding: 32 }
export const BUTTON_SIZE_COMPACT = { width: 150, height: 42, fontSize: 16, horizontalPadding: 20 }

// Márgenes de anclaje (consistentes en todo el juego: 60px horizontal, 40px vertical).
export const BUTTON_SIDE_MARGIN = 60
export const BUTTON_BOTTOM_MARGIN = 40

// Duraciones.
export const FADE_DURATION = 600
export const BUBBLE_DELAY_AFTER_FADE = 700
export const TYPEWRITER_DELAY = 55
export const BUTTON_HOVER_TRANSITION_MS = 150

// Pantalla "Home".
export const HOME_SIDE_MARGIN_RATIO = 0.09
export const HOME_BUTTON_TOP_GAP = 32

// El bocadillo se dibuja con CSS (borde + relleno + "pico"), no con una
// imagen: así se adapta a cualquier ancho/alto de texto sin escalar nada.
// Ver SpeechBubble.module.css para la forma del pico.
export const BUBBLE_BORDER_WIDTH = 2

export const BUBBLE_MAX_WIDTH = 520
export const BUBBLE_PADDING = 26
export const BUBBLE_CENTER_Y_RATIO = 0.5
export const BUBBLE_TOP_MARGIN = 40
export const BUBBLE_BOTTOM_MARGIN = 110

export const HANDLER_BUBBLE_DAVID_GAP = 40

export const RESULT_CHIPS_LEFT_GAP = 28
export const RESULT_CHIPS_RIGHT_MARGIN = 40
export const RESULT_CHIPS_FEEDBACK_MAX_WIDTH = 380

/** '#f2c584' -> 0xf2c584, para usar los mismos colores en `fillStyle`/`setFillStyle` de Phaser. */
export const toPhaserColor = (hex: string): number => parseInt(hex.replace('#', ''), 16)
