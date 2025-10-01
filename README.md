<<<<<<< HEAD
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Ribbit-Interview

A React + TypeScript + Vite project for the Ribbit interview exercise. It renders an Airport Dashboard with an OpenLayers map and mock airport data.

## Tech stack
- React 19 + TypeScript
- Vite 7
- OpenLayers for mapping

## Getting started

1) Install dependencies

```powershell
npm install
```

2) Run the dev server

```powershell
npm run dev
```

3) Build for production

```powershell
npm run build
```

4) Preview the production build

```powershell
npm run preview
```

## Notes
- Path aliases are configured in `vite.config.ts` and `tsconfig.app.json` (e.g., `pages`, `types`, `data`).
- The map and airport types live under `src/pages/airport_dashboard` and `src/types` respectively. Mock data is in `src/data/MockAirports.ts`.
```js
