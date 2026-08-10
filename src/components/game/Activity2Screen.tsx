import { useEffect, useRef, useState } from 'react'
import { EventBus } from '../../game/events/EventBus'
import { GameEvents } from '../../game/events/eventTypes'
import type { SetActivityPayload } from '../../game/events/eventTypes'
import {
  COLOR_CHIP_SELECTED_CORRECT_FILL,
  COLOR_CHIP_SELECTED_CORRECT_TEXT,
  COLOR_CHIP_SELECTED_INCORRECT_FILL,
  COLOR_CHIP_SELECTED_INCORRECT_TEXT,
  FADE_DURATION,
} from '../../game/config/uiConstants'
import { ACTIVITY2_CARD_DEFS, ACTIVITY2_CATEGORIES, ACTIVITY2_INSTRUCTION } from '../../game/data/activities'
import type { Activity2Category } from '../../game/data/activities'
import { clampSize } from '../../game/utils'
import { NavButton } from './NavButton'
import { useSceneMetrics } from './useSceneMetrics'
import styles from './Activity2Screen.module.css'

const INSTRUCTION_FONT_RATIO = 0.014
const INSTRUCTION_FONT_MIN = 14
const INSTRUCTION_FONT_MAX = 18
const PULSE_DURATION = 180
const SNAP_BACK_DURATION = 200

interface Activity2CardState {
  id: string
  label: string
  category: Activity2Category
  placedIn: Activity2Category | null
}

const createInitialCards = (): Activity2CardState[] =>
  ACTIVITY2_CARD_DEFS.map((def) => ({ id: def.label, label: def.label, category: def.category, placedIn: null }))

const RESET_BUTTON = { id: 'activity2-reset', label: 'Comenzar de nuevo', variant: 'normal' as const, size: 'compact' as const, anchor: 'bottom-left' as const }
const CONFIRM_BUTTON = { id: 'confirm-activity2', label: 'Confirmar', variant: 'confirm' as const, size: 'compact' as const, anchor: 'bottom-right' as const }

const getPlacementColors = (correct: boolean): [string, string] =>
  correct
    ? [COLOR_CHIP_SELECTED_CORRECT_FILL, COLOR_CHIP_SELECTED_CORRECT_TEXT]
    : [COLOR_CHIP_SELECTED_INCORRECT_FILL, COLOR_CHIP_SELECTED_INCORRECT_TEXT]

/**
 * Pantalla "Actividad 2": arrastrar cada tarjeta a su categoría (Pointer
 * Events + `transform`, sin sacar la tarjeta del flujo mientras se
 * arrastra). El feedback es inmediato: la tarjeta se colorea de verde/rojo
 * en cuanto se suelta sobre una categoría, sin esperar a confirmar. Tras
 * confirmar se pasa a las mismas columnas ya coloreadas. Autocontenida: una
 * vez visible no necesita nada más de Phaser (no hay pantalla después).
 */
export const Activity2Screen = () => {
  const metrics = useSceneMetrics()
  const [visible, setVisible] = useState(false)
  const [cards, setCards] = useState<Activity2CardState[]>(createInitialCards)
  const [phase, setPhase] = useState<'dragging' | 'result'>('dragging')
  const [fadingOut, setFadingOut] = useState(false)
  const [resultFadeIn, setResultFadeIn] = useState(false)
  const [pulsingCategory, setPulsingCategory] = useState<Activity2Category | null>(null)

  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const dragOrigin = useRef<{ id: string; x: number; y: number } | null>(null)
  const phaseTimeoutRef = useRef<number | undefined>(undefined)
  const pulseTimeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const handleSetActivity2 = (payload: SetActivityPayload) => setVisible(payload.visible)
    EventBus.on(GameEvents.SetActivity2, handleSetActivity2)
    return () => {
      EventBus.off(GameEvents.SetActivity2, handleSetActivity2)
      window.clearTimeout(phaseTimeoutRef.current)
      window.clearTimeout(pulseTimeoutRef.current)
    }
  }, [])

  // Sin efecto de reinicio al pasar `visible` a true: esta pantalla solo se
  // muestra una vez por partida, así que los valores iniciales de useState
  // ya son los correctos.

  useEffect(() => {
    if (phase === 'result') {
      const raf = requestAnimationFrame(() => setResultFadeIn(true))
      return () => cancelAnimationFrame(raf)
    }
  }, [phase])

  if (!metrics) {
    return null
  }

  const pulseCategory = (category: Activity2Category) => {
    setPulsingCategory(category)
    window.clearTimeout(pulseTimeoutRef.current)
    pulseTimeoutRef.current = window.setTimeout(() => setPulsingCategory(null), PULSE_DURATION)
  }

  const findCategoryAt = (x: number, y: number): Activity2Category | null => {
    for (const def of ACTIVITY2_CATEGORIES) {
      const el = categoryRefs.current[def.key]
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return def.key
      }
    }
    return null
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>, id: string) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragOrigin.current = { id, x: event.clientX, y: event.clientY }
    event.currentTarget.classList.add(styles.dragging)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>, id: string) => {
    if (!dragOrigin.current || dragOrigin.current.id !== id) {
      return
    }
    const el = cardRefs.current[id]
    if (!el) {
      return
    }
    const dx = event.clientX - dragOrigin.current.x
    const dy = event.clientY - dragOrigin.current.y
    el.style.transform = `translate(${dx}px, ${dy}px)`
  }

  const endDrag = (id: string) => {
    const el = cardRefs.current[id]
    dragOrigin.current = null
    if (!el) {
      return
    }
    el.classList.remove(styles.dragging)

    const rect = el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const targetCategory = findCategoryAt(centerX, centerY)

    if (targetCategory) {
      el.style.transform = ''
      setCards((prev) => prev.map((card) => (card.id === id ? { ...card, placedIn: targetCategory } : card)))
      pulseCategory(targetCategory)
      return
    }

    el.style.transition = `transform ${SNAP_BACK_DURATION}ms ease`
    el.style.transform = 'translate(0px, 0px)'
    window.setTimeout(() => {
      el.style.transition = ''
    }, SNAP_BACK_DURATION)
  }

  const handlePointerUp = (_event: React.PointerEvent<HTMLButtonElement>, id: string) => {
    if (!dragOrigin.current || dragOrigin.current.id !== id) {
      return
    }
    endDrag(id)
  }

  const handleReset = () => {
    setCards(createInitialCards())
  }

  const allPlaced = cards.every((card) => card.placedIn !== null)

  const handleConfirm = () => {
    setFadingOut(true)
    phaseTimeoutRef.current = window.setTimeout(() => setPhase('result'), FADE_DURATION)
  }

  const instructionFontSize = clampSize(metrics.width, INSTRUCTION_FONT_RATIO, INSTRUCTION_FONT_MIN, INSTRUCTION_FONT_MAX)
  const unplacedCards = cards.filter((card) => card.placedIn === null)

  return (
    <div className={styles.root} style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? undefined : 'none' }}>
      <div className={styles.veil} />

      {phase === 'dragging' && (
        <div
          className={styles.dragging}
          style={{ opacity: fadingOut ? 0 : 1, pointerEvents: visible && !fadingOut ? 'auto' : 'none' }}
        >
          <p className={styles.instruction} style={{ fontSize: `${instructionFontSize}px` }}>
            {ACTIVITY2_INSTRUCTION}
          </p>
          <div className={styles.categoriesRow}>
            {ACTIVITY2_CATEGORIES.map((def) => (
              <div
                key={def.key}
                ref={(el) => {
                  categoryRefs.current[def.key] = el
                }}
                className={styles.categoryColumn}
              >
                <div className={`${styles.category} ${pulsingCategory === def.key ? styles.pulsing : ''}`}>
                  {def.label}
                </div>
                <div className={styles.placedCards}>
                  {cards
                    .filter((card) => card.placedIn === def.key)
                    .map((card) => {
                      const [fill, textColor] = getPlacementColors(card.category === card.placedIn)
                      return (
                        <div key={card.id} className={styles.placedCard} style={{ backgroundColor: fill, color: textColor }}>
                          {card.label}
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
          {/* Orden invertido: la primera tarjeta pendiente (siguiente a coger)
              es la última en el DOM, así queda pintada encima y tapa del todo
              al resto de la pila (mismo sitio exacto, ver `.cardStack` en
              Activity2Screen.module.css). Solo se ve una tarjeta cada vez. */}
          <div className={styles.cardStack}>
            {[...unplacedCards].reverse().map((card) => (
              <button
                key={card.id}
                type="button"
                ref={(el) => {
                  cardRefs.current[card.id] = el
                }}
                className={styles.card}
                onPointerDown={(event) => handlePointerDown(event, card.id)}
                onPointerMove={(event) => handlePointerMove(event, card.id)}
                onPointerUp={(event) => handlePointerUp(event, card.id)}
                onPointerCancel={(event) => handlePointerUp(event, card.id)}
              >
                {card.label}
              </button>
            ))}
          </div>
          <NavButton button={{ ...RESET_BUTTON, disabled: false, visible: visible && !fadingOut }} onClick={handleReset} />
          <NavButton
            button={{ ...CONFIRM_BUTTON, disabled: !allPlaced, visible: visible && !fadingOut }}
            onClick={handleConfirm}
          />
        </div>
      )}

      {phase === 'result' && (
        <div className={styles.result} style={{ opacity: resultFadeIn ? 1 : 0 }}>
          {ACTIVITY2_CATEGORIES.map((def) => (
            <div key={def.key} className={styles.resultColumn}>
              <div className={styles.category}>{def.label}</div>
              <div className={styles.resultCards}>
                {cards
                  .filter((card) => card.placedIn === def.key)
                  .map((card) => {
                    const [fill, textColor] = getPlacementColors(card.category === card.placedIn)
                    return (
                      <div key={card.id} className={styles.resultCard} style={{ backgroundColor: fill, color: textColor }}>
                        {card.label}
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
