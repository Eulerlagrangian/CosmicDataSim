import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { MusicIcon, Rocket } from 'lucide-react';

interface NavbarProps {
  mode: 'sonification' | 'exploration';
  setMode: (mode: 'sonification' | 'exploration') => void;
}

const Navbar = ({ mode, setMode }: NavbarProps) => {
  return (
    <header className="border-b border-gray-800 bg-black py-3 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-white">Cosmic Data Sonifier</div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-full bg-gray-900 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('sonification')}
              className={cn(
                "rounded-full flex items-center gap-2 px-4",
                mode === 'sonification' 
                  ? "bg-primary text-white" 
                  : "text-gray-400 hover:text-white"
              )}
            >
              <MusicIcon size={16} />
              <span>Sonification</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('exploration')}
              className={cn(
                "rounded-full flex items-center gap-2 px-4",
                mode === 'exploration' 
                  ? "bg-primary text-white" 
                  : "text-gray-400 hover:text-white"
              )}
            >
              <Rocket size={16} />
              <span>Exploration</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
