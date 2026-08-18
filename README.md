# Orlando Cybertaxi

Private Cybercab and Model Y rides across Greater Orlando.

Fleet: **10 Cybercabs** and **2 Model Y**.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`).

## Book a ride

The booking flow quotes a fare from Orlando pins (MCO, Disney, Universal, downtown, and more), assigns a live vehicle from the hangar, and stores the confirmation in the browser.

## Deploy on Vercel

Production (`orlando-cybertaxi.vercel.app`) builds **main**. Merge this branch before expecting that URL to work — an empty `main` deploys as a 404.

In the Vercel project:

1. Framework Preset: **Vite**
2. Build Command: `npm run build`
3. Output Directory: `dist`

`vercel.json` already sets those and rewrites client routes (`/book`, `/fleet`, …) to `index.html`.
