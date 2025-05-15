import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import Navbar from './components/Navbar';
import CsvSonification from './components/CsvSonification';
import SolarSystem from './components/SolarSystem';
import { cn } from './lib/utils';
import { useAudio } from './lib/stores/useAudio';

// Define the application modes
type AppMode = 'sonification' | 'exploration';

// Helper component to initialize audio outside of main App component
// This avoids the React 18 strict mode double-initialization issue
const AudioInitializer = () => {
  const { setHitSound, setSuccessSound } = useAudio();
  
  useEffect(() => {
    // Initialize common sound effects
    const initSounds = async () => {
      try {
        // Load hit sound
        const hitSound = new Audio('/sounds/hit.mp3');
        await hitSound.load();
        setHitSound(hitSound);
        
        // Load success sound
        const successSound = new Audio('/sounds/success.mp3');
        await successSound.load();
        setSuccessSound(successSound);
        
        console.log('Audio system initialized');
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };
    
    initSounds();
  }, [setHitSound, setSuccessSound]);
  
  return null; // This component doesn't render anything
};

function App() {
  const [mode, setMode] = useState<AppMode>('exploration');
  const [csvData, setCsvData] = useState<any[] | null>(null);
  const [sonificationConfig, setSonificationConfig] = useState<any>({});
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-black text-white flex flex-col h-screen">
        {/* Initialize audio system */}
        <AudioInitializer />
        
        <Navbar mode={mode} setMode={setMode} />
        
        <main className={cn(
          "flex-1 flex flex-col",
          "transition-all duration-500",
          mode === 'sonification' ? "overflow-y-auto" : ""
        )}>
          {mode === 'sonification' ? (
            <CsvSonification 
              csvData={csvData} 
              setCsvData={setCsvData}
              sonificationConfig={sonificationConfig}
              setSonificationConfig={setSonificationConfig}
            />
          ) : (
            <SolarSystem 
              csvData={csvData}
              sonificationConfig={sonificationConfig}
            />
          )}
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
