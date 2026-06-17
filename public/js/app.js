const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });
}

const scrollLinks = document.querySelectorAll('a[href^="#"]');
scrollLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (targetId.length > 1) {
      event.preventDefault();
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        navMenu.classList.remove('open');
      }
    }
  });
});

// Testimonial slider
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.testimonial-track');
  const slider = document.getElementById('testimonialSlider');
  const prevBtn = document.querySelector('.testimonial-btn.prev');
  const nextBtn = document.querySelector('.testimonial-btn.next');
  if (!track || !slider) return;

  const cards = Array.from(track.children);
  const cardWidth = slider.clientWidth; // show one per view

  // set track width
  track.style.display = 'flex';
  track.style.transition = 'transform 400ms ease';

  // keep index in the middle (start at first real slide)
  let index = 0;

  function moveTo(i) {
    const max = cards.length / 2; // duplicates
    if (i < 0) i = max - 1;
    if (i >= max) i = 0;
    index = i;
    const w = slider.clientWidth;
    const offset = -i * w;
    track.style.transform = `translateX(${offset}px)`;
  }

  // resize handler
  window.addEventListener('resize', () => {
    const w = slider.clientWidth;
    track.style.transform = `translateX(${-index * w}px)`;
  });

  prevBtn && prevBtn.addEventListener('click', () => moveTo(index - 1));
  nextBtn && nextBtn.addEventListener('click', () => moveTo(index + 1));

  // auto-play
  let autoplay = setInterval(() => moveTo(index + 1), 4000);
  slider.addEventListener('mouseenter', () => clearInterval(autoplay));
  slider.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => moveTo(index + 1), 4000);
  });
  // start at first slide
  moveTo(0);
});

  // Video section: interactive/classic mode and thumbnail loading
  document.addEventListener('DOMContentLoaded', () => {
    // Banner play handler: clicking the banner loads and plays the featured video
    try {
      const banner = document.getElementById('videoBanner');
      if (banner) {
        banner.addEventListener('click', () => {
          try {
            const main = document.getElementById('mainVideo');
            if (main && main.tagName === 'VIDEO') {
              const src = '/vid/vid3.mp4';
              const sourceEl = main.querySelector('source');
              if (sourceEl) {
                sourceEl.src = src;
                main.load();
                main.muted = false;
                main.play().catch(err => console.warn('Banner play failed:', err));
                main.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          } catch (e) { console.error('Banner click error', e); }
        });
        banner.addEventListener('keypress', (e) => { if (e.key === 'Enter') banner.click(); });
      }
    } catch (e) { console.warn('Banner handler setup failed', e); }
    const modeButtons = document.querySelectorAll('.mode-btn');
    const videoList = document.getElementById('videoList');
    const mainVideo = document.getElementById('mainVideo');
    const videoTitle = document.getElementById('videoTitle');
    const videoInfo = document.getElementById('videoInfo');
    const thumbs = document.querySelectorAll('.video-list .thumb');

    if (!mainVideo || !videoList || !modeButtons.length) return;

    // Add diagnostics on the video element to surface errors in DevTools
    try {
      mainVideo.addEventListener('loadedmetadata', () => {
        console.log('Video loadedmetadata, duration:', mainVideo.duration);
      });
      mainVideo.addEventListener('canplay', () => { console.log('Video canplay'); });
      mainVideo.addEventListener('play', () => { console.log('Video play event'); });
      mainVideo.addEventListener('pause', () => { console.log('Video pause event'); });
      mainVideo.addEventListener('error', async () => {
        console.error('Video element error', mainVideo.error);
        const src = (mainVideo.querySelector && mainVideo.querySelector('source')) ? (mainVideo.querySelector('source').src) : mainVideo.currentSrc || mainVideo.src;
        console.log('Attempting to fetch video source for diagnostics:', src);
        try {
          const res = await fetch(src, { method: 'HEAD' });
          console.log('HEAD response:', res.status, res.headers.get('content-type'));
        } catch (fetchErr) {
          console.error('Fetch HEAD failed for video source:', fetchErr);
        }
      });
    } catch (e) {
      console.warn('Error attaching video diagnostics', e);
    }

    function setMode(mode) {
      modeButtons.forEach(btn => {
        const active = btn.dataset.mode === mode;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active);
      });
      if (mode === 'classic') {
        videoList.style.display = 'none';
        document.querySelector('.video-player').style.width = '100%';
      } else {
        videoList.style.display = '';
        document.querySelector('.video-player').style.width = '';
      }
    }

    modeButtons.forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));

    thumbs.forEach(t => {
      t.addEventListener('click', () => {
        const src = t.dataset.src;
        const title = t.dataset.title;
        const info = t.dataset.info;
        if (mainVideo.tagName === 'IFRAME') {
          if (src) mainVideo.src = src;
        } else if (mainVideo.tagName === 'VIDEO') {
          const sourceEl = mainVideo.querySelector('source');
          if (sourceEl && src) {
            sourceEl.src = src;
            mainVideo.load();
            // ensure audio is enabled after an explicit user interaction
            try { mainVideo.muted = false; mainVideo.volume = 1.0; } catch(e) {}
            mainVideo.play().catch((err) => { console.warn('Video play failed:', err); });
          } else if (src) {
            mainVideo.src = src;
            try { mainVideo.muted = false; mainVideo.volume = 1.0; } catch(e) {}
            mainVideo.play().catch((err) => { console.warn('Video play failed:', err); });
          }
        }
        if (title) videoTitle.textContent = title;
        if (info) videoInfo.textContent = info;
        thumbs.forEach(x => x.classList.remove('active-thumb'));
        t.classList.add('active-thumb');
      });
      t.addEventListener('keypress', (e) => { if (e.key === 'Enter') t.click(); });
    });

    // load first thumb as default (if present)
    if (thumbs.length) thumbs[0].click();
    setMode('interactive');

    // also ensure manual play button un-mutes (in case user presses the native play control)
    try {
      mainVideo.addEventListener('play', () => {
        try { mainVideo.muted = false; mainVideo.volume = Math.max(0.2, mainVideo.volume || 1.0); } catch(e) {}
      });
    } catch (e) {}

    // Volume slider and mute button behavior
    try {
      const muteBtn = document.getElementById('muteBtn');
      const volumeSlider = document.getElementById('volumeSlider');

      function updateMuteUI() {
        if (!muteBtn) return;
        if (mainVideo.muted || mainVideo.volume === 0) {
          muteBtn.setAttribute('aria-pressed', 'true');
          muteBtn.textContent = '🔇';
        } else {
          muteBtn.setAttribute('aria-pressed', 'false');
          muteBtn.textContent = '🔊';
        }
      }

      if (muteBtn) {
        muteBtn.addEventListener('click', () => {
          try {
            mainVideo.muted = !mainVideo.muted;
            if (!mainVideo.muted && mainVideo.volume === 0) mainVideo.volume = 0.5;
          } catch (e) {}
          updateMuteUI();
        });
      }

      if (volumeSlider) {
        // initialize slider value
        try { volumeSlider.value = (typeof mainVideo.volume === 'number') ? mainVideo.volume : 1.0; } catch(e) {}
        volumeSlider.addEventListener('input', () => {
          const v = parseFloat(volumeSlider.value);
          try {
            mainVideo.volume = v;
            mainVideo.muted = v === 0;
          } catch (e) {}
          updateMuteUI();
        });
      }

      // update UI when metadata loads
      try { mainVideo.addEventListener('loadedmetadata', updateMuteUI); } catch(e) {}
    } catch (e) {
      console.warn('Volume controls unavailable', e);
    }
  });
