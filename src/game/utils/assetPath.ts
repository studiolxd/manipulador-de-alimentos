/**
 * Construye una ruta de asset respetando el `base` de Vite (por ejemplo
 * `/manipulador-de-alimentos/` en GitHub Pages, `/` en desarrollo local).
 * Úsalo para cualquier recurso referenciado por string fuera de un import
 * de módulo (assets en `public/`, rutas pasadas a `this.load` de Phaser, etc).
 */
export const assetPath = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
