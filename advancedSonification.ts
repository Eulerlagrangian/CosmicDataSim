import * as Tone from 'tone';
import { PlanetData } from '../types';
import { instrumentSamples, planetInstruments } from './instrumentSamples';

/**
 * Advanced sonification system that uses real sampled instruments
 * and planetary data to create unique sounds
 */

// Create different planet types for different sound characteristics
type PlanetType = 'terrestrial' | 'gas-giant' | 'ice-giant';

// Determine the planet type based on its properties
function getPlanetType(planet: PlanetData): PlanetType {
  if (planet.diameter < 20000) {
    return 'terrestrial'; // Mercury, Venus, Earth, Mars
  } else if (planet.density > 1.0) {
    return 'gas-giant'; // Jupiter, Saturn
  } else {
    return 'ice-giant'; // Uranus, Neptune
  }
}

// Create more sophisticated chords based on planet's characteristics
function createChord(planet: PlanetData, scale: string[]): string[] {
  const planetType = getPlanetType(planet);
  const baseNoteIndex = Math.floor((planet.index / 8) * scale.length);
  const baseNote = scale[baseNoteIndex % scale.length];
  
  // Create a chord based on planet's properties
  // Number of notes depends on planet size
  const chordSize = 1 + Math.min(4, Math.floor(planet.diameter / 30000));
  
  // Create chord notes
  const notes: string[] = [baseNote];
  
  // Different chord types based on planet characteristics
  let intervals: number[] = [];
  
  if (planetType === 'terrestrial') {
    // Terrestrial planets get major or minor chords depending on temperature
    if (planet.temperature > 0) {
      // Warmer planets get major chords (brighter sound)
      intervals = [4, 7]; // Major triad
    } else {
      // Colder planets get minor chords (melancholic sound)
      intervals = [3, 7]; // Minor triad
    }
    
    // Add 9th for planets with moons
    if (planet.moons > 0) {
      intervals.push(14); // Add 9th
    }
  } 
  else if (planetType === 'gas-giant') {
    // Gas giants get richer chords with sus4 or 7th
    if (planet.hasRings) {
      intervals = [5, 7, 11]; // Sus4 + 7th
    } else {
      intervals = [4, 7, 11]; // Maj7 chord
    }
  } 
  else {
    // Ice giants get ethereal chords (add9, sus2)
    if (planet.hasRings) {
      intervals = [2, 7, 11]; // Sus2 + 7th (ethereal)
    } else {
      intervals = [4, 7, 14]; // Major add9
    }
  }
  
  // Add notes based on calculated intervals and chord size
  const maxNotes = Math.min(intervals.length + 1, chordSize);
  for (let i = 0; i < maxNotes - 1; i++) {
    const interval = intervals[i % intervals.length];
    const noteIdx = (baseNoteIndex + interval) % scale.length;
    if (noteIdx >= 0 && noteIdx < scale.length) {
      notes.push(scale[noteIdx]);
    }
  }
  
  // For large planets add octave doubling
  if (planet.diameter > 100000 && notes.length > 0) {
    // Add octave of the base note for richness
    const octaveUp = scale[(baseNoteIndex + 12) % scale.length];
    if (octaveUp) {
      notes.push(octaveUp);
    }
  }
  
  return notes;
}

// Create an instrument using preset configurations that sound like real instruments
function createInstrumentSynth(instrumentName: string, isLargePlanet: boolean) {
  try {
    console.log(`Creating instrument synth: ${instrumentName}, large planet: ${isLargePlanet}`);
    
    // For large planets (Jupiter, Saturn, etc.), use very simple, clean sounds
    if (isLargePlanet) {
      console.log("Using simplified sound for large planet");
      // Very simple, clean sound for big planets - no fancy oscillators or long release
      return new Tone.PolySynth(Tone.AMSynth, {
        harmonicity: 1.0,
        oscillator: { 
          type: 'sine' // Pure sine wave for large planets
        },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.8,
          release: 0.8
        },
        modulation: {
          type: 'sine'
        },
        modulationEnvelope: {
          attack: 0.5,
          decay: 0,
          sustain: 1,
          release: 0.5
        }
      }).toDestination();
    }
    
    // Regular instruments for smaller planets with more character
    switch(instrumentName) {
      case 'piano':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: {
            attack: 0.01,
            decay: 0.3,
            sustain: 0.7,
            release: 2
          }
        }).toDestination();
        
      case 'violin':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.1,
            decay: 0.3,
            sustain: 0.8,
            release: 3
          }
        }).toDestination();
        
      case 'cello':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' }, // Removed fatsine
          envelope: {
            attack: 0.08,
            decay: 0.4,
            sustain: 0.8,
            release: 2 // Reduced from 4
          }
        }).toDestination();
        
      case 'guitar':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: {
            attack: 0.005,
            decay: 0.3,
            sustain: 0.3,
            release: 1.5
          }
        }).toDestination();
        
      case 'xylophone':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.001,
            decay: 0.5,
            sustain: 0.05,
            release: 0.5
          }
        }).toDestination();
        
      case 'marimba':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.005,
            decay: 0.6,
            sustain: 0.1,
            release: 1
          }
        }).toDestination();
        
      case 'harp':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: {
            attack: 0.005,
            decay: 0.5,
            sustain: 0.3,
            release: 3
          }
        }).toDestination();
        
      case 'bass':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' }, // Changed from fatsine
          envelope: {
            attack: 0.08,
            decay: 0.3,
            sustain: 0.5,
            release: 1.5 // Reduced from 3
          }
        }).toDestination();
        
      default:
        // Default instrument (simple synth)
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' }, // Simple sine wave
          envelope: {
            attack: 0.1,
            decay: 0.3,
            sustain: 0.6,
            release: 2
          }
        }).toDestination();
    }
  } catch (error) {
    console.error(`Error creating instrument synth for ${instrumentName}:`, error);
    // Fallback to a very basic synth
    return new Tone.PolySynth().toDestination();
  }
}

// Play a sound using instrument-like synth settings based on planet data
export async function playPlanetSound(
  planet: PlanetData,
  scale: string[] = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
  duration: number = 2
): Promise<void> {
  try {
    // Start Tone.js if not started
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    
    // Determine if this is a large planet
    const isLargePlanet = planet.diameter > 50000; // Jupiter, Saturn, Uranus, Neptune
    
    // Get the instrument assigned to this planet
    const instrumentName = planetInstruments[planet.name as keyof typeof planetInstruments] || 'piano';
    
    // Create the synth for this instrument with the isLargePlanet flag
    // This will create a simpler, cleaner synth for large planets regardless of their instrument
    const synth = createInstrumentSynth(instrumentName, isLargePlanet);
    
    // Create chords differently for large vs small planets
    let chord: string[];
    
    if (isLargePlanet) {
      // For large planets, use simpler chord structures (fewer notes)
      // Just use a simple note from the scale based on planet index
      const noteIndex = Math.floor((planet.index / 8) * scale.length);
      const baseNote = scale[noteIndex % scale.length];
      
      // For large planets, only use 1-2 notes without complex intervals
      // This creates a cleaner, simpler sound
      if (planet.diameter > 100000) { // Jupiter, Saturn
        chord = [baseNote];
      } else { // Uranus, Neptune
        chord = [baseNote, scale[(noteIndex + 4) % scale.length]]; // Add a simple 4th
      }
      
      console.log("Using simplified chord for large planet:", chord);
    } else {
      // For smaller planets, use the full chord creation
      chord = createChord(planet, scale);
    }
    
    // For small planets only, add a bit of reverb for ambience
    let reverb = null;
    if (!isLargePlanet) {
      reverb = new Tone.Reverb(0.8).toDestination();
      synth.connect(reverb);
    }
    
    // Calculate a reasonable duration based on planet size
    const sizeFactor = Math.min(1.8, 0.8 + ((planet.diameter / 200000) || 0));
    const noteDuration = duration * sizeFactor;
    
    // Play the chord with the instrument
    const now = Tone.now();
    
    // For percussive instruments like xylophone and marimba, stagger notes more
    const isPercussive = ['xylophone', 'marimba'].includes(instrumentName);
    const staggerAmount = isPercussive ? 0.15 : 0.08;
    
    // Play each note in the chord with appropriate timing
    chord.forEach((note, i) => {
      // Stagger the notes slightly for arpeggiated effect
      const time = now + (chord.length > 1 ? i * staggerAmount : 0);
      synth.triggerAttackRelease(note, noteDuration, time);
    });
    
    // Log the sound details for debugging
    console.log(`Playing ${instrumentName} for ${planet.name}:`, {
      instrument: instrumentName,
      chord,
      duration: noteDuration
    });
    
    // Track effects to clean up at the end
    const effectsToDispose: any[] = [];
    
    // Add the reverb to the cleanup list if it exists
    if (reverb) {
      effectsToDispose.push(reverb);
    }
    
    // Return a promise that resolves when the sound is finished
    return new Promise(resolve => {
      setTimeout(() => {
        // Clean up resources
        try {
          synth.dispose();
          // Dispose all effects
          effectsToDispose.forEach(effect => {
            if (effect) effect.dispose();
          });
        } catch (e) {
          console.warn("Error disposing audio resources:", e);
        }
        resolve();
      }, (noteDuration + (chord.length * staggerAmount) + 0.5) * 1000);
    });
  } catch (error) {
    console.error("Error playing planet sound:", error);
    return Promise.resolve(); // Return resolved promise to prevent further errors
  }
}

// Create a complete sonification of the solar system
export async function sonifySolarSystem(
  planets: PlanetData[],
  scale: string[] = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
  durationPerPlanet: number = 2
) {
  // Start from innermost planet
  const sortedPlanets = [...planets].sort((a, b) => a.distanceFromSun - b.distanceFromSun);
  
  // Play each planet one after another
  for (const planet of sortedPlanets) {
    await playPlanetSound(planet, scale, durationPerPlanet);
    // Add small delay between planets
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Advanced sonification based on CSV data
export async function sonifyData({
  data,
  xColumn,
  yColumn,
  zColumn,
  baseScale = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
  tempo = 120,
  noteDuration = 0.2,
}: {
  data: any[];
  xColumn: string;
  yColumn: string;
  zColumn?: string;
  baseScale?: string[];
  tempo?: number;
  noteDuration?: number;
}) {
  // Clear any existing sequences
  Tone.Transport.cancel();
  
  // Set the tempo
  Tone.Transport.bpm.value = tempo;
  
  // Extract and normalize y values for pitch
  const yValues = data.map(row => row[yColumn]).filter(val => val !== undefined && val !== null);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const yRange = yMax - yMin;
  
  // Sort data by x-column if it's a numeric column
  let sortedData = [...data];
  if (typeof data[0][xColumn] === 'number') {
    sortedData.sort((a, b) => a[xColumn] - b[xColumn]);
  }
  
  // Create the main synth
  const synth = new Tone.PolySynth().toDestination();
  
  // Add reverb for space-like quality
  const reverb = new Tone.Reverb(1.5).toDestination();
  synth.connect(reverb);
  
  // Create a sequence
  const sequence = new Tone.Sequence(
    (time, idx) => {
      // Get the current row
      const row = sortedData[idx];
      if (!row || row[yColumn] === undefined || row[yColumn] === null) return;
      
      // Normalize the value to map to our scale
      const normalizedValue = yRange === 0 ? 0 : (row[yColumn] - yMin) / yRange;
      const noteIndex = Math.floor(normalizedValue * (baseScale.length - 1));
      const note = baseScale[noteIndex];
      
      // Play the note
      synth.triggerAttackRelease(note, noteDuration, time);
      
      // Log for visualization
      Tone.Draw.schedule(() => {
        console.log(`Playing data point ${idx}: ${row[xColumn]} -> ${row[yColumn]} -> ${note}`);
      }, time);
    },
    Array.from({ length: sortedData.length }, (_, i) => i),
    noteDuration
  );
  
  // Start the sequence
  sequence.start(0);
  Tone.Transport.start();
  
  // Stop after sequence completes
  Tone.Transport.schedule(() => {
    console.log("Sonification complete");
    Tone.Transport.stop();
    sequence.dispose();
    synth.dispose();
    reverb.dispose();
  }, `+${noteDuration * sortedData.length + 1}`);
  
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    sequence.dispose();
    synth.dispose();
    reverb.dispose();
  };
}