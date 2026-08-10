import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import { createGameConfig } from '../../game/config/gameConfig'
import { EventBus } from '../../game/events/EventBus'
import { GameEvents } from '../../game/events/eventTypes'
import { GameUIOverlay } from './GameUIOverlay'
import styles from './PhaserGame.module.css'

/**
 * Único punto de contacto entre React y Phaser: crea el juego al montar
 * y lo destruye al desmontar. La lógica de juego vive en las escenas de
 * Phaser; los botones y bocadillos se renderizan aquí al lado, en
 * `GameUIOverlay`, comunicados por el EventBus.
 */
export const PhaserGame = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (gameRef.current || !containerRef.current) {
      return
    }

    gameRef.current = new Phaser.Game(createGameConfig(containerRef.current))

    const handleSceneReady = () => setIsReady(true)
    EventBus.on(GameEvents.CurrentSceneReady, handleSceneReady)

    return () => {
      EventBus.off(GameEvents.CurrentSceneReady, handleSceneReady)
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  return (
    <div className={styles.container}>
      <div ref={containerRef} className={styles.canvasHost} />
      <GameUIOverlay />
      <div className={`${styles.spinnerOverlay} ${isReady ? styles.hidden : ''}`} aria-hidden={isReady}>
        <div className={styles.spinner} />
      </div>
    </div>
  )
}
