// YouTube Playlist Player - cwmonipl Version (Cloudflare Worker)
let youtubePlayer;
let currentPlaylist = [];
let currentVideoIndex = 0;
let isLastVideoEnded = false;
let currentPlaylistId = '';

// Το URL του Cloudflare Worker σου (από το cwmonipl.html)
const SCRIPT_URL = 'https://hidden-hat-e6f9.gramophono-gr.workers.dev';

function initYouTubePlayer(playlistId) {
  if (!playlistId) {
    console.error('❌ Πρέπει να δώσεις playlist ID');
    return;
  }
  
  currentPlaylistId = playlistId;
  
  // Δημιουργία container αν δεν υπάρχει
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
            <div id="player" style="width:100%; height:100%; border:none;"></div>
          </div>
          <div class="player-controls" style="background:linear-gradient(to right, #8B0000, #B22222); color:white; padding:10px 15px; display:flex; justify-content:center; gap:15px; border-top:2px solid #DC143C; flex-shrink:0;">
            <button onclick="window.playPrevVideo && playPrevVideo()" style="background:#C62828; color:white; border:none; padding:10px 18px; font-size:14px; border-radius:6px; cursor:pointer; font-weight:bold;"><span>⏮</span> Προηγούμενο</button>
            <button onclick="window.playNextVideo && playNextVideo()" style="background:#C62828; color:white; border:none; padding:10px 18px; font-size:14px; border-radius:6px; cursor:pointer; font-weight:bold;"><span>⏭</span> Επόμενο</button>
          </div>
        </div>
        <div class="player-playlist" style="flex:1; padding:15px; overflow-y:auto; overflow-x:hidden; background:#FFF5F5; border-left:2px solid #FFCDD2; min-height:0; display:flex; flex-direction:column;">
          <h2 style="margin:0 0 12px 0; color:#B71C1C; font-size:16px; padding-bottom:8px; border-bottom:2px solid #FFCDD2; flex-shrink:0;">🎵 Τραγούδια</h2>
          <ul id="songs-list" style="list-style:none; padding:0; margin:0; flex:1; overflow-y:auto; overflow-x:hidden; scroll-behavior:smooth;"></ul>
        </div>
      </div>
      <div class="player-status" style="background:#FFF5F5; padding:6px 15px; font-size:12px; color:#B71C1C; border-top:1px solid #FFCDD2; display:flex; justify-content:space-between;">
        <div id="current-song">Δεν έχει επιλεγεί τραγούδι</div>
        <div id="playlist-count">0 τραγούδια</div>
      </div>
    </div>
  `;
  
  // Προσθήκη CSS styles
  const styleId = 'cwmonipl-player-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .player-song {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px;
        margin-bottom: 5px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s;
        border-bottom: 1px solid #FFEBEE;
        font-size: 13px;
        color: #8B0000;
      }
      .player-song-thumb {
        width: 55px;
        height: 40px;
        object-fit: cover;
        border-radius: 4px;
        flex-shrink: 0;
        border: 1px solid #FFCDD2;
      }
      .player-song-title {
        flex: 1;
        line-height: 1.3;
      }
      .player-song:hover {
        background: #FFEBEE;
        transform: translateX(3px);
      }
      .player-song.active {
        background: #FFEBEE;
        border-left: 4px solid #C62828;
        font-weight: bold;
        padding-top: 9px;
        padding-bottom: 9px;
      }
      @media (max-width: 768px) {
        .player-body {
          flex-direction: column !important;
        }
        .player-video {
          min-height: 250px !important;
        }
        .player-screen {
          min-height: 250px !important;
        }
        .player-playlist {
          border-left: none !important;
          border-top: 2px solid #FFCDD2 !important;
        }
        .player-controls button {
          padding: 8px 12px !important;
          font-size: 13px !important;
          min-width: 110px !important;
        }
        .player-header h1 {
          font-size: 18px !important;
        }
      }
      @media (max-width: 480px) {
        .player-container {
          height: 100vh !important;
          border-radius: 10px !important;
        }
        .player-video {
          min-height: 220px !important;
        }
        .player-screen {
          min-height: 220px !important;
        }
        .player-playlist {
          min-height: 180px !important;
        }
        .player-controls button {
          padding: 7px 10px !important;
          font-size: 12px !important;
          min-width: 100px !important;
        }
        .player-header h1 {
          font-size: 16px !important;
        }
      }
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
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  
  window.onYouTubeIframeAPIReady = function() {
    createYouTubePlayer();
  };
}

function createYouTubePlayer() {
  const playerDiv = document.getElementById('player');
  if (!playerDiv) return;
  
  youtubePlayer = new YT.Player('player', {
    height: '100%',
    width: '100%',
    videoId: '',
    events: {
      onReady: function(event) {
        console.log('YouTube Player is ready');
        loadPlaylist();
      },
      onStateChange: function(event) {
        if (event.data === YT.PlayerState.ENDED) {
          if (currentVideoIndex === currentPlaylist.length - 1) {
            isLastVideoEnded = true;
            updateStatusBar();
          } else {
            isLastVideoEnded = false;
            playNextVideo();
          }
        }
        updateStatusBar();
      },
      onError: function(error) {
        console.error('YouTube Player error:', error);
        playNextVideo();
      }
    },
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      modestbranding: 1,
      fs: 1
    }
  });
}

function renderSongsList() {
  const list = document.getElementById('songs-list');
  if (!list) return;
  
  list.innerHTML = '';
  
  if (!currentPlaylist || currentPlaylist.length === 0) {
    list.innerHTML = '<li class="player-song">Η λίστα είναι άδεια</li>';
    return;
  }
  
  currentPlaylist.forEach((song, index) => {
    const listItem = document.createElement('li');
    listItem.className = `player-song ${index === currentVideoIndex ? 'active' : ''}`;
    listItem.onclick = () => playVideo(song.videoId, index);
    
    const thumbnail = document.createElement('img');
    thumbnail.className = 'player-song-thumb';
    thumbnail.src = song.thumbnail;
    thumbnail.alt = song.title;
    thumbnail.loading = 'lazy';
    thumbnail.onerror = function() {
      this.src = `https://img.youtube.com/vi/${song.videoId}/default.jpg`;
    };
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'player-song-title';
    titleDiv.textContent = `${index + 1}. ${song.title}`;
    
    listItem.appendChild(thumbnail);
    listItem.appendChild(titleDiv);
    list.appendChild(listItem);
  });
  
  document.getElementById('playlist-count').textContent = `${currentPlaylist.length} τραγούδια`;
}

function loadPlaylist() {
  const url = `${SCRIPT_URL}?action=getPlaylist&playlistId=${currentPlaylistId}`;
  
  document.getElementById('playlist-title').textContent = '🎵 Φόρτωση λίστας...';
  document.getElementById('songs-list').innerHTML = '<li class="player-song">Φόρτωση τραγουδιών...</li>';
  
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Δεδομένα που πήρα:', data);
      
      if (data && data.songs && data.songs.length > 0) {
        if (data.playlistTitle) {
          document.getElementById('playlist-title').textContent = `🎵 ${data.playlistTitle}`;
          document.title = `${data.playlistTitle} - YouTube Player`;
        }
        
        currentPlaylist = data.songs.map(item => ({
          title: item.title,
          videoId: item.videoId,
          thumbnail: `https://img.youtube.com/vi/${item.videoId}/default.jpg`
        }));
        
        renderSongsList();
        currentVideoIndex = 0;
        
        if (youtubePlayer && typeof youtubePlayer.cueVideoById === 'function') {
          youtubePlayer.cueVideoById(currentPlaylist[0].videoId);
          updateStatusBar();
        } else {
          setTimeout(() => {
            if (youtubePlayer && typeof youtubePlayer.cueVideoById === 'function') {
              youtubePlayer.cueVideoById(currentPlaylist[0].videoId);
              updateStatusBar();
            }
          }, 1000);
        }
      } else {
        document.getElementById('songs-list').innerHTML = '<li class="player-song">Δεν βρέθηκαν τραγούδια</li>';
        if (data.error) {
          console.error('Σφάλμα:', data.error);
        }
      }
    })
    .catch(error => {
      console.error('Σφάλμα φόρτωσης playlist:', error);
      document.getElementById('songs-list').innerHTML = '<li class="player-song">Σφάλμα σύνδεσης</li>';
      document.getElementById('playlist-title').textContent = '🎵 Σφάλμα φόρτωσης';
    });
}

function playVideo(videoId, index) {
  currentVideoIndex = index;
  isLastVideoEnded = false;
  
  if (youtubePlayer && typeof youtubePlayer.loadVideoById === 'function') {
    youtubePlayer.loadVideoById(videoId);
    youtubePlayer.playVideo();
  }
  
  document.querySelectorAll('.player-song').forEach(item => {
    item.classList.remove('active');
  });
  
  const currentItem = document.querySelectorAll('.player-song')[index];
  if (currentItem) {
    currentItem.classList.add('active');
    setTimeout(() => {
      currentItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }
  
  updateStatusBar();
}

function playNextVideo() {
  if (currentPlaylist.length === 0) return;
  
  let nextIndex = currentVideoIndex + 1;
  if (nextIndex >= currentPlaylist.length) {
    nextIndex = 0;
  }
  
  if (isLastVideoEnded && currentVideoIndex === currentPlaylist.length - 1) {
    nextIndex = 0;
  }
  
  setTimeout(() => {
    playVideo(currentPlaylist[nextIndex].videoId, nextIndex);
  }, 100);
}

function playPrevVideo() {
  if (currentPlaylist.length === 0) return;
  
  let prevIndex = currentVideoIndex - 1;
  if (prevIndex < 0) {
    prevIndex = currentPlaylist.length - 1;
  }
  
  isLastVideoEnded = false;
  
  setTimeout(() => {
    playVideo(currentPlaylist[prevIndex].videoId, prevIndex);
  }, 100);
}

function updateStatusBar() {
  if (currentPlaylist.length > 0 && currentVideoIndex >= 0) {
    const currentSong = currentPlaylist[currentVideoIndex];
    let statusText = `Τρέχον: ${currentVideoIndex + 1}. ${currentSong.title}`;
    if (isLastVideoEnded && currentVideoIndex === currentPlaylist.length - 1) {
      statusText += " (Τέλος λίστας)";
    }
    document.getElementById('current-song').innerHTML = statusText;
  }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
  if (event.key === 'ArrowRight' || event.key === ' ') {
    playNextVideo();
    event.preventDefault();
  } else if (event.key === 'ArrowLeft') {
    playPrevVideo();
    event.preventDefault();
  }
});

function warmupYouTube() {
  if (window.ytWarm) return;
  window.ytWarm = true;

  const urls = [
    'https://www.youtube.com',
    'https://www.google.com',
    'https://googleads.g.doubleclick.net',
    'https://static.doubleclick.net'
  ];

  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    document.head.appendChild(link);
  });
}

document.addEventListener('mousemove', warmupYouTube, { once: true });
document.addEventListener('touchstart', warmupYouTube, { once: true });

// Εξαγωγή συναρτήσεων για τα κουμπιά
window.playNextVideo = playNextVideo;
window.playPrevVideo = playPrevVideo;
window.initYouTubePlayer = initYouTubePlayer;