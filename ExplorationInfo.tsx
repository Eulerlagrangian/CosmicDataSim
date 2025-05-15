import { useEffect, useRef } from 'react';
import { PlanetData } from '../types';
import { planetData } from '../lib/planetData';
import { Button } from './ui/button';
import { ArrowUp, Info, Music, Star, Volume2 } from 'lucide-react';

interface ExplorationInfoProps {
  scrollPosition: number;
  onScrollToTop?: () => void;
}

const ExplorationInfo = ({ scrollPosition, onScrollToTop }: ExplorationInfoProps) => {
  const infoRef = useRef<HTMLDivElement>(null);
  
  return (
    <div 
      ref={infoRef}
      className="w-full max-w-4xl mx-auto px-6 pb-32 text-white"
      style={{ 
        opacity: 1, // Always show at full opacity
        transition: 'opacity 0.3s',
      }}
    >
      {/* Back to top button (fixed position) */}
      {scrollPosition > 600 && onScrollToTop && (
        <Button
          onClick={onScrollToTop}
          className="fixed bottom-10 right-10 h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg z-50 grid place-items-center"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      )}
      
      {/* Intro section */}
      <section className="mb-24 mt-8">
        <h2 className="text-4xl font-bold mb-6 text-indigo-300">Exploring Our Solar System</h2>
        <p className="text-xl leading-relaxed mb-8 text-gray-300">
          Our solar system consists of the Sun and everything bound to it by gravity — the planets Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune; dwarf planets such as Pluto; dozens of moons; and millions of asteroids, comets, and meteoroids.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            icon={<Star className="h-10 w-10 text-yellow-400" />}
            title="Celestial Bodies"
            description="Explore the diverse objects in our solar system, from rocky inner planets to gas giants and beyond."
          />
          <InfoCard
            icon={<Music className="h-10 w-10 text-blue-400" />}
            title="Data Sonification"
            description="Experience how astronomical data can be transformed into musical patterns and sounds."
          />
          <InfoCard
            icon={<Info className="h-10 w-10 text-green-400" />}
            title="Planetary Science"
            description="Learn about the unique characteristics that define each planet in our cosmic neighborhood."
          />
        </div>
      </section>
      
      {/* Data Sonification section */}
      <section className="mb-24">
        <h2 className="text-4xl font-bold mb-6 text-blue-300">Understanding Data Sonification</h2>
        <div className="md:flex items-start gap-8">
          <div className="md:w-2/3">
            <p className="text-xl leading-relaxed mb-6 text-gray-300">
              Data sonification is the process of transforming data into sound, allowing us to use our sense of hearing to interpret scientific information. In astronomy, sonification helps scientists and the public experience cosmic data in a new way.
            </p>
            <p className="text-xl leading-relaxed mb-6 text-gray-300">
              In our solar system explorer, each planet produces sound based on its physical properties. Larger planets may have deeper tones, while different compositions influence timbre and harmony.
            </p>
          </div>
          <div className="md:w-1/3 bg-indigo-900/50 rounded-xl p-6 shadow-lg md:mt-0 mt-6">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              How We Map Data to Sound
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Planet size affects note frequency</li>
              <li>Orbital period influences rhythm</li>
              <li>Density changes instrument selection</li>
              <li>Planetary composition alters timbre</li>
              <li>Distance from Sun maps to spatial positioning</li>
            </ul>
          </div>
        </div>
      </section>
      
      {/* Planets Information */}
      <section>
        <h2 className="text-4xl font-bold mb-10 text-indigo-300">The Planets</h2>
        <div className="space-y-24">
          {planetData.map((planet) => (
            <PlanetInfoCard key={planet.name} planet={planet} />
          ))}
        </div>
      </section>
    </div>
  );
};

// Helper component for info cards
const InfoCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-indigo-900/30 rounded-xl p-6 backdrop-blur-sm transition-all duration-300 hover:bg-indigo-800/40">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

// Planet info card component
const PlanetInfoCard = ({ planet }: { planet: PlanetData }) => {
  // Generate custom background gradient based on planet color
  const gradientStyle = {
    background: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, ${planet.color}33 100%)`,
  };
  
  return (
    <div className="rounded-2xl overflow-hidden shadow-xl" style={gradientStyle}>
      <div className="p-8">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-3xl font-bold mb-2">{planet.name}</h3>
            <div className="w-16 h-1 bg-white opacity-70 mb-4"></div>
          </div>
          <div 
            className="h-16 w-16 rounded-full" 
            style={{ backgroundColor: planet.color }}
          ></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div>
            <h4 className="text-xl font-semibold mb-4">Physical Characteristics</h4>
            <ul className="space-y-2 text-gray-300">
              <li><span className="font-semibold">Diameter:</span> {planet.diameter.toLocaleString()} km</li>
              <li><span className="font-semibold">Distance from Sun:</span> {(planet.distanceFromSun * 10).toFixed(1)} AU</li>
              <li><span className="font-semibold">Orbit Period:</span> {planet.orbitPeriod.toFixed(2)} Earth years</li>
              <li><span className="font-semibold">Rotation Period:</span> {planet.rotationPeriod.toFixed(2)} Earth days</li>
              <li><span className="font-semibold">Density:</span> {planet.density.toFixed(2)} g/cm³</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">Sonification Properties</h4>
            <p className="text-gray-300 mb-4">
              {planet.name}'s sound is characterized by its {planet.diameter > 50000 ? "large size producing deep tones" : "smaller size producing higher tones"}
              {planet.hasRings ? " with harmonics representing its ring system" : ""}.
              {planet.density > 3 ? " Its high density creates a richer timbre." : " Its lower density creates a more open sound."}
            </p>
            
            <div className="bg-black/30 rounded-lg p-4 mt-2">
              <h5 className="font-semibold mb-2">Unique Features</h5>
              <ul className="list-disc list-inside text-gray-300">
                {planet.hasRings && <li>Ring system</li>}
                {planet.moons > 0 && <li>{planet.moons} moons</li>}
                {planet.name === "Earth" && <li>Only known planet with life</li>}
                {planet.name === "Jupiter" && <li>Great Red Spot storm system</li>}
                {planet.name === "Saturn" && <li>Most prominent ring system</li>}
                {planet.name === "Mars" && <li>Olympus Mons (tallest mountain)</li>}
                {planet.name === "Venus" && <li>Hottest planet due to greenhouse effect</li>}
                {planet.name === "Mercury" && <li>Extreme temperature variations</li>}
                {planet.name === "Uranus" && <li>Rotates on its side</li>}
                {planet.name === "Neptune" && <li>Strongest winds in the solar system</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorationInfo;