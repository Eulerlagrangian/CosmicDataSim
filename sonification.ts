import * as Tone from 'tone';

interface SonificationOptions {
  data: any[];
  xColumn: string;
  yColumn: string;
  synth: Tone.PolySynth;
  tempo?: number;
  noteDuration?: number;
  scale?: string[];
}

export function createSonification({
  data,
  xColumn,
  yColumn,
  synth,
  tempo = 120,
  noteDuration = 0.2,
  scale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
}: SonificationOptions) {
  // Clear any existing sequences
  Tone.Transport.cancel();
  
  // Set the tempo
  Tone.Transport.bpm.value = tempo;
  
  // Extract values and normalize them
  const yValues = data.map(row => row[yColumn]).filter(val => val !== undefined && val !== null);
  const min = Math.min(...yValues);
  const max = Math.max(...yValues);
  const range = max - min;
  
  // Sort data by x-column if it's a numeric column
  let sortedData = [...data];
  if (typeof data[0][xColumn] === 'number') {
    sortedData.sort((a, b) => a[xColumn] - b[xColumn]);
  }
  
  // Create a sequence
  const noteLength = noteDuration;
  new Tone.Sequence(
    (time, idx) => {
      // Get the current row
      const row = sortedData[idx];
      if (!row || row[yColumn] === undefined || row[yColumn] === null) return;
      
      // Normalize the value to map to our scale - with safety checks
      const yValue = parseFloat(row[yColumn]);
      // Handle NaN, undefined, null with safer defaults
      const normalizedValue = range === 0 || isNaN(yValue) ? 0.5 : (yValue - min) / range;
      
      // Ensure noteIndex is within valid bounds
      const safeNormalizedValue = Math.max(0, Math.min(1, normalizedValue));
      const noteIndex = Math.floor(safeNormalizedValue * (scale.length - 1));
      const note = scale[noteIndex] || scale[0]; // Fallback to first note if undefined
      
      // Ensure the note is valid
      if (!note) {
        console.warn(`Invalid note at row ${idx}, using default note`);
        synth.volume.value = 15; // Increase volume (15dB louder)
        synth.triggerAttackRelease('C4', noteLength, time, 1.0);
      } else {
        // Dynamically adjust volume based on the note value
        // Higher notes slightly louder for better balance
        const noteValue = note.match(/[A-G]#?(\d+)/)?.[1];
        const octave = noteValue ? parseInt(noteValue) : 4;
        
        // Adjust volume based on octave (higher octaves slightly louder)
        const octaveVolume = 15 + (octave - 3); // Base volume 15dB + octave adjustment
        synth.volume.value = Math.min(octaveVolume, 20); // Cap at 20dB
        
        // Play with high velocity for clearer sound
        synth.triggerAttackRelease(note, noteLength, time, 1.0);
      }
      
      // Log the information
      console.log(`Row ${idx}: Playing note ${note || 'C4'} (${row[xColumn]} → ${row[yColumn]})`);
      
      // Update the debug element with note information
      const debugElement = document.getElementById('sonification-debug');
      if (debugElement) {
        // Find the span inside the debug element (the second child element)
        const debugSpan = debugElement.querySelector('span:nth-child(2)');
        if (debugSpan) {
          debugSpan.textContent = `Row ${idx}: Note ${note || 'C4'} (${Math.round(row[yColumn])})`;
        } else {
          // Fallback if span not found
          debugElement.textContent = `Row ${idx}: Note ${note || 'C4'}`;
        }
      }
    },
    Array.from({ length: sortedData.length }, (_, i) => i),
    noteLength
  ).start(0);
  
  // Reset the transport position
  Tone.Transport.position = 0;
  
  // Add a callback to stop when sequence is complete
  Tone.Transport.schedule(() => {
    console.log("Sonification complete");
    Tone.Transport.stop();
  }, `+${noteLength * sortedData.length}`);
  
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
  };
}

// Function to create a single note based on a data value
export function createNoteFromValue(
  value: number, 
  min: number, 
  max: number, 
  scale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
) {
  const range = max - min;
  const normalizedValue = range === 0 ? 0 : (value - min) / range;
  const noteIndex = Math.floor(normalizedValue * (scale.length - 1));
  return scale[noteIndex];
}

// Function to create a chord from multiple data values
export function createChordFromValues(
  values: number[], 
  min: number, 
  max: number, 
  scale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
) {
  return values.map(value => createNoteFromValue(value, min, max, scale));
}
