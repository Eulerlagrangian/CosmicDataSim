import { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import * as Tone from 'tone';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { createSonification } from '../lib/sonification';
import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { PauseIcon, PlayIcon, UploadIcon } from 'lucide-react';

interface CsvSonificationProps {
  csvData: any[] | null;
  setCsvData: (data: any[] | null) => void;
  sonificationConfig: any;
  setSonificationConfig: (config: any) => void;
}

const CsvSonification = ({ csvData, setCsvData, sonificationConfig, setSonificationConfig }: CsvSonificationProps) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [duration, setDuration] = useState(0.2);
  const [selectedColumnX, setSelectedColumnX] = useState<string>('');
  const [selectedColumnY, setSelectedColumnY] = useState<string>('');
  const [scale, setScale] = useState<string>('major');
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const scales = {
    major: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
    minor: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5'],
    pentatonic: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'],
    blues: ['C4', 'Eb4', 'F4', 'Gb4', 'G4', 'Bb4', 'C5'],
    chromatic: ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5']
  };

  // Load the synth with enhanced settings for rich, clear sound
  const synth = useMemo(() => {
    // Create a reverb effect for spatial feel
    const reverb = new Tone.Reverb({
      decay: 1.5,
      wet: 0.2 // Subtle reverb, not overwhelming
    }).toDestination();
    
    // Create a limiter to prevent distortion
    const limiter = new Tone.Limiter(-3).connect(reverb);
    
    // Create a better sounding synth with richer harmonics
    const s = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "sine8" // Rich sine wave with harmonics
      },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 1.0
      }
    }).connect(limiter);
    
    // Set initial volume
    s.volume.value = 10; // Higher starting volume for better audibility
    
    return s;
  }, []);
  
  useEffect(() => {
    // Update global sonification config whenever parameters change
    if (selectedColumnX && selectedColumnY) {
      setSonificationConfig({
        tempo,
        duration,
        selectedColumnX,
        selectedColumnY,
        scale: scales[scale as keyof typeof scales],
        scaleName: scale
      });
    }
  }, [tempo, duration, selectedColumnX, selectedColumnY, scale, setSonificationConfig]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        setCsvData(results.data);
        if (results.data.length > 0) {
          const firstRow = results.data[0];
          const newHeaders = firstRow && typeof firstRow === 'object' ? Object.keys(firstRow as Record<string, unknown>) : [];
          setHeaders(newHeaders);
          
          // Set default columns if available
          if (newHeaders.length >= 1) setSelectedColumnX(newHeaders[0]);
          if (newHeaders.length >= 2) setSelectedColumnY(newHeaders[1]);
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
      }
    });
  };

  // Initialize audio context
  const initializeAudio = async () => {
    if (!audioInitialized) {
      try {
        await Tone.start();
        setAudioInitialized(true);
        
        // Play a silent note to ensure audio is fully initialized
        synth.triggerAttackRelease("C4", 0.01, "+0.1", 0);
        console.log("Audio context initialized successfully");
        return true;
      } catch (error) {
        console.error("Error initializing audio:", error);
        alert("Please click the screen to enable audio playback.");
        return false;
      }
    }
    return true;
  };

  // Play the sonification
  const playSonification = async () => {
    if (!csvData || !selectedColumnX || !selectedColumnY) {
      alert('Please upload CSV data and select columns first.');
      return;
    }

    try {
      setIsLoading(true);
      setPlaybackProgress(0);
      setTotalRows(csvData.length);
      
      // Initialize audio context
      const audioReady = await initializeAudio();
      if (!audioReady) {
        setIsLoading(false);
        return;
      }
      
      // Ensure we're using the correct volume
      synth.volume.value = 5;
      
      // Create progress tracking
      const progressInterval = setInterval(() => {
        if (isPlaying) {
          const currentTime = Tone.Transport.seconds;
          const totalDuration = duration * csvData.length;
          const progress = Math.min(Math.floor((currentTime / totalDuration) * 100), 100);
          setPlaybackProgress(progress);
        } else {
          clearInterval(progressInterval);
        }
      }, 100);
      
      // Create the sonification
      createSonification({
        data: csvData,
        xColumn: selectedColumnX,
        yColumn: selectedColumnY,
        synth,
        tempo,
        noteDuration: duration,
        scale: scales[scale as keyof typeof scales]
      });
      
      // Start playing
      Tone.Transport.start();
      setIsPlaying(true);
      
      console.log(`Sonifying data with: ${selectedColumnX} (x) and ${selectedColumnY} (y), using ${scale} scale`);
      
      // Add completion listener
      Tone.Transport.schedule(() => {
        setIsPlaying(false);
        setPlaybackProgress(100);
        console.log("Sonification playback complete");
        clearInterval(progressInterval);
        
        // Reset progress after 2 seconds
        setTimeout(() => {
          setPlaybackProgress(0);
        }, 2000);
      }, `+${duration * (csvData.length + 1)}`);
      
    } catch (error) {
      console.error('Error playing sonification:', error);
      alert('There was an error playing the sonification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Stop the sonification
  const stopSonification = () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    setIsPlaying(false);
    
    // Reset progress with a gentle fade out
    setTimeout(() => {
      setPlaybackProgress(0);
    }, 500);
    
    // Reset the debug display
    const debugElement = document.getElementById('sonification-debug');
    if (debugElement) {
      const debugSpan = debugElement.querySelector('span:nth-child(2)');
      if (debugSpan) {
        debugSpan.textContent = "Ready to play";
      }
    }
  };

  // Initialize file selection
  const selectFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col p-6 pb-24 max-w-6xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
        CSV Data Sonification
      </h1>
      
      <Card className="bg-gray-900/80 border-gray-800/50 mb-6 shadow-lg hover:shadow-indigo-900/10 transition-all">
        <CardHeader className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-indigo-100">Upload Data</CardTitle>
              <CardDescription className="text-sm">Select a CSV file to convert into sound</CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={selectFile} 
              className="flex items-center justify-center gap-2 bg-indigo-950/40 border-indigo-800/50 hover:bg-indigo-900/60 transition-all"
            >
              <UploadIcon size={16} />
              Select CSV File
            </Button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".csv" 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          {csvData && (
            <p className="text-sm text-indigo-300 mt-3 bg-indigo-950/30 py-1 px-3 rounded-md inline-block">
              {csvData.length} rows loaded successfully
            </p>
          )}
        </CardHeader>
      </Card>
      
      {csvData && headers.length > 0 ? (
        <div className="animate-fade-in">
          <Tabs defaultValue="mapping" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4 bg-gray-800/80 rounded-lg p-1">
              <TabsTrigger value="mapping" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                Data Mapping
              </TabsTrigger>
              <TabsTrigger value="sound" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                Sound Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="mapping" className="space-y-4 animate-fade-in">
              <Card className="bg-gray-900/80 border-gray-800/50 shadow-lg">
                <CardHeader className="py-4">
                  <CardTitle className="text-lg text-indigo-100">Data Mapping</CardTitle>
                  <CardDescription className="text-sm">Choose which columns to use for sonification</CardDescription>
                </CardHeader>
                <CardContent className="py-4 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="x-column" className="text-sm font-medium">Time/Sequence Column (X-axis)</Label>
                    <Select value={selectedColumnX} onValueChange={setSelectedColumnX}>
                      <SelectTrigger id="x-column" className="bg-gray-950 border-gray-700">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border border-gray-700 text-white">
                        {headers.map(header => (
                          <SelectItem key={`x-${header}`} value={header}>{header}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400">This column determines the timing sequence of notes</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="y-column" className="text-sm font-medium">Pitch Column (Y-axis)</Label>
                    <Select value={selectedColumnY} onValueChange={setSelectedColumnY}>
                      <SelectTrigger id="y-column" className="bg-gray-950 border-gray-700">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border border-gray-700 text-white">
                        {headers.map(header => (
                          <SelectItem key={`y-${header}`} value={header}>{header}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400">This column determines which musical notes are played</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sound" className="space-y-4 animate-fade-in">
              <Card className="bg-gray-900/80 border-gray-800/50 shadow-lg">
                <CardHeader className="py-4">
                  <CardTitle className="text-lg text-indigo-100">Sound Settings</CardTitle>
                  <CardDescription className="text-sm">Adjust how your data sounds</CardDescription>
                </CardHeader>
                <CardContent className="py-4 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="tempo" className="text-sm font-medium flex justify-between">
                      <span>Tempo (BPM)</span>
                      <span className="bg-indigo-900/30 text-indigo-200 px-2 py-0.5 rounded text-xs">{tempo}</span>
                    </Label>
                    <Slider 
                      id="tempo" 
                      min={60} 
                      max={240} 
                      step={1} 
                      value={[tempo]} 
                      onValueChange={(value) => setTempo(value[0])} 
                      className="py-1"
                    />
                    <p className="text-xs text-gray-400">Controls how fast the notes play (beats per minute)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-sm font-medium flex justify-between">
                      <span>Note Duration</span>
                      <span className="bg-indigo-900/30 text-indigo-200 px-2 py-0.5 rounded text-xs">{duration.toFixed(2)}s</span>
                    </Label>
                    <Slider 
                      id="duration" 
                      min={0.05} 
                      max={1} 
                      step={0.05} 
                      value={[duration]} 
                      onValueChange={(value) => setDuration(value[0])} 
                      className="py-1"
                    />
                    <p className="text-xs text-gray-400">How long each note sustains before the next one plays</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="scale" className="text-sm font-medium">Musical Scale</Label>
                    <Select value={scale} onValueChange={setScale}>
                      <SelectTrigger id="scale" className="bg-gray-950 border-gray-700">
                        <SelectValue placeholder="Select scale" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border border-gray-700 text-white">
                        <SelectItem value="major">Major (Bright, Happy)</SelectItem>
                        <SelectItem value="minor">Minor (Dark, Mysterious)</SelectItem>
                        <SelectItem value="pentatonic">Pentatonic (Eastern, Balanced)</SelectItem>
                        <SelectItem value="blues">Blues (Emotional, Soulful)</SelectItem>
                        <SelectItem value="chromatic">Chromatic (Complete Range)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400">The musical scale determines the mood of the sonification</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={playSonification}
              disabled={isPlaying || isLoading || !selectedColumnX || !selectedColumnY} 
              className={`px-6 py-2 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all ${isLoading ? 'animate-pulse' : ''}`}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  Preparing Audio...
                </>
              ) : (
                <>
                  <PlayIcon size={18} />
                  Play Sonification
                </>
              )}
            </Button>
            
            {isPlaying && (
              <Button 
                onClick={stopSonification}
                variant="outline" 
                className="px-6 py-2 flex items-center justify-center gap-2 border-red-700 text-red-500 hover:bg-red-950/30"
              >
                <PauseIcon size={18} />
                Stop Playback
              </Button>
            )}
            
            {/* Audio status indicator */}
            {audioInitialized && (
              <div className="flex items-center gap-2 text-xs text-green-500 absolute top-2 right-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                Audio Ready
              </div>
            )}
          </div>
          
          {/* Progress bar for sonification */}
          {(isPlaying || playbackProgress > 0) && (
            <>
              <div className="mt-4 relative overflow-hidden rounded-full h-2 bg-gray-800">
                <div 
                  className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-in-out"
                  style={{ width: `${playbackProgress}%` }}
                />
                <div className="absolute top-0 right-1 text-xs text-white mt-4">
                  {playbackProgress === 100 ? (
                    <span className="text-green-400 font-medium animate-pulse">Complete!</span>
                  ) : (
                    <span className="text-indigo-300">{playbackProgress}% (Row {Math.floor(totalRows * playbackProgress / 100)} of {totalRows})</span>
                  )}
                </div>
              </div>
              
              {/* Audio visualization */}
              <div className="flex justify-center mt-2 mb-1">
                <div className="flex gap-1 items-end h-16 bg-black/20 px-4 py-2 rounded-md">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div 
                      key={i}
                      className={`w-1.5 bg-gradient-to-t from-indigo-600 to-purple-500 transition-all duration-100 rounded-t ${isPlaying ? 'animate-audio-bar' : 'h-0'}`}
                      style={{ 
                        animationDelay: `${i * 0.05}s`,
                        animationDuration: `${0.4 + Math.random() * 0.6}s`,
                        opacity: isPlaying ? 0.7 + Math.random() * 0.3 : 0
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Live note display */}
              <div className="flex items-center justify-center gap-2 mt-1">
                <div className="text-xs text-white/70">Now playing:</div>
                <div 
                  id="sonification-debug" 
                  className="text-sm font-medium text-center text-white py-1 px-3 bg-gradient-to-r from-indigo-900/80 to-purple-900/80 rounded-md inline-flex items-center gap-2 shadow-lg border border-indigo-500/30"
                >
                  <span className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></span>
                  <span className="font-mono">{isPlaying ? "Analyzing data..." : "Ready to play"}</span>
                </div>
              </div>
            </>
          )}
          
          <div className="mt-8 bg-black/30 border border-gray-800/40 rounded-lg p-4 shadow-inner">
            <h3 className="text-sm font-medium text-indigo-300 mb-2">Data Preview</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    {headers.slice(0, 4).map(header => (
                      <th key={header} className="px-3 py-2 text-left font-medium text-indigo-200 bg-indigo-950/30">{header}</th>
                    ))}
                    {headers.length > 4 && <th className="px-3 py-2 text-left font-medium text-indigo-200 bg-indigo-950/30">...</th>}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 3).map((row, index) => (
                    <tr key={index} className="border-b border-gray-800/50 hover:bg-indigo-900/5">
                      {headers.slice(0, 4).map(header => (
                        <td key={`${index}-${header}`} className="px-3 py-2 text-gray-300">
                          {row[header as keyof typeof row] !== undefined ? String(row[header as keyof typeof row]).substring(0, 15) : 'N/A'}
                        </td>
                      ))}
                      {headers.length > 4 && <td className="px-3 py-2 text-gray-300">...</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">Showing first 3 rows of {csvData.length} total rows</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-900/30 rounded-lg border border-gray-800/30 shadow-inner animate-pulse-glow">
          <UploadIcon size={48} className="mb-6 text-indigo-400 opacity-70" />
          <h2 className="text-xl font-medium mb-3 text-indigo-100">No Data Loaded</h2>
          <p className="text-gray-400 max-w-md mb-6">
            Upload a CSV file to start sonifying your data. The sonification feature transforms numerical data 
            into musical notes, creating unique audio representations of your information.
          </p>
          <Button 
            onClick={selectFile} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 px-4 py-2 shadow-md hover:shadow-lg transition-all"
          >
            <UploadIcon size={16} />
            Select CSV File
          </Button>
        </div>
      )}
    </div>
  );
};

export default CsvSonification;
