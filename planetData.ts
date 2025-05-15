import { PlanetData } from '../types';

// Source: NASA data with some adjustments for visualization scale
export const planetData: PlanetData[] = [
  {
    index: 0,
    name: "Mercury",
    diameter: 4879,  // km
    distanceFromSun: 10,  // visualization units
    orbitPeriod: 0.24,  // Earth years
    rotationPeriod: 58.6,  // Earth days
    color: "#A9A9A9",  // Silvery-gray
    hasRings: false,
    density: 5.43,  // g/cm³
    gravity: 3.7,  // m/s²
    temperature: 167,  // Celsius (average)
    moons: 0
  },
  {
    index: 1,
    name: "Venus",
    diameter: 12104,
    distanceFromSun: 15,
    orbitPeriod: 0.62,
    rotationPeriod: 243,  // Retrograde rotation
    color: "#E6CA9E",  // Light orange
    hasRings: false,
    density: 5.24,
    gravity: 8.87,
    temperature: 464,
    moons: 0
  },
  {
    index: 2,
    name: "Earth",
    diameter: 12756,
    distanceFromSun: 20,
    orbitPeriod: 1,
    rotationPeriod: 1,
    color: "#4B7BEC",  // Blue
    hasRings: false,
    density: 5.51,
    gravity: 9.81,
    temperature: 15,
    moons: 1
  },
  {
    index: 3,
    name: "Mars",
    diameter: 6779,
    distanceFromSun: 25,
    orbitPeriod: 1.88,
    rotationPeriod: 1.03,
    color: "#E17055",  // Reddish
    hasRings: false,
    density: 3.93,
    gravity: 3.71,
    temperature: -65,
    moons: 2
  },
  {
    index: 4,
    name: "Jupiter",
    diameter: 142984,
    distanceFromSun: 33,
    orbitPeriod: 11.86,
    rotationPeriod: 0.41,  // Very fast rotation
    color: "#FAD7A0",  // Light brown/orange
    hasRings: true,
    density: 1.33,
    gravity: 24.79,
    temperature: -110,
    moons: 79
  },
  {
    index: 5,
    name: "Saturn",
    diameter: 120536,
    distanceFromSun: 42,
    orbitPeriod: 29.46,
    rotationPeriod: 0.44,
    color: "#F8C471",  // Golden
    hasRings: true,
    density: 0.69,
    gravity: 10.44,
    temperature: -140,
    moons: 82
  },
  {
    index: 6,
    name: "Uranus",
    diameter: 51118,
    distanceFromSun: 50,
    orbitPeriod: 84.01,
    rotationPeriod: 0.72,  // Retrograde rotation
    color: "#85C1E9",  // Light blue
    hasRings: true,
    density: 1.27,
    gravity: 8.87,
    temperature: -195,
    moons: 27
  },
  {
    index: 7,
    name: "Neptune",
    diameter: 49528,
    distanceFromSun: 58,
    orbitPeriod: 164.8,
    rotationPeriod: 0.67,
    color: "#3498DB",  // Deep blue
    hasRings: true,
    density: 1.64,
    gravity: 11.15,
    temperature: -200,
    moons: 14
  }
];

// Function to get a planet by name
export function getPlanetByName(name: string): PlanetData | undefined {
  return planetData.find(planet => planet.name.toLowerCase() === name.toLowerCase());
}

// Function to get planet properties as CSV data
export function getPlanetsAsCSV(): any[] {
  return planetData.map(planet => ({
    name: planet.name,
    diameter: planet.diameter,
    distance: planet.distanceFromSun,
    orbitPeriod: planet.orbitPeriod,
    rotationPeriod: planet.rotationPeriod,
    density: planet.density,
    gravity: planet.gravity,
    temperature: planet.temperature,
    moons: planet.moons
  }));
}
