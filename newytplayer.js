// youtube-player.js - Αυτόνομος YouTube Playlist Player
(function() {
  'use strict';
  
  // Συνάρτηση για φόρτωση της YouTube API
  function loadYouTubeAPI() {
    return new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }
      
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = function() {
        resolve();
      };
      
      // Timeout για ασφάλεια
      setTimeout(() => reject(new Error('YouTube API load timeout')), 10000);
    });
  }
  
  // Κύρια συνάρτηση αρχικοποίησης
  window.initYouTubePlayer = async function(playlistId) {
    const playerDiv = document.getElementById('youtube-player');
    if (!playerDiv) {
      console.error('❌ Δεν βρέθηκε div με id="youtube-player"');
      return;
    }
    
    // Έλεγχος αν υπάρχει ήδη player
    if (playerDiv.player) {
      playerDiv.player.destroy();
    }
    
    try {
      await loadYouTubeAPI();
      
      // Δημιουργία player
      playerDiv.player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        playerVars: {
          listType: 'playlist',
          list: playlistId,
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          controls: 1,
          loop: 0,
          disablekb: 0,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: function(event) {
            console.log('✅ Player έτοιμος');
            event.target.playVideo();
          },
          onError: function(event) {
            console.error('❌ Σφάλμα player:', event.data);
            showErrorMessage(event.data);
          }
        }
      });
      
    } catch (error) {
      console.error('❌ Αποτυχία αρχικοποίησης:', error);
      showErrorMessage('Δεν ήταν δυνατή η φόρτωση του player');
    }
  };
  
  // Συνάρτηση εμφάνισης μηνύματος σφάλματος
  function showErrorMessage(message) {
    const playerDiv = document.getElementById('youtube-player');
    if (!playerDiv) return;
    
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      z-index: 1000;
    `;
    errorDiv.innerHTML = `
      <h3>❌ Σφάλμα</h3>
      <p>${message}</p>
      <button onclick="location.reload()" style="
        background: #e53935;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 10px;
      ">Δοκιμή ξανά</button>
    `;
    
    playerDiv.style.position = 'relative';
    playerDiv.appendChild(errorDiv);
  }
  
  // Αυτόματη ανίχνευση αν υπάρχει το data-playlist
  const playerDiv = document.getElementById('youtube-player');
  if (playerDiv && playerDiv.dataset.playlist) {
    const playlistId = playerDiv.dataset.playlist;
    console.log(`🎵 Αυτόματη εκκίνηση με playlist: ${playlistId}`);
    window.initYouTubePlayer(playlistId);
  }
})();