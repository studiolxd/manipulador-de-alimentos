import { useEffect, useState } from 'react'
import { EventBus } from '../../game/events/EventBus'
import { GameEvents } from '../../game/events/eventTypes'
import type { ButtonDescriptor } from '../../game/events/eventTypes'
import { HOME_BUTTON_TOP_GAP } from '../../game/config/uiConstants'
import { NavButton } from './NavButton'
import { useSceneMetrics } from './useSceneMetrics'

/** Renderiza el último snapshot de botones emitido por MainScene. */
export const ButtonsOverlay = () => {
  const [buttons, setButtons] = useState<ButtonDescriptor[]>([])
  const metrics = useSceneMetrics()

  useEffect(() => {
    const handleButtons = (next: ButtonDescriptor[]) => setButtons(next)
    EventBus.on(GameEvents.SetButtons, handleButtons)
    return () => {
      EventBus.off(GameEvents.SetButtons, handleButtons)
    }
  }, [])

  return (
    <>
      {buttons.map((button) => {
        // Único anclaje que depende de una medida de Phaser (el subtítulo
        // de la portada, que sigue siendo texto de Phaser).
        const style =
          button.anchor === 'home-start' && metrics?.homeSubtitleBottom != null
            ? { top: `${metrics.homeSubtitleBottom + HOME_BUTTON_TOP_GAP}px` }
            : undefined
        return <NavButton key={button.id} button={button} style={style} />
      })}
    </>
  )
}
