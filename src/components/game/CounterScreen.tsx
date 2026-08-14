import { useEffect, useState } from 'react'
import { EventBus } from '../../game/events/EventBus'
import { GameEvents } from '../../game/events/eventTypes'
import type { SetActivityPayload } from '../../game/events/eventTypes'
import { COUNTER_SELECT_INSTRUCTION } from '../../game/data/activities'
import { clampSize } from '../../game/utils'
import { useSceneMetrics } from './useSceneMetrics'
import styles from './CounterScreen.module.css'

const INSTRUCTION_FONT_RATIO = 0.022
const INSTRUCTION_FONT_MIN = 18
const INSTRUCTION_FONT_MAX = 26

// Tamaño real del fondo `encimera.png` (ver BootScene.ts): hace falta para
// reproducir cómo lo escala Phaser en modo "cover" (misma matemática que
// `MainScene.updateBackgroundScale`) y así saber dónde cae cada plato en
// pantalla, sea cual sea el tamaño de la ventana.
const BACKGROUND_IMAGE_WIDTH = 2048
const BACKGROUND_IMAGE_HEIGHT = 1152

// Zonas clicables (elípticas) de cada plato, como fracción del tamaño de la
// imagen de fondo (0-1). Estimadas a ojo sobre `encimera.png`; si algún
// plato queda mal cubierto, ajustar aquí.
const PLATE_HOTSPOTS = [
  { cx: 0.214, cy: 0.493, rx: 0.12, ry: 0.16 },
  { cx: 0.503, cy: 0.498, rx: 0.13, ry: 0.14 },
  { cx: 0.769, cy: 0.502, rx: 0.11, ry: 0.13 },
]

/**
 * Pantalla "Encimera": los tres platos son botones (zonas elípticas
 * invisibles sobre cada uno), más una instrucción arriba pidiendo elegir
 * uno. Al pulsar uno se marca como seleccionado (resaltado); no dispara
 * nada más todavía.
 */
export const CounterScreen = () => {
  const metrics = useSceneMetrics()
  const [visible, setVisible] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)

  useEffect(() => {
    const handleSetCounterSelect = (payload: SetActivityPayload) => setVisible(payload.visible)
    EventBus.on(GameEvents.SetCounterSelect, handleSetCounterSelect)
    return () => EventBus.off(GameEvents.SetCounterSelect, handleSetCounterSelect)
  }, [])

  if (!metrics) {
    return null
  }

  const instructionFontSize = clampSize(metrics.width, INSTRUCTION_FONT_RATIO, INSTRUCTION_FONT_MIN, INSTRUCTION_FONT_MAX)

  const scale = Math.max(metrics.width / BACKGROUND_IMAGE_WIDTH, metrics.height / BACKGROUND_IMAGE_HEIGHT)
  const displayedWidth = BACKGROUND_IMAGE_WIDTH * scale
  const displayedHeight = BACKGROUND_IMAGE_HEIGHT * scale
  const offsetX = (metrics.width - displayedWidth) / 2
  const offsetY = (metrics.height - displayedHeight) / 2

  return (
    <div className={styles.root} style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? undefined : 'none' }}>
      <p className={styles.instruction} style={{ fontSize: `${instructionFontSize}px` }}>
        {COUNTER_SELECT_INSTRUCTION}
      </p>
      {PLATE_HOTSPOTS.map((hotspot, index) => {
        const width = hotspot.rx * 2 * displayedWidth
        const height = hotspot.ry * 2 * displayedHeight
        const left = offsetX + hotspot.cx * displayedWidth - width / 2
        const top = offsetY + hotspot.cy * displayedHeight - height / 2

        return (
          <button
            key={index}
            type="button"
            aria-label={`Seleccionar plato ${index + 1}`}
            className={`${styles.plateButton} ${selected === index ? styles.selected : ''}`}
            style={{ left, top, width, height, pointerEvents: visible ? 'auto' : 'none' }}
            onClick={() => setSelected(index)}
          />
        )
      })}
    </div>
  )
}
