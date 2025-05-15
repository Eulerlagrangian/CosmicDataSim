// Planet texture mapping

// Texture mapping for planets by name
export const planetTextures = {
  "Mercury": "/textures/mercury.jpg",
  "Venus": "/textures/venus.jpg",
  "Earth": "/textures/earth.jpg",
  "Mars": "/textures/mars.jpg",
  "Jupiter": "/textures/jupiter.jpg",
  "Saturn": "/textures/saturn.jpg",
  "Uranus": "/textures/uranus.jpg",
  "Neptune": "/textures/neptune.jpg",
  "Pluto": "/textures/pluto.jpg"
};

// Cloud or atmosphere layers for specific planets
export const planetCloudTextures = {
  "Earth": "/textures/earth_clouds.jpg",
  "Venus": "/textures/venus_atmosphere.jpg",
  "Jupiter": "/textures/jupiter_clouds.jpg",
  "Saturn": "/textures/saturn_clouds.jpg"
};

// Special ring textures
export const ringTextures = {
  "Saturn": "/textures/saturn_rings.jpg",
  "Uranus": "/textures/uranus_rings.jpg"
};

// Special normal maps for terrain details
export const planetNormalMaps = {
  "Mercury": "/textures/mercury_normal.jpg",
  "Mars": "/textures/mars_normal.jpg",
  "Earth": "/textures/earth_normal.jpg"
};

// Get texture path by planet name
export function getPlanetTexture(planetName: string): string | null {
  return planetTextures[planetName as keyof typeof planetTextures] || null;
}

// Get cloud texture path by planet name
export function getPlanetCloudTexture(planetName: string): string | null {
  return planetCloudTextures[planetName as keyof typeof planetCloudTextures] || null;
}

// Get ring texture path by planet name
export function getRingTexture(planetName: string): string | null {
  return ringTextures[planetName as keyof typeof ringTextures] || null;
}

// Get normal map path by planet name
export function getPlanetNormalMap(planetName: string): string | null {
  return planetNormalMaps[planetName as keyof typeof planetNormalMaps] || null;
}