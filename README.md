# Manipulador de Alimentos

Base técnica de un juego 2D construido con React + Vite + TypeScript y Phaser 3.

## Desarrollo

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — servidor de desarrollo con HMR.
- `npm run build` — comprueba tipos y genera la build de producción en `dist/`.
- `npm run lint` — ESLint.
- `npm run preview` — sirve la build de producción localmente.

## Despliegue

Cada `push` a `main` dispara el workflow [`deploy-pages.yml`](.github/workflows/deploy-pages.yml), que compila el proyecto y lo publica en GitHub Pages:

https://studiolxd.github.io/manipulador-de-alimentos/
