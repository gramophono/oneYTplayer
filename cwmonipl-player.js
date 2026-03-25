(function() {
    // 1. CSS Injection
    const css = `
    .oneYT-wrapper * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .oneYT-wrapper { background: linear-gradient(135deg, #B71C1C, #D32F2F); min-height: 100vh; display: flex; flex-direction: column; padding: 20px; }
    .player-container { background: white; border-radius: 15px; box-shadow: 0 20px 60px rgba(183, 28, 28, 0.3); width: 100%; max-width: 1200px; height: 90vh; margin: 0 auto; display: flex; flex-direction: column; overflow: hidden; }
    .player-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: linear-gradient(135deg, #C62828, #E53935); color: white; border-bottom: 2px solid rgba(255, 255, 255, 0.1); }
    .player-header h1 { margin: 0; font-size: 22px; font-weight: bold; }
    .player-body { flex: 1; display: flex; flex-direction: row; overflow: hidden; min-height: 0; }
    .player-video { flex: 2; background: #000; display: flex; flex-direction: column; min-height: 0; }
    .player-screen { flex: 1; display: flex; align-items: center; justify-content: center; background: #111; min-height: 0; overflow: hidden; }
    .player-controls { background: linear-gradient(to right, #8B0000, #B22222); color: white; padding: 10px 15px; display: flex; justify-content: center; gap: 15px; border-top: 2px solid #DC143C; flex-shrink: 0; }
    .player-controls button { background: #C62828; color: white; border: none; padding: 10px 18px; font-size: 14px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.3s; display: flex; align-items: center; gap: 8px; min-width: 120px; justify-content: center; }
    .player-controls button:hover { background: #E53935; transform: translateY(-2px); }
    .player-playlist { flex: 1; padding: 15px; overflow-y: auto; overflow-x: hidden; background: #FFF5F5; border-left: 2px solid #FFCDD2; min-height: 0; display: flex; flex-direction: column; }
    .player-playlist h2 { margin: 0 0 12px 0; color: #B71C1C; font-size: 16px; padding-bottom: 8px; border-bottom: 2px solid #FFCDD2; flex-shrink: 0; }
    .player-songs { list-style: none; padding: 0; margin: 0; flex: 1; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; }
    .player-song { display: flex; align-items: center; gap: 10px; padding: 8px; margin-bottom: 5px; border-radius: 6px; cursor: pointer; transition: all 0.3s; border-bottom: 1px solid #FFEBEE; font-size: 13px; color: #8B0000; }
    .player-song-thumb { width: 55px; height: 40px; object-fit: cover; border-radius: 4px; flex-shrink: 0; border: 1px solid #FFCDD2; }
    .player-song-title { flex: 1; line-height: 1.3; }
    .player-song:hover { background: #FFEBEE; transform: translateX(3px); }
    .player-song.active { background: #FFEBEE; border-left: 4px solid #C62828; font-weight: bold; padding-top: 9px; padding-bottom: 9px; }
    .player-status { background: #FFF5F5; padding: 6px 15px; font-size: 12px; color: #B71C1C; border-top: 1px solid #FFCDD2; display: flex; justify-content: space-between; }
    @media (max-width: 768px) { .oneYT-wrapper { padding: 10px; } .player-container { height: 95vh; } .player-body { flex-direction: column; } .player-video { flex: 1; min-height: 250px; } .player-screen { min-height: 250px; } .player-playlist { flex: 1; border-left: none; border-top: 2px solid #FFCDD2; max-height: none; min-height: 200px; } .player-controls button { padding: 8px 12px; font-size: 13px; min-width: 110px; } .player-header h1 { font-size: 18px; } }
    @media (max-width: 480px) { .player-container { height: 100vh; border-radius: 10px; } .oneYT-wrapper { padding: 5px; } .player-video { min-height: 220px; } .player-screen { min-height: 220px; } .player-playlist { min-height: 180px; } .player-controls button { padding: 7px 10px; font-size: 12px; min-width: 100px; } .player-header h1 { font-size: 16px; } }
    #player { width: 100%; height: 100%; border: none; }
    `;

    // 2. HTML Injection
    const html = `
    <div class="oneYT-wrapper">
      <div class="player-container">
        <div class="player-header">
          <h1 id="playlist-title">🎵 YouTube Playlist Player</h1>
        </div>
        <div class="player-body">
          <div class="player-video">
            <div class="player-screen"><div id="player"></div></div>
            <div class="player-controls">
              <button id="btn-prev"><span>⏮</span> Προηγούμενο</button>
              <button id="btn-next"><span>⏭</span> Επόμενο</button>
            </div>
          </div>
          <div class="player-playlist">
            <h2>🎵 Τραγούδια</h2>
            <ul class="player-songs" id="songs-list"></ul>
          </div>
        </div>
        <div class="player-status">
          <div id="current-song">Δεν έχει επιλεγεί τραγούδι</div>
          <div id="playlist-count">0 τραγούδια</div>
        </div>
      </div>
    </div>
    `;

    // Inject CSS & HTML
    const styleTag = document.createElement('style');
    styleTag.textContent = css;
    document.head.appendChild(styleTag);

    const container = document.getElementById('oneYTplayer-dynamic-container');
    if (container) container.innerHTML = html;

    // 3. Logic
    let youtubePlayer;
    let currentPlaylist = [];
    let currentVideoIndex = 0;
    let isLastVideoEnded = false;

    function loadPlaylist() {
      // Διάβασε τις ρυθμίσεις τη στιγμή που τις χρειάζεσαι
      const SCRIPT_URL = window.oneYT_scriptUrl || 'https://icy-violet-4cf8.myrovolistisgr.workers.dev';
      const PLAYLIST_ID = window.oneYT_playlistId || 'PL00rmG2oN8AiQlKD5bOj9sTUF_yp7uaIJ';
      const CUSTOM_TITLE = window.oneYT_playlistTitle || '';

      // Καθαρισμός SCRIPT_URL
      let baseUrl = SCRIPT_URL.endsWith('/') ? SCRIPT_URL.slice(0, -1) : SCRIPT_URL;
      let url = `${baseUrl}?action=getPlaylist&playlistId=${PLAYLIST_ID}`;
      
      if (CUSTOM_TITLE) {
        url += `&playlistTitle=${encodeURIComponent(CUSTOM_TITLE)}`;
        document.getElementById('playlist-title').textContent = `🎵 ${CUSTOM_TITLE}`;
      } else {
        document.getElementById('playlist-title').textContent = '🎵 Φόρτωση λίστας...';
      }

      console.log("Fetching from Worker:", url);

      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data && data.songs && data.songs.length > 0) {
            if (data.playlistTitle) document.getElementById('playlist-title').textContent = `🎵 ${data.playlistTitle}`;
            currentPlaylist = data.songs.map(item => ({
              title: item.title,
              videoId: item.videoId,
              thumbnail: item.thumbnail || `https://img.youtube.com/vi/${item.videoId}/default.jpg`
            }));
            renderSongsList();
            if (youtubePlayer && typeof youtubePlayer.cueVideoById === 'function') {
              youtubePlayer.cueVideoById(currentPlaylist[0].videoId);
              updateStatusBar();
            }
          }
        })
        .catch(err => console.error("Player Error:", err));
    }

    function renderSongsList() {
      const list = document.getElementById('songs-list');
      if (!list) return;
      list.innerHTML = '';
      currentPlaylist.forEach((song, index) => {
        const listItem = document.createElement('li');
        listItem.className = `player-song ${index === currentVideoIndex ? 'active' : ''}`;
        listItem.onclick = () => playVideo(song.videoId, index);
        listItem.innerHTML = `<img class="player-song-thumb" src="${song.thumbnail}"><div class="player-song-title">${index + 1}. ${song.title}</div>`;
        list.appendChild(listItem);
      });
      document.getElementById('playlist-count').textContent = `${currentPlaylist.length} τραγούδια`;
    }

    function playVideo(videoId, index) {
      currentVideoIndex = index;
      if (youtubePlayer && typeof youtubePlayer.loadVideoById === 'function') {
        youtubePlayer.loadVideoById(videoId);
        youtubePlayer.playVideo();
      }
      document.querySelectorAll('.player-song').forEach((item, i) => item.classList.toggle('active', i === index));
      updateStatusBar();
    }

    function updateStatusBar() {
      if (currentPlaylist.length > 0) {
        document.getElementById('current-song').textContent = `Τρέχον: ${currentVideoIndex + 1}. ${currentPlaylist[currentVideoIndex].title}`;
      }
    }

    window.onYouTubeIframeAPIReady = function() {
      youtubePlayer = new YT.Player('player', {
        height: '100%', width: '100%', videoId: '',
        events: { 
          onReady: () => setTimeout(loadPlaylist, 100), // Μικρή καθυστέρηση για σιγουριά
          onStateChange: (e) => { if (e.data === YT.PlayerState.ENDED) playNextVideo(); }
        }
      });
    };

    function playNextVideo() {
      let next = (currentVideoIndex + 1) % currentPlaylist.length;
      playVideo(currentPlaylist[next].videoId, next);
    }

    // Load YouTube API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);

    // Event Listeners
    document.getElementById('btn-prev').onclick = () => {
      let prev = (currentVideoIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
      playVideo(currentPlaylist[prev].videoId, prev);
    };
    document.getElementById('btn-next').onclick = playNextVideo;

})();
