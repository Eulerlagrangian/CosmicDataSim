import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import Planet from './Planet';
import Controls from './Controls';
import ExplorationInfo from './ExplorationInfo';
import SoundControls from './SoundControls';
import { planetData } from '../lib/planetData';
import { PlanetData } from '../types';
import * as Tone from 'tone';
import { planetInstruments } from '../lib/instrumentSamples';
import { useAudio } from '../lib/stores/useAudio';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from './ui/dialog';
import { Button } from './ui/button';
import { 
  InfoIcon, 
  Music, 
  Link, 
  ArrowUpRight, 
  Play, 
  Pause, 
  Clock, 
  ChevronUp, 
  ChevronDown, 
  RotateCcw, 
  Settings, 
  X, 
  ChevronRight,
  ChevronDownCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react';

interface SolarSystemProps {
  csvData: any[] | null;
  sonificationConfig: any;
}

// Sun component with glow effect
const Sun = () => {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color={new THREE.Color('#FDB813')} />
      </mesh>
      <pointLight intensity={1.5} distance={100} decay={2} color="#FFF9E5" />
    </group>
  );
};

// Light effects for the scene
const Lights = () => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[0, 10, 5]} intensity={0.7} />
    </>
  );
};

// Camera controls
const CameraController = () => {
  const { camera } = useThree();
  
  useEffect(() => {
    // Position the camera to show the solar system
    camera.position.set(0, 20, 70);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  return null;
};

// Main SolarSystem component
const SolarSystem = ({ csvData, sonificationConfig }: SolarSystemProps) => {
  const [playingPlanet, setPlayingPlanet] = useState<string | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeScale, setTimeScale] = useState(1.0); // Time scale factor: 1.0 = normal speed
  const [controlsVisible, setControlsVisible] = useState(true); // Controls visibility state
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState("100vh");
  const [showEducationalContent, setShowEducationalContent] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const synth = useRef<Tone.PolySynth | null>(null);
  
  // Initialize synth for planet sounds
  useEffect(() => {
    // Create a new synth when component mounts
    synth.current = new Tone.PolySynth(Tone.Synth).toDestination();
    
    // Clean up when component unmounts
    return () => {
      if (synth.current) {
        synth.current.dispose();
      }
    };
  }, []);
  
  // Access audio store for ambient sounds
  const { changePlanetAmbient, isAmbientPlaying, toggleAmbient } = useAudio();
  
  // Function to play a planet's sound using advanced sonification
  const playPlanetSound = async (planet: PlanetData) => {
    try {
      // Import the advanced sonification functions
      const { playPlanetSound: advancedPlayPlanetSound } = await import('../lib/advancedSonification');
      
      // Set the planet as playing for visual feedback
      setPlayingPlanet(planet.name);
      
      // Get the scale from sonification config, or use default
      const scale = sonificationConfig.scale || [
        'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 
        'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'
      ];
      
      // Play the planet sound using our advanced sonification
      await advancedPlayPlanetSound(planet, scale, 2.5);
      
      // Reset playing planet after sound completes
      setPlayingPlanet(null);
    } catch (error) {
      console.error("Error playing planet sound:", error);
      setPlayingPlanet(null);
    }
  };

  // Handle showing planet info and change ambient sound
  const handleShowPlanetInfo = (planet: PlanetData | null) => {
    setSelectedPlanet(planet);
    
    // Change the ambient sound to match the selected planet
    changePlanetAmbient(planet);
    
    // If ambient is not already playing and a planet is selected, auto-start it
    if (planet && !isAmbientPlaying) {
      toggleAmbient();
    }
    
    if (planet) {
      setInfoDialogOpen(true);
    }
  };
  
  // Toggle educational content visibility
  const toggleEducationalContent = () => {
    console.log("Toggle educational content", !showEducationalContent);
    setShowEducationalContent(!showEducationalContent);
  };
  
  // Render the Solar System
  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-y-auto overflow-x-hidden"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
        minHeight: '100vh', // Ensure the container has a minimum height
        height: '100%',     // Take up all available space
      }}
    >
      <Canvas
        camera={{ position: [0, 20, 70], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        performance={{ min: 0.5 }}
        style={{ 
          background: '#000000',
          height: canvasHeight,
          minHeight: '50vh',
          maxHeight: '100vh',
          transition: 'height 0.3s ease-out',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          overflow: 'visible'
        }}
      >
        <CameraController />
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 70, 200]} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} fade />
        <Lights />
        
        {/* Sun at the center */}
        <Sun />
        
        {/* Planets */}
        {planetData.map((planet) => (
          <Planet 
            key={planet.name} 
            planet={planet} 
            onClick={() => playPlanetSound(planet)}
            isPlaying={planet.name === playingPlanet}
            csvData={csvData}
            sonificationConfig={sonificationConfig}
            onShowInfo={handleShowPlanetInfo}
            isInfoOpen={selectedPlanet?.name === planet.name && infoDialogOpen}
            isPaused={isPaused}
            timeScale={timeScale}
          />
        ))}
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={150}
        />
      </Canvas>
      
      {/* Toggle button for controls - always visible */}
      <div className="absolute top-5 left-5 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-black/80 border-gray-700 h-10 w-10 rounded-full flex items-center justify-center"
          onClick={() => setControlsVisible(!controlsVisible)}
        >
          <Settings size={18} className={controlsVisible ? "text-blue-300" : "text-white"} />
        </Button>
      </div>
      
      {/* Collapsible control panel */}
      {controlsVisible && (
        <div className="absolute top-5 left-20 text-white bg-black/70 p-4 rounded-md z-10 shadow-lg border border-gray-800 max-w-56">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-base">Explorer Controls</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={() => setControlsVisible(false)}
            >
              <X size={14} />
            </Button>
          </div>
          
          <p className="text-xs opacity-80 mb-3">Control orbit speed and playback</p>
          
          {/* Orbit Pause/Resume Button */}
          <div className="mb-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex items-center gap-1 bg-black/50 border-gray-700 w-full"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? (
                <>
                  <Play size={14} />
                  <span>Resume Orbit</span>
                </>
              ) : (
                <>
                  <Pause size={14} />
                  <span>Pause Orbit</span>
                </>
              )}
            </Button>
          </div>
          
          {/* Time Scale Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                Time Scale
              </span>
              <span className="font-mono bg-black/70 px-2 py-0.5 rounded">
                {timeScale.toFixed(1)}x
              </span>
            </div>
            
            <div className="flex gap-1">
              {/* Speed Down Button */}
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 h-7 px-2 bg-black/50 border-gray-700"
                onClick={() => setTimeScale(prev => Math.max(0.1, prev - 0.1))}
                disabled={timeScale <= 0.1}
              >
                <ChevronDown size={14} />
              </Button>
              
              {/* Reset Button */}
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 h-7 px-2 bg-black/50 border-gray-700"
                onClick={() => setTimeScale(1.0)}
                disabled={timeScale === 1.0}
              >
                <RotateCcw size={14} />
              </Button>
              
              {/* Speed Up Button */}
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 h-7 px-2 bg-black/50 border-gray-700"
                onClick={() => setTimeScale(prev => Math.min(5.0, prev + 0.1))}
                disabled={timeScale >= 5.0}
              >
                <ChevronUp size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toggle button for educational content - only show when content is hidden */}
      {!showEducationalContent && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <Button
            onClick={toggleEducationalContent}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 group transition-all hover:scale-105"
          >
            <span className="animate-pulse-glow">Explore Planet Information</span>
            <ChevronDownCircle className="w-5 h-5 animate-float" />
          </Button>
        </div>
      )}
      
      {/* Educational content section */}
      {showEducationalContent && (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-black via-indigo-950/90 to-black/95 overflow-y-auto p-6 animate-fade-in">
          {/* Star particles in background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `${Math.random() * 100}%`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
          
          {/* Back to solar system button */}
          <div className="fixed top-5 right-5 z-50 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button
              onClick={toggleEducationalContent}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 group transition-all hover:scale-105"
            >
              <span>Back to Solar System</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          {/* Educational information with animation */}
          <div className="pt-16 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <ExplorationInfo 
              scrollPosition={800} // Force content to be visible 
              onScrollToTop={toggleEducationalContent} 
            />
          </div>
        </div>
      )}
      
      <Controls />
      
      {/* Planet Information Dialog */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent className="bg-gradient-to-b from-gray-900 to-gray-950 text-white border-indigo-900/50 max-w-2xl overflow-hidden">
          {selectedPlanet && (
            <div>
              {/* Star particles in background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                    style={{ 
                      left: `${Math.random() * 100}%`, 
                      top: `${Math.random() * 100}%`,
                      animationDuration: `${2 + Math.random() * 3}s`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
              
              {/* Dialog Header with Planet Name */}
              <DialogHeader className="animate-fade-in">
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <div 
                    className="w-5 h-5 rounded-full animate-pulse" 
                    style={{ 
                      backgroundColor: selectedPlanet.color,
                      animationDuration: '3s'
                    }}
                  />
                  <span className="bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
                    {selectedPlanet.name}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-indigo-300">
                  Explore data and information about {selectedPlanet.name}
                </DialogDescription>
              </DialogHeader>
              
              {/* Planet Data Grid */}
              <div className="grid grid-cols-2 gap-4 py-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {/* Physical Characteristics */}
                <div className="space-y-3 bg-black/30 p-4 rounded-lg border border-indigo-900/30">
                  <h3 className="font-medium flex items-center gap-2">
                    <InfoIcon size={16} />
                    Physical Characteristics
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Diameter:</span>
                      <span>{selectedPlanet.diameter.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Density:</span>
                      <span>{selectedPlanet.density} g/cm³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gravity:</span>
                      <span>{selectedPlanet.gravity} m/s²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Temperature:</span>
                      <span>{selectedPlanet.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Moons:</span>
                      <span>{selectedPlanet.moons}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Has Rings:</span>
                      <span>{selectedPlanet.hasRings ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Orbital Characteristics */}
                <div className="space-y-3 bg-black/30 p-4 rounded-lg border border-indigo-900/30">
                  <h3 className="font-medium flex items-center gap-2">
                    <InfoIcon size={16} />
                    Orbital Characteristics
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Distance from Sun:</span>
                      <span>{selectedPlanet.distanceFromSun} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Orbit Period:</span>
                      <span>{selectedPlanet.orbitPeriod.toFixed(2)} Earth years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rotation Period:</span>
                      <span>{selectedPlanet.rotationPeriod.toFixed(2)} Earth days</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sonification Information */}
              <div 
                className="space-y-3 mt-2 bg-indigo-950/30 p-4 rounded-lg border border-indigo-600/20 animate-slide-up"
                style={{ animationDelay: '0.4s' }}
              >
                <h3 className="font-medium flex items-center gap-2 text-indigo-200">
                  <Music size={16} />
                  Classical Sonification
                </h3>
                <p className="text-sm text-indigo-200/80">
                  {selectedPlanet.name}'s unique sound is generated using real sampled instruments 
                  with recordings of actual musicians.
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm mt-2">
                  <div>
                    <span className="text-indigo-300">Instrument:</span>{" "}
                    <span className="font-medium">
                    {(() => {
                      // Get the instrument for this planet from our mapping
                      const instrumentName = planetInstruments[selectedPlanet.name.toLowerCase() as keyof typeof planetInstruments];
                      // Format it for display
                      return instrumentName || 'Piano';
                    })()}
                    </span>
                  </div>
                  <div>
                    <span className="text-indigo-300">Sound Duration:</span>{" "}
                    <span className="font-medium">2.5 seconds</span>
                  </div>
                </div>
              </div>
              
              {/* Footer with Action Buttons */}
              <div
                className="flex flex-col gap-4 mt-6 animate-fade-in"
                style={{ animationDelay: '0.5s' }}
              >
                <div className="flex items-center justify-between">
                  <Button 
                    onClick={() => playPlanetSound(selectedPlanet)} 
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Music className="mr-2 h-4 w-4" />
                    Play Sonification
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    className="text-xs text-gray-400"
                    onClick={() => window.open(`https://en.wikipedia.org/wiki/${selectedPlanet.name}_(planet)`, '_blank')}
                  >
                    Learn more
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
                
                {/* Ambient sound controls specific to this planet */}
                <div className="flex items-center justify-between bg-gray-900/50 p-2 rounded-md">
                  <div className="text-xs text-gray-400">
                    <span className="font-medium text-indigo-400">{selectedPlanet.name}</span>'s ambient sound:
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs flex items-center gap-1"
                    onClick={toggleAmbient}
                  >
                    {isAmbientPlaying ? (
                      <>
                        <PauseCircle size={14} className="text-blue-400" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle size={14} className="text-green-400" />
                        <span>Play</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Overlay showing currently playing planet */}
      {playingPlanet && !infoDialogOpen && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-full">
          Now playing: {playingPlanet} 
        </div>
      )}
      
      {/* Sound Controls */}
      <div className="fixed bottom-4 right-4 z-20">
        <SoundControls className="shadow-lg" />
      </div>
    </div>
  );
};

export default SolarSystem;
