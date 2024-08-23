// utils/alertSound.js

import sound from "./alert-sound.mp3"
export const playAlertSound = () => {
    const audio = new Audio(sound);
    audio.play();
  };
  