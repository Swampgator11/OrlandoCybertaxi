import type { Paint, VehicleType } from "./fleet";

/** Real-photo frames. No tints. Cybercab pearl uses the same champagne studio set. */
export const turntable: Record<VehicleType, Partial<Record<Paint, string[]>>> = {
  cybercab: {
    gold: [
      "/turntable/cybercab/01.jpg",
      "/turntable/cybercab/02.jpg",
      "/turntable/cybercab/07.jpg",
      "/turntable/cybercab/04.jpg",
      "/turntable/cybercab/03.jpg",
      "/turntable/cybercab/05.jpg",
      "/turntable/cybercab/06.jpg",
    ],
  },
  "model-y": {
    white: [
      "/turntable/model-y-white/01.jpg",
      "/turntable/model-y-white/03.jpg",
      "/turntable/model-y-white/04.jpg",
      "/turntable/model-y-white/10.jpg",
      "/turntable/model-y-white/05.jpg",
      "/turntable/model-y-white/06.jpg",
      "/turntable/model-y-white/07.jpg",
    ],
    grey: [
      "/turntable/model-y-grey/01.jpg",
      "/turntable/model-y-grey/04.jpg",
      "/turntable/model-y-grey/07.jpg",
      "/turntable/model-y-grey/10.jpg",
      "/turntable/model-y-grey/12.jpg",
    ],
  },
};

export function framesFor(type: VehicleType, paint: Paint): string[] {
  const byPaint = turntable[type];
  return byPaint[paint] ?? byPaint.gold ?? byPaint.white ?? Object.values(byPaint)[0] ?? [];
}
