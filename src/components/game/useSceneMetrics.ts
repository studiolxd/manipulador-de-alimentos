import { useEffect, useState } from 'react'
import { EventBus } from '../../game/events/EventBus'
import { GameEvents } from '../../game/events/eventTypes'
import type { SceneMetricsPayload } from '../../game/events/eventTypes'

/** Último snapshot de `GameEvents.SceneMetrics` emitido por MainScene (o `null` hasta el primero). */
export const useSceneMetrics = (): SceneMetricsPayload | null => {
  const [metrics, setMetrics] = useState<SceneMetricsPayload | null>(null)

  useEffect(() => {
    const handleMetrics = (next: SceneMetricsPayload) => setMetrics(next)
    EventBus.on(GameEvents.SceneMetrics, handleMetrics)
    return () => {
      EventBus.off(GameEvents.SceneMetrics, handleMetrics)
    }
  }, [])

  return metrics
}
