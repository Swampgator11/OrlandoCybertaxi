# Orlando Cybertaxi

Private Cybercab and Model Y rides across Greater Orlando.

Fleet: **10 Cybercabs** and **2 Model Y**.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`).

## Vehicle photos

The site does **not** use homemade 3D meshes. Orbit is a Tesla-style photograph turntable of real cars.

- Cybercab: Stockholm showroom walkaround by Ulkl (public domain). Champagne unit, butterfly doors, aero discs.
- Model Y Juniper pearl: Damian B Oh, CC BY-SA 4.0.
- Model Y Juniper Quicksilver (stealth chip): Damian B Oh, CC BY-SA 4.0.

Credits live in the footer and `public/turntable/ATTRIBUTION.md`.

Drag to orbit. Champagne/Pearl chips keep the real Cybercab photos (no fake tint). Pearl/Stealth switch the two Juniper photo sets. Inspector: `/inspect/cybercab` and `/inspect/model-y`.

## Interior films

Looping muted cabin film:

- `/film/cybercab-cabin.mp4` — real display-unit photographs (Dllu CC BY-SA 4.0; Steve Jurvetson CC BY 2.0). Two flat seats, landscape Tesla screen, no wheel.
- `/film/modely-cabin.mp4` — glass roof, five-seat cabin

Posters: `/film/cabin-*.jpg`

## Book a ride

Quotes from Orlando pins, hangar assignment, confirmation stored in the browser.

## Deploy

```bash
npm run build
```

`vercel.json` sets Vite + `dist` and rewrites client routes to `index.html`.
