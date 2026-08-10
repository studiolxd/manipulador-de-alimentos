import type { SceneMetricsPayload } from '../../game/events/eventTypes'
import { RESULT_CHIPS_LEFT_GAP, RESULT_CHIPS_RIGHT_MARGIN } from '../../game/config/uiConstants'

/** Borde derecho de David en px de escena (0 si David no está en pantalla todavía). */
export const getDavidRightEdge = (metrics: SceneMetricsPayload): number =>
  metrics.david ? metrics.david.x + metrics.david.width : 0

/**
 * Hueco libre a la derecha de David, usado tanto por los bocadillos anclados
 * a `horizontalAnchor:'david'` (`SpeechBubble`) como por los chips de
 * resultado de la Actividad 1: mismo margen a cada lado en ambos casos.
 */
export const getDavidGapZone = (metrics: SceneMetricsPayload): { left: number; right: number; centerX: number } => {
  const left = getDavidRightEdge(metrics) + RESULT_CHIPS_LEFT_GAP
  const right = metrics.width - RESULT_CHIPS_RIGHT_MARGIN
  return { left, right, centerX: (left + right) / 2 }
}
