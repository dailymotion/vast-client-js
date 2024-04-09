import { playPreroll } from './utils';

const videoPlayer = document.getElementById('myVideo');
let prerollPlayed = false;

videoPlayer.addEventListener('play', () => {
  if (!prerollPlayed) {
    playPreroll();
    prerollPlayed = true;
  }
});
