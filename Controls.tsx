import { useState } from 'react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { HelpCircle, Info, Volume2, VolumeX } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import * as Tone from 'tone';

const Controls = () => {
  const [helpOpen, setHelpOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  
  const toggleMute = () => {
    setMuted(!muted);
    // Actually mute the audio
    if (muted) {
      Tone.getDestination().mute = false;
      console.log('Audio unmuted');
    } else {
      Tone.getDestination().mute = true;
      console.log('Audio muted');
    }
  };
  
  return (
    <div className="absolute bottom-4 right-4 flex gap-3">
      <Button 
        variant="outline" 
        size="icon" 
        className={cn(
          "rounded-full w-12 h-12 bg-black/70 border-gray-700 hover:bg-black/90",
          "text-white"
        )}
        onClick={toggleMute}
      >
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </Button>
      
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className={cn(
              "rounded-full w-12 h-12 bg-black/70 border-gray-700 hover:bg-black/90",
              "text-white"
            )}
          >
            <HelpCircle size={20} />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900 text-white border-gray-800 max-w-md">
          <DialogHeader>
            <DialogTitle>Solar System Explorer</DialogTitle>
            <DialogDescription className="text-gray-400">
              How to navigate and interact with the 3D space environment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="flex gap-4 items-start">
              <div className="rounded-full bg-gray-800 p-2">
                <Info size={20} />
              </div>
              <div>
                <h3 className="font-medium mb-1">Navigation</h3>
                <p className="text-sm text-gray-400">
                  • Rotate: Left mouse button drag<br />
                  • Pan: Right mouse button drag<br />
                  • Zoom: Mouse wheel scroll
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="rounded-full bg-gray-800 p-2">
                <Info size={20} />
              </div>
              <div>
                <h3 className="font-medium mb-1">Interaction</h3>
                <p className="text-sm text-gray-400">
                  • Click on any planet to hear its unique sound and view detailed information<br />
                  • Each planet's sound is generated based on its physical properties<br />
                  • Use the mute button to toggle audio on/off
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="rounded-full bg-gray-800 p-2">
                <Info size={20} />
              </div>
              <div>
                <h3 className="font-medium mb-1">Planet Data</h3>
                <p className="text-sm text-gray-400">
                  The visualization shows key data for each planet:<br />
                  • Orbital distance and period<br />
                  • Size (diameter)<br />
                  • Rotation period<br />
                  • Temperature and number of moons
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Controls;
