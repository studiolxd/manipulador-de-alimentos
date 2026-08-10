import type { CSSProperties } from 'react'
import type { ButtonDescriptor } from '../../game/events/eventTypes'
import { GameEvents } from '../../game/events/eventTypes'
import { EventBus } from '../../game/events/EventBus'
import styles from './NavButton.module.css'

interface NavButtonProps {
  button: ButtonDescriptor
  style?: CSSProperties
  // Por defecto, el clic se retransmite a MainScene vía EventBus (botones de
  // navegación dirigidos por Phaser). Las pantallas de actividad, cuyo
  // estado es puramente local a React, pasan aquí su propio manejador en
  // vez de pasar por ese snapshot.
  onClick?: () => void
}

export const NavButton = ({ button, style, onClick }: NavButtonProps) => {
  const handleClick = () => {
    if (button.disabled) {
      return
    }
    if (onClick) {
      onClick()
      return
    }
    EventBus.emit(GameEvents.ButtonClicked, { id: button.id })
  }

  const className = [styles.button, styles[button.variant], styles[button.size], styles[button.anchor]].join(' ')

  const mergedStyle: CSSProperties = {
    ...style,
    opacity: button.visible ? 1 : 0,
    pointerEvents: button.visible ? 'auto' : 'none',
  }

  return (
    <button type="button" className={className} style={mergedStyle} disabled={button.disabled} onClick={handleClick}>
      {button.label}
    </button>
  )
}
