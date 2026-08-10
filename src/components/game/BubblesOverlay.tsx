import { useEffect, useState } from 'react'
import { EventBus } from '../../game/events/EventBus'
import { GameEvents } from '../../game/events/eventTypes'
import type { BubbleDescriptor } from '../../game/events/eventTypes'
import { SpeechBubble } from './SpeechBubble'
import { useSceneMetrics } from './useSceneMetrics'

/** Renderiza el último snapshot de bocadillos emitido por MainScene. */
export const BubblesOverlay = () => {
  const [bubbles, setBubbles] = useState<BubbleDescriptor[]>([])
  const metrics = useSceneMetrics()

  useEffect(() => {
    const handleBubbles = (next: BubbleDescriptor[]) => setBubbles(next)
    EventBus.on(GameEvents.SetBubbles, handleBubbles)
    return () => {
      EventBus.off(GameEvents.SetBubbles, handleBubbles)
    }
  }, [])

  if (!metrics) {
    return null
  }

  return (
    <>
      {bubbles.map((bubble) => (
        // La key incluye el texto: un mensaje nuevo para el mismo id (p.ej.
        // "bubble1" reutilizado en cada pantalla) debe nacer limpio, no
        // reutilizar el estado interno (máquina de escribir) del anterior.
        <SpeechBubble key={`${bubble.id}:${bubble.text}`} bubble={bubble} metrics={metrics} />
      ))}
    </>
  )
}
