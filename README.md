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

Original hard-surface studio cars (not Tesla marketing files, not sphere morphs).

Source of truth is `src/vehicles/buildVehicles.ts`:

- Cybercab: extruded Giga Texas silhouette (wheel wells, hood, high belt, solid rear), butterfly greenhouse glass, full-width light bar, aero discs, no mirrors / no rear window.
- Model Y: extruded Juniper crossover (ride height, C-pillar, hatch), glass roof, mirrors, five-spoke wheels, full-width bars.
- Materials: automotive PBR (metallic/unpainted champagne, pearl, stealth grey) with clearcoat, transmitting glass, rubber tires, emissive bars.
- Stage: black studio, Poly Haven `studio_small_08` HDRI (`public/env/studio.hdr`, CC0), wrap + rim lights, contact shadow, floor reflection, ACES. Phones skip the reflector and use a lighter mesh.

Exported copies: `public/models/cybercab.glb` and `public/models/model-y.glb` (`npm run export:models`).

Orbit: drag. Zoom: pinch or scroll. Paint chips switch champagne/pearl (Cybercab) and pearl/stealth (Model Y). Inspector: `/inspect/cybercab` and `/inspect/model-y`.

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
