import { playPreroll } from './utils';

const videoPlayer = document.getElementById('myVideo');

videoPlayer.addEventListener('play', function handler() {
  playPreroll();
  videoPlayer.removeEventListener('play', handler);
});
