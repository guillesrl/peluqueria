/**
 * Stylo - Interactivity, Scroll Reveal & Video Optimization
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Scroll-Driven & Ambient Canvas Frame Animation (Scrollytelling Hero)
  const canvas = document.getElementById('hero-canvas');
  const scrollContainer = document.querySelector('.hero-scroll-container');
  const posterFallback = document.querySelector('.media-poster-fallback');

  if (canvas && scrollContainer) {
    const ctx = canvas.getContext('2d');
    const TOTAL_FRAMES = 120;
    const images = [];
    let currentFrameIndex = 0;
    let isTicking = false;
    let ambientFrame = 0;
    let lastAmbientTime = 0;

    // Set canvas internal resolution based on device pixel ratio
    function resizeCanvas() {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      renderFrame(currentFrameIndex);
    }

    // Get closest loaded frame if target frame is still downloading
    function getBestLoadedImage(targetIndex) {
      if (images[targetIndex] && images[targetIndex].isLoaded) {
        return images[targetIndex];
      }
      // Search backwards first
      for (let k = targetIndex - 1; k >= 0; k--) {
        if (images[k] && images[k].isLoaded) return images[k];
      }
      // Search forwards if needed
      for (let k = targetIndex + 1; k < TOTAL_FRAMES; k++) {
        if (images[k] && images[k].isLoaded) return images[k];
      }
      return null;
    }

    // Render frame to canvas using CSS object-fit: cover equivalent logic
    function renderFrame(index) {
      const img = getBestLoadedImage(index);
      if (!img) return;

      const cw = canvas.width;
      const ch = canvas.height;
      if (cw === 0 || ch === 0) return;

      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = cw / ch;

      let renderW, renderH, offsetX, offsetY;

      if (canvasRatio > imgRatio) {
        renderW = cw;
        renderH = cw / imgRatio;
        offsetX = 0;
        offsetY = (ch - renderH) / 2;
      } else {
        renderW = ch * imgRatio;
        renderH = ch;
        // Shift focal alignment slightly right (65%) to frame the model nicely
        offsetX = (cw - renderW) * 0.65;
        offsetY = 0;
      }

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, offsetX, offsetY, renderW, renderH);

      if (posterFallback && posterFallback.style.display !== 'none') {
        posterFallback.style.display = 'none';
      }
    }

    let targetFrame = 0;
    let displayedFrame = 0;

    // Calculate frame index based on window scroll position relative to container
    function calculateFrameIndex() {
      const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const heroTop = scrollContainer.offsetTop;
      const heroHeight = scrollContainer.offsetHeight;
      const maxScroll = heroHeight - window.innerHeight;

      if (maxScroll <= 0) return 0;

      const relativeScroll = scrollTop - heroTop;
      const progress = Math.max(0, Math.min(1, relativeScroll / maxScroll));
      return Math.min(TOTAL_FRAMES - 1, progress * (TOTAL_FRAMES - 1));
    }

    // Continuous smooth animation loop with linear interpolation (lerp)
    function smoothRenderLoop() {
      targetFrame = calculateFrameIndex();
      
      // Smooth lerp (0.12 factor gives a luxurious, fluid cinematic deceleration)
      if (Math.abs(targetFrame - displayedFrame) > 0.01) {
        displayedFrame += (targetFrame - displayedFrame) * 0.12;
        const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(displayedFrame)));
        
        if (frameIndex !== currentFrameIndex) {
          currentFrameIndex = frameIndex;
          renderFrame(currentFrameIndex);
        }
      }

      requestAnimationFrame(smoothRenderLoop);
    }

    // Preload WebP frame sequence with individual load tracking
    const getFrameUrl = (i) => `media/frames/frame_${String(i + 1).padStart(4, '0')}.webp`;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.isLoaded = false;
      img.onload = () => {
        img.isLoaded = true;
        if (i === currentFrameIndex) {
          renderFrame(currentFrameIndex);
        }
      };
      img.src = getFrameUrl(i);
      images.push(img);
    }

    window.addEventListener('resize', resizeCanvas);

    // Initial setup (Render static initial frame & start smooth lerp loop)
    resizeCanvas();
    requestAnimationFrame(smoothRenderLoop);
  }

  // 2. Scroll Reveal Observer for Sections
  const revealElements = document.querySelectorAll('.scroll-reveal');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Optionally unobserve once revealed
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

});
