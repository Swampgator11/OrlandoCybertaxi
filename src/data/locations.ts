export type LocationKind =
  | "airport"
  | "theme-park"
  | "downtown"
  | "neighborhood"
  | "venue"
  | "custom";

export type Hub = {
  id: string;
  name: string;
  area: string;
  kind: LocationKind;
  lat: number;
  lng: number;
};

export const hubs: Hub[] = [
  {
    id: "mco-ab",
    name: "MCO Terminals A/B",
    area: "Orlando International",
    kind: "airport",
    lat: 28.4312,
    lng: -81.3083,
  },
  {
    id: "mco-c",
    name: "MCO Terminal C",
    area: "Orlando International",
    kind: "airport",
    lat: 28.416,
    lng: -81.299,
  },
  {
    id: "magic-kingdom",
    name: "Magic Kingdom / TTC",
    area: "Walt Disney World",
    kind: "theme-park",
    lat: 28.42,
    lng: -81.5812,
  },
  {
    id: "epcot",
    name: "EPCOT",
    area: "Walt Disney World",
    kind: "theme-park",
    lat: 28.3747,
    lng: -81.5494,
  },
  {
    id: "disney-springs",
    name: "Disney Springs",
    area: "Lake Buena Vista",
    kind: "theme-park",
    lat: 28.3705,
    lng: -81.5194,
  },
  {
    id: "hollywood-studios",
    name: "Hollywood Studios",
    area: "Walt Disney World",
    kind: "theme-park",
    lat: 28.3575,
    lng: -81.5583,
  },
  {
    id: "animal-kingdom",
    name: "Animal Kingdom",
    area: "Walt Disney World",
    kind: "theme-park",
    lat: 28.3553,
    lng: -81.59,
  },
  {
    id: "citywalk",
    name: "Universal CityWalk",
    area: "Universal Orlando",
    kind: "theme-park",
    lat: 28.4734,
    lng: -81.4658,
  },
  {
    id: "epic",
    name: "Epic Universe",
    area: "Universal Orlando",
    kind: "theme-park",
    lat: 28.4419,
    lng: -81.4372,
  },
  {
    id: "icon-park",
    name: "ICON Park / I-Drive",
    area: "International Drive",
    kind: "neighborhood",
    lat: 28.443,
    lng: -81.4687,
  },
  {
    id: "occc",
    name: "Orange County Convention Center",
    area: "International Drive",
    kind: "venue",
    lat: 28.4252,
    lng: -81.4534,
  },
  {
    id: "lake-eola",
    name: "Lake Eola / Downtown",
    area: "Downtown Orlando",
    kind: "downtown",
    lat: 28.5431,
    lng: -81.3729,
  },
  {
    id: "kia-center",
    name: "Kia Center",
    area: "Downtown Orlando",
    kind: "venue",
    lat: 28.5392,
    lng: -81.3839,
  },
  {
    id: "winter-park",
    name: "Park Avenue",
    area: "Winter Park",
    kind: "neighborhood",
    lat: 28.5975,
    lng: -81.351,
  },
  {
    id: "lake-nona",
    name: "Lake Nona / Medical City",
    area: "Lake Nona",
    kind: "neighborhood",
    lat: 28.3686,
    lng: -81.276,
  },
  {
    id: "kissimmee",
    name: "Old Town / Kissimmee",
    area: "Kissimmee",
    kind: "neighborhood",
    lat: 28.3022,
    lng: -81.4595,
  },
  {
    id: "camping-world",
    name: "Camping World Stadium",
    area: "West Orlando",
    kind: "venue",
    lat: 28.539,
    lng: -81.4028,
  },
];

export const kindLabel: Record<LocationKind, string> = {
  airport: "Airport",
  "theme-park": "Theme parks",
  downtown: "Downtown",
  neighborhood: "Neighborhood",
  venue: "Venue",
  custom: "Custom",
};
