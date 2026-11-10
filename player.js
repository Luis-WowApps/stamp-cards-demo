const video = document.querySelector('#video');
const player = document.querySelector('#player');
const play = document.querySelector('#play');
const restart = document.querySelector('#restart');
const seek = document.querySelector('#seek');
const time = document.querySelector('#time');
const mute = document.querySelector('#mute');
const volume = document.querySelector('#volume');
const fullscreen = document.querySelector('#fullscreen');
const status = document.querySelector('#status');

function message(text = '') {
  status.textContent = text;
  status.hidden = !text;
}

function showLoadError() {
  message('The video could not load. Please reload the page or download the video below.');
}

function clock(seconds) {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}

function update() {
  const duration = Number.isFinite(video.duration) ? video.duration : 0;
  const label = video.ended ? 'Replay' : video.paused ? 'Play' : 'Pause';
  play.innerHTML = `${video.paused ? '▶' : 'Ⅱ'} <span>${label}</span>`;
  play.setAttribute('aria-label', `${label} video`);
  seek.disabled = !duration;
  seek.max = duration || 100;
  seek.value = video.currentTime;
  seek.setAttribute('aria-valuetext', `${clock(video.currentTime)} of ${clock(duration)}`);
  time.textContent = `${clock(video.currentTime)} / ${clock(duration)}`;
}

async function start() {
  if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
    showLoadError();
    return;
  }
  try {
    message();
    await video.play();
  } catch {
    message('Playback could not start. Please try Play again, or download the video below.');
  }
}

play.addEventListener('click', () => {
  if (video.paused) {
    if (video.ended) video.currentTime = 0;
    start();
  } else {
    video.pause();
  }
});
restart.addEventListener('click', () => {
  video.currentTime = 0;
  start();
});
seek.addEventListener('input', () => {
  video.currentTime = Number(seek.value);
  update();
});
mute.addEventListener('click', () => {
  if (video.muted || video.volume === 0) {
    video.muted = false;
    if (video.volume === 0) video.volume = 1;
  } else {
    video.muted = true;
  }
});
volume.addEventListener('input', () => {
  video.volume = Number(volume.value);
  video.muted = video.volume === 0;
});
video.addEventListener('volumechange', () => {
  const silent = video.muted || video.volume === 0;
  mute.textContent = silent ? 'Sound off' : 'Sound on';
  mute.setAttribute('aria-label', silent ? 'Unmute audio' : 'Mute audio');
  mute.setAttribute('aria-pressed', String(silent));
  volume.value = video.muted ? 0 : video.volume;
});
fullscreen.hidden = !document.fullscreenEnabled;
fullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await player.requestFullscreen();
  } catch {
    message('Full screen is unavailable in this browser.');
  }
});
document.addEventListener('fullscreenchange', () => {
  const label = document.fullscreenElement ? 'Exit full screen' : 'Full screen';
  fullscreen.querySelector('span').textContent = label;
  fullscreen.setAttribute('aria-label', label);
});
for (const event of ['loadedmetadata', 'durationchange', 'timeupdate', 'play', 'pause', 'ended']) {
  video.addEventListener(event, update);
}
video.addEventListener('error', showLoadError);
video.querySelector('source').addEventListener('error', showLoadError);
if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) showLoadError();
