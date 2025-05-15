import { create } from "zustand";
import { planetSounds } from "../planetSounds";
import { PlanetData } from "../../types";

interface AudioState {
  // Main audio elements
  backgroundMusic: HTMLAudioElement | null;
  ambientSound: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  
  // Ambient settings
  currentPlanet: string | null;
  ambientVolume: number;
  isAmbientPlaying: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  
  // Ambient music functions
  changePlanetAmbient: (planet: PlanetData | null) => void;
  setAmbientVolume: (volume: number) => void;
  toggleAmbient: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  // Main audio elements
  backgroundMusic: null,
  ambientSound: null, 
  hitSound: null,
  successSound: null,
  isMuted: false, // Start with sound enabled
  
  // Ambient settings
  currentPlanet: null,
  ambientVolume: 0.3, // Default ambient volume (30%)
  isAmbientPlaying: false,
  
  // Setter functions
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  
  toggleMute: () => {
    const { isMuted, ambientSound, backgroundMusic } = get();
    const newMutedState = !isMuted;
    
    // Update the muted state
    set({ isMuted: newMutedState });
    
    // Mute/unmute any playing sounds
    if (ambientSound) {
      ambientSound.muted = newMutedState;
    }
    
    if (backgroundMusic) {
      backgroundMusic.muted = newMutedState;
    }
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Success sound skipped (muted)");
        return;
      }
      
      successSound.currentTime = 0;
      successSound.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    }
  },
  
  // Changes the ambient sound based on the selected planet
  changePlanetAmbient: (planet) => {
    const { ambientSound, ambientVolume, isMuted, isAmbientPlaying } = get();
    
    // If no planet selected or muted, clean up state
    if (!planet || isMuted) {
      // Fade out any current sound before stopping
      if (ambientSound) {
        const fadeOutInterval = setInterval(() => {
          if (ambientSound.volume > 0.05) {
            ambientSound.volume = Math.max(0, ambientSound.volume - 0.05);
          } else {
            clearInterval(fadeOutInterval);
            ambientSound.pause();
            ambientSound.currentTime = 0;
            
            set({ 
              ambientSound: null,
              currentPlanet: null,
              isAmbientPlaying: false
            });
          }
        }, 50);
      } else {
        set({ 
          ambientSound: null,
          currentPlanet: null,
          isAmbientPlaying: false
        });
      }
      return;
    }
    
    // Get the appropriate sound file for this planet
    const planetName = planet.name.toLowerCase();
    const soundPath = planetSounds[planetName as keyof typeof planetSounds] || planetSounds.earth;
    
    // Create new audio element for this planet
    const newAmbient = new Audio(soundPath);
    newAmbient.loop = true;
    newAmbient.volume = 0; // Start at 0 volume and fade in
    newAmbient.muted = isMuted;
    
    // Fade out current sound if playing
    if (ambientSound) {
      // Store previous volume for reference
      const prevVolume = ambientSound.volume;
      
      // Fade out current sound
      const fadeOutInterval = setInterval(() => {
        if (ambientSound.volume > 0.05) {
          ambientSound.volume = Math.max(0, ambientSound.volume - 0.05);
        } else {
          clearInterval(fadeOutInterval);
          ambientSound.pause();
          ambientSound.currentTime = 0;
          
          // Once the old sound is faded out, start the new one
          if (isAmbientPlaying) {
            newAmbient.play()
              .then(() => {
                // Fade in the new sound
                let currentVol = 0;
                const fadeInInterval = setInterval(() => {
                  if (currentVol < ambientVolume) {
                    currentVol = Math.min(ambientVolume, currentVol + 0.05);
                    newAmbient.volume = currentVol;
                  } else {
                    clearInterval(fadeInInterval);
                  }
                }, 50);
              })
              .catch(error => console.error('Failed to play ambient sound:', error));
          }
        }
      }, 50);
    } else if (isAmbientPlaying) {
      // No previous sound, just start this one with fade-in
      newAmbient.play()
        .then(() => {
          // Fade in the new sound
          let currentVol = 0;
          const fadeInInterval = setInterval(() => {
            if (currentVol < ambientVolume) {
              currentVol = Math.min(ambientVolume, currentVol + 0.05);
              newAmbient.volume = currentVol;
            } else {
              clearInterval(fadeInInterval);
            }
          }, 50);
        })
        .catch(error => console.error('Failed to play ambient sound:', error));
    }
    
    // Update the state with the new ambient sound
    set({ 
      ambientSound: newAmbient,
      currentPlanet: planetName,
      isAmbientPlaying: isAmbientPlaying
    });
    
    console.log(`Ambient sound changed to ${planetName}`);
  },
  
  // Adjust ambient volume
  setAmbientVolume: (volume) => {
    const { ambientSound } = get();
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    if (ambientSound) {
      ambientSound.volume = clampedVolume;
    }
    
    set({ ambientVolume: clampedVolume });
  },
  
  // Toggle ambient sound playback with smooth fade-in/out
  toggleAmbient: () => {
    const { ambientSound, isAmbientPlaying, isMuted, currentPlanet, ambientVolume } = get();
    
    // Update the state first
    const newPlayingState = !isAmbientPlaying;
    set({ isAmbientPlaying: newPlayingState });
    
    // Can't play if muted or no sound
    if (isMuted || !ambientSound || !currentPlanet) {
      console.log(`Ambient sound ${newPlayingState ? 'would start' : 'would stop'} (${isMuted ? 'muted' : 'no sound available'})`);
      return;
    }
    
    if (newPlayingState) {
      // Fade in - first ensure the sound is loaded and ready at zero volume
      ambientSound.volume = 0;
      
      // Using setTimeout to ensure the browser allows audio to play after a user interaction
      setTimeout(() => {
        // Start playing with additional error handling
        if (ambientSound) {
          const playPromise = ambientSound.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // Fade in the volume
                let currentVol = 0;
                const fadeInInterval = setInterval(() => {
                  if (currentVol < ambientVolume) {
                    currentVol = Math.min(ambientVolume, currentVol + 0.05);
                    ambientSound.volume = currentVol;
                  } else {
                    clearInterval(fadeInInterval);
                    console.log(`Ambient sound for ${currentPlanet} faded in`);
                  }
                }, 50);
              })
              .catch(error => {
                console.error('Failed to play ambient sound:', error);
                // Reset the state if play failed
                set({ isAmbientPlaying: false });
              });
          }
        }
      }, 100);
    } else {
      // Fade out and then stop
      if (ambientSound) {
        // Gradually decrease volume and then pause
        const fadeOutInterval = setInterval(() => {
          if (ambientSound.volume > 0.05) {
            ambientSound.volume = Math.max(0, ambientSound.volume - 0.05);
          } else {
            clearInterval(fadeOutInterval);
            ambientSound.pause();
            console.log(`Ambient sound for ${currentPlanet} faded out`);
          }
        }, 50);
      }
    }
    
    console.log(`Ambient sound ${newPlayingState ? 'started' : 'stopping'}...`);
  }
}));
