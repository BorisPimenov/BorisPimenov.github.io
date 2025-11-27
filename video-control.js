// video-control.js
document.addEventListener('DOMContentLoaded', function() {
  console.log('Video control script loaded');
  
  const videoOverlay = document.getElementById('videoOverlay');
  const playButton = document.getElementById('playButton');
  const backgroundVideo = document.getElementById('backgroundVideo');
  
  if (!videoOverlay || !playButton || !backgroundVideo) {
    console.error('Elementi video non trovati');
    return;
  }
  
  console.log('Tutti gli elementi video trovati');
  
  function startVideo() {
    console.log('Avvio video...');
    
    // Nascondi l'overlay
    videoOverlay.classList.add('hidden');
    
    // Ricarica l'iframe con autoplay
    setTimeout(() => {
      const currentSrc = backgroundVideo.src;
      // Rimuovi il parametro mute e aggiungi autoplay
      const newSrc = currentSrc.replace('&mute=1', '') + '&autoplay=1';
      console.log('Nuovo src:', newSrc);
      backgroundVideo.src = newSrc;
    }, 300);
  }
  
  // Evento per il pulsante play
  playButton.addEventListener('click', startVideo);
  
  // Evento per click diretto sul video
  backgroundVideo.addEventListener('click', function() {
    if (!videoOverlay.classList.contains('hidden')) {
      startVideo();
    }
  });
  
  // Rimuovi completamente l'overlay dopo l'animazione
  videoOverlay.addEventListener('transitionend', function() {
    if (videoOverlay.classList.contains('hidden')) {
      videoOverlay.style.display = 'none';
    }
  });
});
