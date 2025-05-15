import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetData } from '../types';

interface PlanetProps {
  planet: PlanetData;
  onClick: () => void;
  isPlaying: boolean;
  csvData: any[] | null;
  sonificationConfig: any;
  onShowInfo: (planet: PlanetData | null) => void;
  isInfoOpen: boolean;
  isPaused?: boolean;
  timeScale?: number;
}

const Planet = ({ 
  planet, 
  onClick, 
  isPlaying, 
  csvData, 
  sonificationConfig,
  onShowInfo,
  isInfoOpen,
  isPaused = false,
  timeScale = 1.0
}: PlanetProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // For texture processing - using existing available textures
  // We'll use the planet's color as a base and add procedural texture details
  
  // Handle orbital movement
  useFrame(({ clock }) => {
    // Skip animation updates if paused
    if (isPaused) return;
    
    if (orbitRef.current) {
      // Rotate the planet orbit based on time scale
      // Higher timeScale = faster orbital motion
      orbitRef.current.rotation.y = (clock.getElapsedTime() * timeScale) / planet.orbitPeriod;
    }
    
    if (meshRef.current) {
      // Rotate the planet on its axis, also affected by time scale
      meshRef.current.rotation.y += (0.001 * timeScale) / planet.rotationPeriod;
    }
  });
  
  // Generate the planet's color based on its characteristics
  const getPlanetColor = () => {
    // Use planet's predefined color if available
    if (planet.color) return planet.color;
    
    // Custom colors for specific planets to enhance realism
    if (planet.name === "Mercury") return "#a39782"; // Gray-brown rocky surface
    if (planet.name === "Venus") return "#e6b87d";   // Yellowish cloud cover
    if (planet.name === "Earth") return "#2f6a69";   // Blue-green oceanic planet
    if (planet.name === "Mars") return "#b35624";    // Reddish-orange rust color
    if (planet.name === "Jupiter") return "#d0b487"; // Tan with orange stripes
    if (planet.name === "Saturn") return "#e4d4a0";  // Pale gold-yellow
    if (planet.name === "Uranus") return "#c1e3e3";  // Pale cyan
    if (planet.name === "Neptune") return "#4b70dd"; // Deep blue
    if (planet.name === "Pluto") return "#ad8765";   // Brownish gray
    
    // Generate a fallback color based on planet properties
    const hue = (planet.index * 75) % 360;
    const s = 70 + (planet.diameter % 30);
    const l = 40 + (planet.density * 10) % 20;
    
    return `hsl(${hue}, ${s}%, ${l}%)`;
  };
  
  // Create surface details for the planet based on its type
  const getPlanetSurfaceDetails = () => {
    // Earth-like planets
    if (planet.name === "Earth" || planet.name === "Mars") {
      return {
        bumpScale: 0.05,
        roughness: 0.6,
        clearcoat: 0.3,
        specularColor: new THREE.Color(0x333333),
        displacementScale: 0.05
      };
    }
    
    // Gas giants
    if (planet.name === "Jupiter" || planet.name === "Saturn") {
      return {
        bumpScale: 0.02,
        roughness: 0.5,
        clearcoat: 0.4,
        specularColor: new THREE.Color(0x555555),
        displacementScale: 0.01
      };
    }
    
    // Ice giants
    if (planet.name === "Uranus" || planet.name === "Neptune") {
      return {
        bumpScale: 0.01,
        roughness: 0.4,
        clearcoat: 0.5,
        specularColor: new THREE.Color(0x6666aa),
        displacementScale: 0.005
      };
    }
    
    // Rocky planets
    return {
      bumpScale: 0.03,
      roughness: 0.7,
      clearcoat: 0.2,
      specularColor: new THREE.Color(0x444444),
      displacementScale: 0.02
    };
  };
  
  // Calculate planet size for visualization (scaled for better visualization)
  const getPlanetSize = () => {
    // Logarithmic scale to handle the wide range of planet sizes
    const minSize = 0.5;
    const maxSize = 2.5;
    const sizeFactor = Math.log(planet.diameter) / Math.log(200000);
    return minSize + sizeFactor * (maxSize - minSize);
  };
  
  // Get ring geometry if planet has rings
  const getRingGeometry = () => {
    if (!planet.hasRings) return null;
    
    const planetSize = getPlanetSize();
    const innerRadius = planetSize * 1.3;
    const outerRadius = planetSize * 2.2;
    
    return (
      <group rotation={[Math.PI / 2, 0, 0]}>
        {/* Main ring */}
        <mesh>
          <ringGeometry args={[innerRadius, outerRadius, 64]} />
          <meshStandardMaterial 
            color={planet.name === "Saturn" ? "#e6dbbf" : "#afc8da"} 
            side={THREE.DoubleSide} 
            transparent 
            opacity={0.7} 
          />
        </mesh>
        
        {/* Inner division ring */}
        <mesh>
          <ringGeometry args={[innerRadius + 0.2, innerRadius + 0.4, 64]} />
          <meshStandardMaterial color="#333333" side={THREE.DoubleSide} transparent opacity={0.5} />
        </mesh>
        
        {/* Outer division ring */}
        <mesh>
          <ringGeometry args={[outerRadius - 0.3, outerRadius - 0.1, 64]} />
          <meshStandardMaterial color="#777777" side={THREE.DoubleSide} transparent opacity={0.5} />
        </mesh>
      </group>
    );
  };
  
  // Handle hover effects
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);
  
  const planetSize = getPlanetSize();
  
  // Handle planet click
  const handleClick = (e: any) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    onShowInfo(planet);
    onClick();
  };
  
  return (
    <group ref={orbitRef}>
      {/* Draw orbit path */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[planet.distanceFromSun, planet.distanceFromSun + 0.1, 128]} />
        <meshBasicMaterial color="#444444" side={THREE.DoubleSide} transparent opacity={0.4} />
      </mesh>
      
      {/* Position planet on orbit */}
      <group position={[planet.distanceFromSun, 0, 0]}>
        <mesh 
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={hovered || isPlaying ? 1.2 : 1}
        >
          <sphereGeometry args={[planetSize, 64, 64]} />
          <meshPhysicalMaterial 
            color={getPlanetColor()} 
            emissive={isPlaying ? new THREE.Color('#ffffff') : new THREE.Color('#000000')}
            emissiveIntensity={isPlaying ? 0.5 : 0}
            
            // Different roughness based on planet type
            roughness={
              planet.name === "Mercury" || planet.name === "Mars" ? 0.8 :  // Rocky planets
              planet.name === "Earth" || planet.name === "Venus" ? 0.6 :  // Planets with atmosphere
              planet.name === "Jupiter" || planet.name === "Saturn" ? 0.5 : // Gas giants
              planet.name === "Uranus" || planet.name === "Neptune" ? 0.4 : // Ice giants
              0.7 // Default
            } 
            
            // Different metalness values
            metalness={
              planet.name === "Mercury" ? 0.5 :  // Mercury has high metal content
              planet.name === "Earth" ? 0.2 :   // Earth has moderate reflectivity
              planet.name === "Jupiter" || planet.name === "Saturn" ? 0.4 : // Gas giants are more reflective
              0.3 // Default
            }
            
            // Add clearcoat to simulate atmospheric effects
            clearcoat={
              planet.name === "Earth" || planet.name === "Venus" ? 0.4 :
              planet.name === "Jupiter" || planet.name === "Saturn" ? 0.3 :
              planet.name === "Uranus" || planet.name === "Neptune" ? 0.5 :
              0.0
            }
            
            // Make ice giants slightly translucent
            transmission={planet.name === "Uranus" || planet.name === "Neptune" ? 0.1 : 0}
            thickness={planet.name === "Uranus" || planet.name === "Neptune" ? 2 : 0}
          />
        </mesh>
        
        {/* Planet rings if applicable */}
        {getRingGeometry()}
        
        {/* Planet name label */}
        <Text
          position={[0, planetSize + 0.7, 0]}
          fontSize={0.7}
          color="white"
          anchorX="center"
          anchorY="bottom"
          strokeWidth={0.01}
          strokeColor="#000000"
        >
          {planet.name}
        </Text>
      </group>
    </group>
  );
};

export default Planet;
