/**
 * Replica `Phaser.Math.Clamp(width * ratio, min, max)` para tamaños de letra
 * responsivos calculados en React. Usa el ancho del contenedor del juego
 * (`SceneMetricsPayload.width`), no `vw`: el juego no tiene por qué ocupar
 * todo el viewport del navegador.
 */
export const clampSize = (width: number, ratio: number, min: number, max: number): number =>
  Math.min(Math.max(width * ratio, min), max)
