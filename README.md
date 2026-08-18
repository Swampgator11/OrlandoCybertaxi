# Orlando Cybertaxi

Private Cybercab and Model Y rides across Greater Orlando.

Fleet: **10 Cybercabs** and **2 Model Y**.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`).

## 3D vehicles

Original studio models (not Tesla marketing files) live in `public/models/cybercab.glb` and `public/models/model-y.glb`.

- Desktop: loads the GLB, studio lighting, ground contact shadow.
- Mobile / compact cards: a lighter runtime mesh (fewer segments).
- Orbit: drag. Zoom: pinch or scroll. Paint chips switch champagne/pearl (Cybercab) and pearl/stealth (Model Y).
- Full inspector: `/inspect/cybercab` and `/inspect/model-y`.

Regenerate meshes:

```bash
npm run export:models
```

## Interior films

Looping muted cabin video (original, not Tesla stock):

- `/film/cybercab-cabin.mp4` — lounge bench, screen, butterfly door, no wheel
- `/film/modely-cabin.mp4` — glass roof, five-seat cabin

Posters: `/film/cabin-*.jpg`

## Book a ride

Quotes from Orlando pins, hangar assignment, confirmation stored in the browser.

## Deploy

```bash
npm run build
```

`vercel.json` sets Vite + `dist` and rewrites client routes to `index.html`.
