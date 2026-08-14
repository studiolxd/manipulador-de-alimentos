import { useEffect, useRef, useState } from 'react'
import { EventBus } from '../../game/events/EventBus'
import { GameEvents } from '../../game/events/eventTypes'
import type { BubbleBoundsReportPayload, ButtonDescriptor, SetActivityPayload } from '../../game/events/eventTypes'
import {
  COLOR_CHIP_MISSED_CORRECT_FILL,
  COLOR_CHIP_MISSED_CORRECT_TEXT,
  COLOR_CHIP_NEUTRAL_FILL,
  COLOR_CHIP_NEUTRAL_TEXT,
  COLOR_CHIP_SELECTED_CORRECT_FILL,
  COLOR_CHIP_SELECTED_CORRECT_TEXT,
  COLOR_CHIP_SELECTED_INCORRECT_FILL,
  COLOR_CHIP_SELECTED_INCORRECT_TEXT,
  FADE_DURATION,
} from '../../game/config/uiConstants'
import { ACTIVITY1_SUBTITLE, ACTIVITY1_TITLE, CONCEPTS } from '../../game/data/activities'
import { clampSize } from '../../game/utils'
import { getDavidGapZone } from './anchors'
import { NavButton } from './NavButton'
import { useSceneMetrics } from './useSceneMetrics'
import styles from './Activity1Screen.module.css'

const TITLE_FONT_RATIO = 0.04
const TITLE_FONT_MIN = 30
const TITLE_FONT_MAX = 54
const SUBTITLE_FONT_RATIO = 0.014
const SUBTITLE_FONT_MIN = 14
const SUBTITLE_FONT_MAX = 18

const RESULT_CHIPS_ZONE_TOP_MARGIN = 60
// Espacio entre la última fila de chips y el borde superior real del
// bocadillo (que reporta su propio tamaño vía BubbleBoundsReport).
const RESULT_CHIPS_BUBBLE_GAP = 30

interface ConceptResult {
  label: string
  correct: boolean
  selected: boolean
}

const getResultChipColors = (correct: boolean, selected: boolean): [string, string] => {
  if (selected) {
    return correct
      ? [COLOR_CHIP_SELECTED_CORRECT_FILL, COLOR_CHIP_SELECTED_CORRECT_TEXT]
      : [COLOR_CHIP_SELECTED_INCORRECT_FILL, COLOR_CHIP_SELECTED_INCORRECT_TEXT]
  }
  return correct
    ? [COLOR_CHIP_MISSED_CORRECT_FILL, COLOR_CHIP_MISSED_CORRECT_TEXT]
    : [COLOR_CHIP_NEUTRAL_FILL, COLOR_CHIP_NEUTRAL_TEXT]
}

const CONFIRM_BUTTON: Omit<ButtonDescriptor, 'disabled' | 'visible'> = {
  id: 'confirm-activity1',
  label: 'Confirmar selección',
  variant: 'confirm',
  size: 'compact',
  anchor: 'bottom-right',
}

/**
 * Pantalla "Actividad 1": chips de conceptos seleccionables y, tras
 * confirmar, los chips de resultado coloreados sobre el bocadillo de
 * feedback (que sigue siendo responsabilidad de MainScene). Visibilidad
 * controlada por Phaser vía `GameEvents.SetActivity1`; todo lo demás
 * (selección, resultado, posicionamiento) es estado local de React.
 */
export const Activity1Screen = () => {
  const metrics = useSceneMetrics()
  const [visible, setVisible] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [phase, setPhase] = useState<'selecting' | 'result'>('selecting')
  const [fadingOut, setFadingOut] = useState(false)
  const [results, setResults] = useState<ConceptResult[] | null>(null)
  const [bubble1TopEdge, setBubble1TopEdge] = useState<number | null>(null)
  const phaseTimeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const handleSetActivity1 = (payload: SetActivityPayload) => setVisible(payload.visible)
    const handleBounds = (payload: BubbleBoundsReportPayload) => {
      if (payload.id === 'bubble1') {
        setBubble1TopEdge(payload.topEdge)
      }
    }

    EventBus.on(GameEvents.SetActivity1, handleSetActivity1)
    EventBus.on(GameEvents.BubbleBoundsReport, handleBounds)
    return () => {
      EventBus.off(GameEvents.SetActivity1, handleSetActivity1)
      EventBus.off(GameEvents.BubbleBoundsReport, handleBounds)
      window.clearTimeout(phaseTimeoutRef.current)
    }
  }, [])

  // Sin efecto de reinicio al pasar `visible` a true: esta pantalla solo se
  // muestra una vez por partida, así que los valores iniciales de useState
  // ya son los correctos.

  if (!metrics) {
    return null
  }

  const toggleConcept = (label: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(label)) {
        next.delete(label)
      } else {
        next.add(label)
      }
      return next
    })
  }

  const handleConfirm = () => {
    const confirmedResults = CONCEPTS.map((concept) => ({
      label: concept.label,
      correct: concept.correct,
      selected: selected.has(concept.label),
    }))
    const hasWrongSelection = confirmedResults.some((result) => result.selected && !result.correct)
    const hasMissedCorrect = confirmedResults.some((result) => result.correct && !result.selected)

    EventBus.emit(GameEvents.ConceptsConfirmed, { hasWrongSelection, hasMissedCorrect })
    setResults(confirmedResults)
    setFadingOut(true)
    phaseTimeoutRef.current = window.setTimeout(() => setPhase('result'), FADE_DURATION)
  }

  const titleFontSize = clampSize(metrics.width, TITLE_FONT_RATIO, TITLE_FONT_MIN, TITLE_FONT_MAX)
  const subtitleFontSize = clampSize(metrics.width, SUBTITLE_FONT_RATIO, SUBTITLE_FONT_MIN, SUBTITLE_FONT_MAX)

  const zone = getDavidGapZone(metrics)
  const zoneWidth = Math.max(120, zone.right - zone.left)
  const zoneBottomCss =
    bubble1TopEdge !== null ? metrics.height - (bubble1TopEdge - RESULT_CHIPS_BUBBLE_GAP) : null

  return (
    <div className={styles.root} style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? undefined : 'none' }}>
      {phase === 'selecting' && <div className={styles.veil} />}

      {phase === 'selecting' && (
        <div
          className={styles.selecting}
          style={{ opacity: fadingOut ? 0 : 1, pointerEvents: visible && !fadingOut ? 'auto' : 'none' }}
        >
          <h2 className={styles.title} style={{ fontSize: `${titleFontSize}px` }}>
            {ACTIVITY1_TITLE}
          </h2>
          <p className={styles.subtitle} style={{ fontSize: `${subtitleFontSize}px` }}>
            {ACTIVITY1_SUBTITLE}
          </p>
          <div className={styles.chipsRow}>
            {CONCEPTS.map((concept) => (
              <button
                key={concept.label}
                type="button"
                className={`${styles.chip} ${selected.has(concept.label) ? styles.selected : ''}`}
                onClick={() => toggleConcept(concept.label)}
              >
                {concept.label}
              </button>
            ))}
          </div>
          <NavButton
            button={{ ...CONFIRM_BUTTON, disabled: selected.size === 0, visible: visible && !fadingOut }}
            onClick={handleConfirm}
          />
        </div>
      )}

      {visible && phase === 'result' && results && zoneBottomCss !== null && (
        <div
          className={styles.resultZone}
          style={{
            left: `${zone.left}px`,
            width: `${zoneWidth}px`,
            top: `${RESULT_CHIPS_ZONE_TOP_MARGIN}px`,
            bottom: `${zoneBottomCss}px`,
          }}
        >
          {results.map((result) => {
            const [fill, textColor] = getResultChipColors(result.correct, result.selected)
            return (
              <span key={result.label} className={styles.resultChip} style={{ backgroundColor: fill, color: textColor }}>
                {result.label}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
