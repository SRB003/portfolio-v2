# Portfolio v2 · Sahil Bhuvad

Personal portfolio of Sahil Bhuvad, a full-stack developer in Mumbai.

## Pages

- `/`: home. Hero with a laptop "dive" into the work rail, flight-log path, about, research paper (AgroChain, IJARSCT), side quests and contact.
- `/projects/`: every shipped project, with filters and a Cards / Index view.

## Stack

React 19 · Vite · framer-motion · anime.js · Lenis · AOS · Three.js (react-three-fiber)

## Run locally

```bash
npm install
npm run dev      # dev server
npm run build    # production build in dist/
npm run preview  # serve the build
```

## Adding a project

Add one entry to `cases` in `src/data.js`. It shows up on the home rail, the footer and the `/projects/` page. Give it a `kind` (for example `Website` or `Tool`) to place it in a filter.
