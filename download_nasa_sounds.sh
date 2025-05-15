#!/bin/bash

SOUNDS_DIR="client/public/sounds/nasa"
mkdir -p $SOUNDS_DIR

# Mercury
curl -o "$SOUNDS_DIR/mercury.mp3" "https://www.nasa.gov/wp-content/uploads/2015/07/516624main_magnetosphere_MER_A_MESSENGER.mp3"

# Venus
curl -o "$SOUNDS_DIR/venus.mp3" "https://www.nasa.gov/wp-content/uploads/2015/07/403869main_venuspioneer.mp3"

# Earth
curl -o "$SOUNDS_DIR/earth.mp3" "https://www.nasa.gov/wp-content/uploads/2015/07/608742main_Chorus_1.mp3"

# Mars
curl -o "$SOUNDS_DIR/mars.mp3" "https://www.nasa.gov/wp-content/uploads/2015/07/398721main_Mars500Day-2.mp3"

# Jupiter
curl -o "$SOUNDS_DIR/jupiter.mp3" "https://www.nasa.gov/wp-content/uploads/2015/07/401659main_pio10-jupiter-entering-magnetosphere.mp3"

# Saturn
curl -o "$SOUNDS_DIR/saturn.mp3" "https://www.nasa.gov/wp-content/uploads/2015/07/410519main_Clock_Saturn_B.mp3"

# Uranus
curl -o "$SOUNDS_DIR/uranus.mp3" "https://www.nasa.gov/wp-content/uploads/2015/07/604808main_uranus1.mp3"

# Neptune  
curl -o "$SOUNDS_DIR/neptune.mp3" "https://www.nasa.gov/wp-content/uploads/2015/07/383799main_neptuneblue.mp3"

# Sun
curl -o "$SOUNDS_DIR/sun.mp3" "https://www.nasa.gov/wp-content/uploads/2015/07/433728main_Sunnoise20100706_64kb.mp3"

echo "All NASA planet sounds downloaded to $SOUNDS_DIR"