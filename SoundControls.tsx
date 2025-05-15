import React, { useEffect, useState } from 'react';
import { useAudio } from '../lib/stores/useAudio';
import { 
  Volume2, 
  VolumeX, 
  Music, 
  PauseCircle,
  PlayCircle 
} from 'lucide-react';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface SoundControlsProps {
  className?: string;
}

const SoundControls: React.FC<SoundControlsProps> = ({ className = '' }) => {
  const {
    isMuted,
    toggleMute,
    ambientVolume,
    setAmbientVolume,
    isAmbientPlaying,
    toggleAmbient,
    currentPlanet
  } = useAudio();

  // Local state to track displayed volume during adjustment
  const [displayVolume, setDisplayVolume] = useState(ambientVolume * 100);
  
  // Update display volume when ambient volume changes
  useEffect(() => {
    setDisplayVolume(Math.round(ambientVolume * 100));
  }, [ambientVolume]);

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setAmbientVolume(newVolume);
  };

  return (
    <div className={`flex items-center space-x-2 bg-black/40 backdrop-blur-sm p-2 rounded-lg ${className}`}>
      <TooltipProvider>
        {/* Master mute button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className={`rounded-full ${isMuted ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {isMuted ? 'Unmute sounds' : 'Mute sounds'}
          </TooltipContent>
        </Tooltip>

        {/* Ambient sound toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleAmbient}
              disabled={isMuted || !currentPlanet}
              className={`rounded-full ${!currentPlanet ? 'opacity-50' : ''}`}
            >
              {isAmbientPlaying ? (
                <PauseCircle size={18} className="text-blue-400 hover:text-blue-300" />
              ) : (
                <PlayCircle size={18} className="text-purple-400 hover:text-purple-300" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {isAmbientPlaying ? 'Pause ambient sound' : 'Play ambient sound'}
            {!currentPlanet && ' (Select a planet first)'}
          </TooltipContent>
        </Tooltip>

        {/* Volume slider */}
        <div className="flex items-center space-x-2 ml-2">
          <Music size={14} className="text-gray-400" />
          <div className="w-24">
            <Slider
              value={[displayVolume]}
              min={0}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-full"
              disabled={isMuted}
            />
          </div>
          <span className="text-xs text-gray-400 w-8">{displayVolume}%</span>
        </div>

        {/* Planet name indicator */}
        {currentPlanet && (
          <div className={`ml-2 px-3 py-1.5 rounded text-xs ${isAmbientPlaying ? 'bg-indigo-900/70 text-indigo-300 border border-indigo-700/50' : 'bg-gray-900/50 text-gray-400'} flex items-center transition-all duration-300`}>
            {isAmbientPlaying ? (
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse mr-1.5"></span>
            ) : (
              <Music size={10} className="mr-1.5 opacity-70" />
            )}
            <span className="font-medium">
              {currentPlanet.charAt(0).toUpperCase() + currentPlanet.slice(1)}
            </span>
          </div>
        )}
      </TooltipProvider>
    </div>
  );
};

export default SoundControls;