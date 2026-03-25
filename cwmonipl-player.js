// YouTube Playlist Player - cwmonipl Version (Cloudflare Worker)
let youtubePlayer;
let currentPlaylist = [];
let currentVideoIndex = 0;
let isLastVideoEnded = false;
let currentPlaylistId = '';

const SCRIPT_URL = 'https://hidden-hat-e6f9.gramophono-gr.workers.dev';

function initYouTubePlayer(playlistId) {
  if (!playlistId) {
    console.error('❌ Πρέπει να δώσεις playlist ID');
    return;
  }
  
  currentPlaylistId = playlistId;
  
  let container = document.getElementById('youtube-player');
  if (!container) {
    container = document.createElement('div');
    container.id = 'youtube-player';
    document.body.appendChild(container);
  }
  
  createPlayerHTML();
  loadYouTubeAPI();
}

function createPlayerHTML() {
  const container = document.getElementById('youtube-player');
  if (!container) return;
  
  container.innerHTML = `
    <div class="player-container" style="background:white; border-radius:15px; box-shadow:0 20px 60px rgba(183,28,28,0.3); width:100%; max-width:1200px; height:90vh; margin:0 auto; display:flex; flex-direction:column; overflow:hidden;">
      <div class="player-header" style="display:flex; justify-content:space-between; align-items:center; padding:15px 20px; background:linear-gradient(135deg, #C62828, #E53935); color:white; border-bottom:2px solid rgba(255,255,255,0.1);">
        <h1 id="playlist-title" style="margin:0; font-size:22px; font-weight:bold;">🎵 YouTube Playlist Player</h1>
      </div>
      <div class="player-body" style="flex:1; display:flex; flex-direction:row; overflow:hidden; min-height:0;">
        <div class="player-video" style="flex:2; background:#000; display:flex; flex-direction:column; min-height:0;">
          <div class="player-screen" style="flex:1; display:flex; align-items:center; justify-content:center; background:#111; min-height:0; overflow:hidden;">
            <div id="player" style="width:100%; height:100%;"></div>
          </div>
          <div class="player-controls" style="background:linear-gradient(to right, #8B0000, #B22222); color:white; padding:10px 15px; display:flex; justify-content:center; gap:15px; border-top:2px solid #DC143C; flex-shrink:0;">
            <button onclick="window.playPrevVideo && playPrevVideo()" style="background:#C62828; color:white; border:none; padding:10px 18px; font-size:14px; border-radius:6px; cursor:pointer; font-weight:bold;"><span>⏮</span> Προηγούμενο</button>
            <button onclick="window.playNextVideo && playNextVideo()" style="background:#C62828; color:white; border:none; padding:10px 18px; font-size:14px; border-radius:6px; cursor:pointer; font-weight:bold;"><span>⏭</span> Επόμενο</button>
          </div>
        </div>
        <div class="player-playlist" style="flex:1; padding:15px; overflow-y:auto; overflow-x:hidden; background:#FFF5F5; border-left:2px solid #FFCDD2; min-height:0; display:flex; flex-direction:column;">
          <h2 style="margin:0 0 12px 0; color:#B71C1C; font-size:16px; padding-bottom:8px; border-bottom:2px solid #FFCDD2;">🎵 Τραγούδια</h2>
          <ul id="songs-list" style="list-style:none; padding:0; margin:0; flex:1; overflow-y:auto; scroll-behavior:smooth;"></ul>
        </div>
      </div>
      <div class="player-status" style="background:#FFF5F5; padding:6px 15px; font-size:12px; color:#B71C1C; border-top:1px solid #FFCDD2; display:flex; justify-content:space-between;">
        <div id="current-song">Δεν έχει επιλεγεί τραγούδι</div>
        <div id="playlist-count">0 τραγούδια</div>
      </div>
    </div>
  `;
  
  const styleId = 'cwmonipl-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .player-song { display: flex; align-items: center; gap: 10px; padding: 8px; margin-bottom: 5px; border-radius: 6px; cursor: pointer; border-bottom: 1px solid #FFEBEE; font-size: 13px; color: #8B0000; }
      .player-song-thumb { width: 55px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #FFCDD2; }
      .player-song-title { flex: 1; }
      .player-song:hover { background: #FFEBEE; transform: translateX(3px); }
      .player-song.active { background: #FFEBEE; border-left: 4px solid #C62828; font-weight: bold; }
      @media (max-width: 768px) { .player-body { flex-direction: column !important; } .player-video { min-height: 250px !important; } .player-playlist { border-left: none !important; border-top: 2px solid #FFCDD2 !important; } }
    `;
    document.head.appendChild(style);
  }
}

function loadYouTubeAPI() {
  if (window.YT && window.YT.Player) {
    createYouTubePlayer();
    return;
  }
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
  window.onYouTubeIframeAPIReady = createYouTubePlayer;
}

function createYouTubePlayer() {
  youtubePlayer = new YT.Player('player', {
    height: '100%', width: '100%', videoId: '',
    events: {
      onReady: () => loadPlaylist(),
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.ENDED) {
          if (currentVideoIndex === currentPlaylist.length - 1) {
            isLastVideoEnded = true;
          } else {
            isLastVideoEnded = false;
            playNextVideo();
          }
          updateStatusBar();
        }
        updateStatusBar();
      },
      onError: () => playNextVideo()
    },
    playerVars: { autoplay: 0, controls: 1, rel: 0, modestbranding: 1, fs: 1 }
  });
}

function renderSongsList() {
  const list = document.getElementById('songs-list');
  if (!list) return;
  list.innerHTML = '';
  if (!currentPlaylist.length) {
    list.innerHTML = '<li class="player-song">Η λίστα είναι άδεια</li>';
    return;
  }
  currentPlaylist.forEach((song, index) => {
    const li = document.createElement('li');
    li.className = `player-song ${index === currentVideoIndex ? 'active' : ''}`;
    li.onclick = () => playVideo(song.videoId, index);
    li.innerHTML = `
      <img class="player-song-thumb" src="${song.thumbnail}" onerror="this.src='https://img.youtube.com/vi/${song.videoId}/default.jpg'">
      <div class="player-song-title">${index+1}. ${song.title}</div>
    `;
    list.appendChild(li);
  });
  document.getElementById('playlist-count').textContent = `${currentPlaylist.length} τραγούδια`;
  
  // ✅ Αυτόματη κύλιση στο ενεργό τραγούδι
  const activeItem = list.querySelector('.player-song.active');
  if (activeItem) {
    activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function loadPlaylist() {
  const url = `${SCRIPT_URL}?action=getPlaylist&playlistId=${currentPlaylistId}`;
  document.getElementById('playlist-title').textContent = '🎵 Φόρτωση λίστας...';
  document.getElementById('songs-list').innerHTML = '<li class="player-song">Φόρτωση...</li>';
  
  fetch(url)
    .then(r => r.json())
    .then(data => {
      if (data && data.songs && data.songs.length) {
        if (data.playlistTitle) {
          document.getElementById('playlist-title').textContent = `🎵 ${data.playlistTitle}`;
        }
        currentPlaylist = data.songs.map(item => ({
          title: item.title,
          videoId: item.videoId,
          thumbnail: `https://img.youtube.com/vi/${item.videoId}/default.jpg`
        }));
        renderSongsList();
        currentVideoIndex = 0;
        if (youtubePlayer) {
          youtubePlayer.cueVideoById(currentPlaylist[0].videoId);
          updateStatusBar();
        }
      } else {
        document.getElementById('songs-list').innerHTML = '<li class="player-song">Δεν βρέθηκαν τραγούδια</li>';
      }
    })
    .catch(err => {
      console.error('Σφάλμα:', err);
      document.getElementById('songs-list').innerHTML = '<li class="player-song">Σφάλμα σύνδεσης</li>';
    });
}

function playVideo(videoId, index) {
  currentVideoIndex = index;
  isLastVideoEnded = false;
  if (youtubePlayer) {
    youtubePlayer.loadVideoById(videoId);
    youtubePlayer.playVideo();
  }
  
  // Ενημέρωση active class
  document.querySelectorAll('.player-song').forEach((item, i) => {
    if (i === index) item.classList.add('active');
    else item.classList.remove('active');
  });
  
  // ✅ Αυτόματη κύλιση στο ενεργό τραγούδι
  const activeItem = document.querySelector('.player-song.active');
  if (activeItem) {
    setTimeout(() => {
      activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }
  
  updateStatusBar();
}

function playNextVideo() {
  if (!currentPlaylist.length) return;
  let nextIndex = currentVideoIndex + 1;
  if (nextIndex >= currentPlaylist.length) nextIndex = 0;
  playVideo(currentPlaylist[nextIndex].videoId, nextIndex);
}

function playPrevVideo() {
  if (!currentPlaylist.length) return;
  let prevIndex = currentVideoIndex - 1;
  if (prevIndex < 0) prevIndex = currentPlaylist.length - 1;
  playVideo(currentPlaylist[prevIndex].videoId, prevIndex);
}

function updateStatusBar() {
  if (currentPlaylist.length && currentVideoIndex >= 0) {
    const song = currentPlaylist[currentVideoIndex];
    let text = `Τρέχον: ${currentVideoIndex+1}. ${song.title}`;
    if (isLastVideoEnded && currentVideoIndex === currentPlaylist.length-1) text += " (Τέλος λίστας)";
    document.getElementById('current-song').innerHTML = text;
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') { playNextVideo(); e.preventDefault(); }
  else if (e.key === 'ArrowLeft') { playPrevVideo(); e.preventDefault(); }
});

window.playNextVideo = playNextVideo;
window.playPrevVideo = playPrevVideo;
window.initYouTubePlayer = initYouTubePlayer;
