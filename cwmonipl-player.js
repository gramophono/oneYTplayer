(function() {
    console.log("[oneYT] Script v2.9 loading (Aggressive Full Page Mode)...");

    // 1. Get parameters from the script URL itself
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];
    const scriptUrl = new URL(currentScript.src);
    
    const PLAYLIST_ID = scriptUrl.searchParams.get('id') || window.oneYT_playlistId || 'PL00rmG2oN8AiQlKD5bOj9sTUF_yp7uaIJ';
    const CUSTOM_TITLE = scriptUrl.searchParams.get('title') || window.oneYT_playlistTitle || '';
    const FULL_PAGE = scriptUrl.searchParams.get('fullpage') === 'true';
    const SCRIPT_URL = window.oneYT_scriptUrl || 'https://icy-violet-4cf8.myrovolistisgr.workers.dev';

    console.log("[oneYT] Config:", { PLAYLIST_ID, CUSTOM_TITLE, FULL_PAGE });

    // 2. Aggressive Full Page Mode Logic
    if (FULL_PAGE) {
        // Create a dedicated container for the player if it doesn't exist
        let playerContainer = document.getElementById('oneYTplayer-dynamic-container');
        if (!playerContainer) {
            playerContainer = document.createElement('div');
            playerContainer.id = 'oneYTplayer-dynamic-container';
            document.body.appendChild(playerContainer);
        }

        // Move the container to be a direct child of body to avoid parent hiding
        document.body.appendChild(playerContainer);

        const fullPageStyle = document.createElement('style');
        fullPageStyle.textContent = `
            /* Hide ALL direct children of body except our container and scripts */
            body > *:not(#oneYTplayer-dynamic-container):not(script):not(style) {
                display: none !important;
            }
            /* Reset body and html */
            body, html { 
                margin: 0 !important; 
                padding: 0 !important; 
                overflow: hidden !important; 
                height: 100% !important; 
                width: 100% !important; 
                background: #000 !important;
            }
            #oneYTplayer-dynamic-container { 
                position: fixed !important; 
                top: 0 !important; 
                left: 0 !important; 
                width: 100vw !important; 
                height: 100vh !important; 
                z-index: 2147483647 !important; 
                display: block !important;
                visibility: visible !important;
            }
        `;
        document.head.appendChild(fullPageStyle);
    }

    // 3. CSS Injection - Player Styles
    const css = `
    .oneYT-wrapper * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .oneYT-wrapper { background: linear-gradient(135deg, #B71C1C, #D32F2F); width: 100%; height: 100%; display: flex; flex-direction: column; padding: ${FULL_PAGE ? '0' : '15px'}; border-radius: ${FULL_PAGE ? '0' : '10px'}; overflow: hidden; }
    .player-container { background: white; border-radius: ${FULL_PAGE ? '0' : '12px'}; box-shadow: 0 10px 30px rgba(183, 28, 28, 0.2); width: 100%; height: 100%; margin: 0 auto; display: flex; flex-direction: column; overflow: hidden; position: relative; }
    .player-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: linear-gradient(135deg, #C62828, #E53935); color: white; border-bottom: 1px solid rgba(255, 255, 255, 0.1); flex-shrink: 0; }
    .player-header h1 { margin: 0 !important; font-size: 18px !important; font-weight: bold !important; color: white !important; line-height: 1.2 !important; }
    .player-body { flex: 1; display: flex; flex-direction: row; overflow: hidden; min-height: 0; background: #fff; }
    .player-video { flex: 1.8; background: #000; display: flex; flex-direction: column; min-height: 0; }
    .player-screen { flex: 1; display: flex; align-items: center; justify-content: center; background: #000; min-height: 0; overflow: hidden; position: relative; }
    .player-controls { background: #8B0000; color: white; padding: 8px 10px; display: flex; justify-content: center; gap: 10px; border-top: 1px solid #DC143C; flex-shrink: 0; }
    .player-controls button { background: #C62828; color: white; border: none; padding: 8px 12px; font-size: 13px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: all 0.2s; display: flex; align-items: center; gap: 5px; min-width: 100px; justify-content: center; }
    .player-controls button:hover { background: #E53935; }
    .player-playlist { flex: 1; padding: 10px; overflow-y: auto; overflow-x: hidden; background: #FFF5F5; border-left: 1px solid #FFCDD2; min-height: 0; display: flex; flex-direction: column; }
    .player-playlist h2 { margin: 0 0 10px 0 !important; color: #B71C1C !important; font-size: 14px !important; padding-bottom: 5px !important; border-bottom: 1px solid #FFCDD2 !important; flex-shrink: 0; font-weight: bold !important; }
    .player-songs { list-style: none !important; padding: 0 !important; margin: 0 !important; flex: 1; overflow-y: auto; overflow-x: hidden; }
    .player-song { display: flex; align-items: center; gap: 8px; padding: 6px; margin-bottom: 4px; border-radius: 4px; cursor: pointer; transition: all 0.2s; border-bottom: 1px solid #FFEBEE; font-size: 12px; color: #8B0000; line-height: 1.2; }
    .player-song-thumb { width: 50px; height: 35px; object-fit: cover; border-radius: 3px; flex-shrink: 0; }
    .player-song-title { flex: 1; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
    .player-song:hover { background: #FFEBEE; }
    .player-song.active { background: #FFEBEE; border-left: 3px solid #C62828; font-weight: bold; }
    .player-status { background: #FFF5F5; padding: 5px 12px; font-size: 11px; color: #B71C1C; border-top: 1px solid #FFCDD2; display: flex; justify-content: space-between; flex-shrink: 0; }
    @media (max-width: 768px) { .player-body { flex-direction: column; } .player-video { height: 250px; flex: none; } .player-playlist { height: 250px; border-left: none; border-top: 1px solid #FFCDD2; } }
    #player { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }
    `;

    // 4. HTML Injection
    const html = `
    <div class="oneYT-wrapper">
      <div class="player-container">
        <div class="player-header">
          <h1 id="playlist-title">🎵 ${CUSTOM_TITLE || 'YouTube Playlist Player'}</h1>
        </div>
        <div class="player-body">
          <div class="player-video">
            <div class="player-screen"><div id="player"></div></div>
            <div class="player-controls">
              <button id="btn-prev">⏮ Πίσω</button>
              <button id="btn-next">⏭ Επόμενο</button>
            </div>
          </div>
          <div class="player-playlist">
            <h2>🎵 Λίστα Τραγουδιών</h2>
            <ul class="player-songs" id="songs-list"></ul>
          </div>
        </div>
        <div class="player-status">
          <div id="current-song">Επιλέξτε τραγούδι</div>
          <div id="playlist-count">0 τραγούδια</div>
        </div>
      </div>
    </div>
    `;

    // Inject CSS
    const styleTag = document.createElement('style');
    styleTag.textContent = css;
    document.head.appendChild(styleTag);

    // Ensure container has the HTML
    const container = document.getElementById('oneYTplayer-dynamic-container');
    if (container) container.innerHTML = html;

    // 5. Logic
    let youtubePlayer;
    let currentPlaylist = [];
    let currentVideoIndex = 0;

    function loadPlaylist() {
      let baseUrl = SCRIPT_URL.endsWith('/') ? SCRIPT_URL.slice(0, -1) : SCRIPT_URL;
      let url = new URL(baseUrl);
      url.searchParams.set('action', 'getPlaylist');
      url.searchParams.set('playlistId', PLAYLIST_ID);
      if (CUSTOM_TITLE) url.searchParams.set('playlistTitle', CUSTOM_TITLE);

      fetch(url.toString())
        .then(response => response.json())
        .then(data => {
          if (data && data.songs && data.songs.length > 0) {
            const finalTitle = CUSTOM_TITLE || data.playlistTitle || 'YouTube Playlist';
            document.getElementById('playlist-title').textContent = `🎵 ${finalTitle}`;
            
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
        .catch(err => console.error("[oneYT] Error:", err));
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

    function startPlayer() {
      youtubePlayer = new YT.Player('player', {
        height: '100%', width: '100%', videoId: '',
        playerVars: { 'autoplay': 0, 'controls': 1, 'rel': 0, 'modestbranding': 1 },
        events: { 
          onReady: () => loadPlaylist(),
          onStateChange: (e) => { if (e.data === YT.PlayerState.ENDED) playNextVideo(); }
        }
      });
    }

    if (window.YT && window.YT.Player) {
        startPlayer();
    } else {
        window.onYouTubeIframeAPIReady = startPlayer;
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    }

    function playNextVideo() {
      let next = (currentVideoIndex + 1) % currentPlaylist.length;
      playVideo(currentPlaylist[next].videoId, next);
    }

    document.getElementById('btn-prev').onclick = () => {
      let prev = (currentVideoIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
      playVideo(currentPlaylist[prev].videoId, prev);
    };
    document.getElementById('btn-next').onclick = playNextVideo;

})();
