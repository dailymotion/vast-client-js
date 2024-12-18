import { playPreroll } from './utils';

const videoPlayer = document.getElementById('myVideo');

videoPlayer.addEventListener('play', playPreroll, { once: true });
