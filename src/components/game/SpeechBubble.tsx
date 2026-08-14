import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { BubbleDescriptor, SceneMetricsPayload } from '../../game/events/eventTypes'
import { GameEvents } from '../../game/events/eventTypes'
import { EventBus } from '../../game/events/EventBus'
import {
  BUBBLE_BORDER_WIDTH,
  BUBBLE_PADDING,
  BUBBLE_TOP_MARGIN,
  BUBBLE_BOTTOM_MARGIN,
  BUBBLE_CENTER_Y_RATIO,
  HANDLER_BUBBLE_DAVID_GAP,
  RESULT_CHIPS_RIGHT_MARGIN,
  TYPEWRITER_DELAY,
} from '../../game/config/uiConstants'
import { splitSentences } from '../../game/utils'
import { getDavidGapZone, getDavidRightEdge } from './anchors'
import { useSentenceTypewriter } from './useSentenceTypewriter'
import styles from './SpeechBubble.module.css'

interface SpeechBubbleProps {
  bubble: BubbleDescriptor
  metrics: SceneMetricsPayload
}

interface BubbleLayout {
  boxCenterX: number
  boxCenterY: number
  contentWidth: number
  contentHeight: number
}

/** Puerto de getBubbleAnchorX/getDavidRelativeCenterX/getDavidNearCenterX (antes en MainScene.ts). */
const getBubbleAnchorX = (bubble: BubbleDescriptor, metrics: SceneMetricsPayload, outerWidth: number): number => {
  if (bubble.horizontalAnchor === 'david') {
    return getDavidGapZone(metrics).centerX
  }
  if (bubble.horizontalAnchor === 'davidNear') {
    const idealCenterX = getDavidRightEdge(metrics) + HANDLER_BUBBLE_DAVID_GAP + outerWidth / 2
    // Sin este tope, en pantallas estrechas el borde derecho del bocadillo
    // puede acabar fuera del viewport y provocar scroll horizontal.
    const maxCenterX = metrics.width - RESULT_CHIPS_RIGHT_MARGIN - outerWidth / 2
    return Math.min(idealCenterX, maxCenterX)
  }
  return metrics.width / 2
}

/** Puerto de getBubbleCenterY (antes en MainScene.ts). */
const getBubbleCenterY = (bubble: BubbleDescriptor, metrics: SceneMetricsPayload, outerHeight: number): number => {
  if (bubble.verticalAnchor === 'top') {
    return BUBBLE_TOP_MARGIN + outerHeight / 2
  }
  if (bubble.verticalAnchor === 'bottom') {
    return metrics.height - BUBBLE_BOTTOM_MARGIN - outerHeight / 2
  }
  return metrics.height * BUBBLE_CENTER_Y_RATIO
}

/**
 * Bocadillo de diálogo con máquina de escribir, dibujado con CSS (borde +
 * relleno + pico, ver SpeechBubble.module.css) en vez de una imagen: se
 * adapta a cualquier ancho/alto de texto sin escalar nada. El texto se
 * muestra frase a frase (ver useSentenceTypewriter): cada frase se escribe
 * y se queda en pantalla hasta que el usuario pide avanzar (Enter o clic en
 * cualquier sitio), momento en el que se borra y empieza la siguiente. El
 * alto de la caja se mide (oculto) para las frases por separado y se fija
 * al de la más alta, para que no cambie de tamaño al pasar de una a otra.
 */
export const SpeechBubble = ({ bubble, metrics }: SpeechBubbleProps) => {
  const measureRefs = useRef<(HTMLDivElement | null)[]>([])
  const [layout, setLayout] = useState<BubbleLayout | null>(null)
  const reportedCompleteRef = useRef(false)

  const sentences = useMemo(
    () => bubble.sentences ?? splitSentences(bubble.text),
    [bubble.text, bubble.sentences],
  )

  const desiredOuterWidth = Math.min(metrics.width * 0.85, bubble.maxWidth)
  const contentWidth = desiredOuterWidth - (BUBBLE_PADDING + BUBBLE_BORDER_WIDTH) * 2

  useLayoutEffect(() => {
    // El alto de la caja se fija con la frase más alta de todas: así el
    // bocadillo no cambia de tamaño al pasar de una frase a otra.
    const contentHeight = measureRefs.current.reduce(
      (max, el) => Math.max(max, el?.getBoundingClientRect().height ?? 0),
      0,
    )
    const outerHeight = contentHeight + (BUBBLE_PADDING + BUBBLE_BORDER_WIDTH) * 2

    const boxCenterX = getBubbleAnchorX(bubble, metrics, desiredOuterWidth)
    const boxCenterY = getBubbleCenterY(bubble, metrics, outerHeight)

    setLayout({ boxCenterX, boxCenterY, contentWidth, contentHeight })

    EventBus.emit(GameEvents.BubbleBoundsReport, { id: bubble.id, topEdge: boxCenterY - outerHeight / 2 })
  }, [bubble, metrics, desiredOuterWidth, contentWidth, sentences])

  const { displayedText, done, advance } = useSentenceTypewriter(
    sentences,
    TYPEWRITER_DELAY,
    bubble.revealed && bubble.visible,
  )
  const isShown = bubble.revealed && bubble.visible

  // Ref en vez de dependencia directa: `advance` cambia en cada tecla que
  // escribe la máquina de escribir (~cada 55ms) y no queremos re-suscribir
  // los listeners a ese ritmo, solo cuando cambia si el bocadillo está activo.
  const advanceRef = useRef(advance)
  useEffect(() => {
    advanceRef.current = advance
  })

  useEffect(() => {
    if (!isShown || done) {
      return
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') {
        return
      }
      // Si hay un botón oculto (invisible pero aún en el DOM, ver NavButton)
      // que conserva el foco de un clic anterior, Enter lo "pulsaría" por su
      // cuenta (acción por defecto del navegador) y dispararía sin querer un
      // fundido de escena. Se cancela esa acción por defecto: aquí Enter solo
      // debe adelantar la máquina de escribir.
      event.preventDefault()
      advanceRef.current()
    }
    // Clic en cualquier sitio de la pantalla: no hay avance programado por
    // tiempo, cambiar de frase es siempre una acción explícita del usuario.
    const handleClick = () => advanceRef.current()

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('click', handleClick)
    }
  }, [isShown, done])

  useEffect(() => {
    reportedCompleteRef.current = false
  }, [bubble.id, bubble.text])

  useEffect(() => {
    if (bubble.revealed && done && !reportedCompleteRef.current) {
      reportedCompleteRef.current = true
      EventBus.emit(GameEvents.BubbleRevealComplete, { id: bubble.id })
    }
  }, [bubble.revealed, done, bubble.id])

  const tailClass = bubble.tailSide === 'left' ? styles.tailLeft : styles.tailRight

  return (
    <>
      <div className={styles.measure} style={{ width: `${contentWidth}px` }}>
        {sentences.map((sentence, index) => (
          <div
            key={index}
            ref={(el) => {
              measureRefs.current[index] = el
            }}
          >
            {sentence}
          </div>
        ))}
      </div>
      {layout && (
        <div
          className={`${styles.bubbleBox} ${tailClass}`}
          style={{
            left: `${layout.boxCenterX}px`,
            top: `${layout.boxCenterY}px`,
            transform: 'translate(-50%, -50%)',
            width: `${layout.contentWidth}px`,
            height: `${layout.contentHeight}px`,
            opacity: isShown ? 1 : 0,
          }}
        >
          <div className={styles.tailOuter} />
          <div className={styles.tailInner} />
          <div className={styles.tailPatch} />
          <div className={styles.bubbleText}>{displayedText}</div>
        </div>
      )}
    </>
  )
}
