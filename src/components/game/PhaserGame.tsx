import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { createGameConfig } from '../../game/config/gameConfig'
import styles from './PhaserGame.module.css'

/**
 * Único punto de contacto entre React y Phaser: crea el juego al montar
 * y lo destruye al desmontar. No contiene lógica de juego, solo ciclo de vida.
 */
export const PhaserGame = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (gameRef.current || !containerRef.current) {
      return
    }

    gameRef.current = new Phaser.Game(createGameConfig(containerRef.current))

    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  return <div ref={containerRef} className={styles.container} />
}
