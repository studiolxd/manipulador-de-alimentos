import { Activity1Screen } from './Activity1Screen'
import { Activity2Screen } from './Activity2Screen'
import { ButtonsOverlay } from './ButtonsOverlay'
import { BubblesOverlay } from './BubblesOverlay'
import styles from './GameUIOverlay.module.css'

/** Overlay DOM superpuesto al canvas de Phaser: botones, bocadillos y actividades. */
export const GameUIOverlay = () => (
  <div className={styles.overlay}>
    <Activity1Screen />
    <Activity2Screen />
    <ButtonsOverlay />
    <BubblesOverlay />
  </div>
)
