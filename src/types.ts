export type EarthVisualMode = 'realistic' | 'night_lights' | 'hologram' | 'topographic';

export type ViewMode = 'globe_3d' | 'map_2d_3d';

export type MapEngine = 'google_maps' | 'satellite_leaflet';

export type SlidingTabCategory = 'tmg_community' | 'tmg_resort' | 'world' | 'settings' | 'atmosphere' | 'layers';

export type LocationCategory = 'capital' | 'megacity' | 'wonder' | 'extreme' | 'observatory' | 'tmg_community' | 'tmg_resort';

export interface LocationPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
  category: LocationCategory;
  description: string;
  population?: string;
  altitude?: string;
  funFact?: string;
}

export interface GeoGuideInfo {
  title: string;
  summary: string;
  highlights: string[];
  climate: string;
  funFact: string;
}

export interface PlanetaryTelemetry {
  utcTime: string;
  orbitalSpeed: string;
  solarTilt: string;
  activeSatellites: number;
}
