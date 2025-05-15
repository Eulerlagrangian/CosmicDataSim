export interface PlanetData {
  index: number;
  name: string;
  diameter: number;  // km
  distanceFromSun: number;  // visualization units
  orbitPeriod: number;  // Earth years
  rotationPeriod: number;  // Earth days
  color: string;
  hasRings: boolean;
  density: number;  // g/cm³
  gravity: number;  // m/s²
  temperature: number;  // Celsius (average)
  moons: number;
}

export interface CsvRow {
  [key: string]: string | number | null;
}

export interface SonificationConfig {
  tempo: number;
  duration: number;
  selectedColumnX: string;
  selectedColumnY: string;
  scale: string[];
  scaleName: string;
}
