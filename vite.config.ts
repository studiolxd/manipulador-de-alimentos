import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // En build usa la ruta del proyecto en GitHub Pages; en dev se sirve desde la raíz.
  base: command === 'build' ? '/manipulador-de-alimentos/' : '/',
  plugins: [react()],
}))
