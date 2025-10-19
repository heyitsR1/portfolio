
// Dual particle system for different sections
class ParticleSystem {
  constructor() {
    this.heroCanvas = null;
    this.heroCtx = null;
    this.contentCanvas = null;
    this.contentCtx = null;
    this.heroParticles = [];
    this.contentParticles = [];
    this.mouse = { x: 0, y: 0 };
    this.scrollY = 0;
    this.frameCount = 0;
    this.init();
  }

  init() {
    this.heroCanvas = document.createElement('canvas');
    this.heroCanvas.id = 'hero-particle-canvas';
    this.heroCanvas.style.position = 'absolute';
    this.heroCanvas.style.pointerEvents = 'none';
    this.heroCanvas.style.zIndex = '1';
    this.heroCanvas.style.opacity = '0.9';
    this.heroCanvas.style.transition = 'opacity 0.5s ease-in-out';
    
    this.contentCanvas = document.createElement('canvas');
    this.contentCanvas.id = 'content-particle-canvas';
    this.contentCanvas.style.position = 'fixed'; // Changed back to fixed
    this.contentCanvas.style.top = '0';
    this.contentCanvas.style.left = '0';
    this.contentCanvas.style.width = '100%';
    this.contentCanvas.style.height = '100%';
    this.contentCanvas.style.pointerEvents = 'none';
    this.contentCanvas.style.zIndex = '2';
    this.contentCanvas.style.opacity = '0';
    
    document.body.appendChild(this.heroCanvas);
    document.body.appendChild(this.contentCanvas);
    
    this.heroCtx = this.heroCanvas.getContext('2d');
    this.contentCtx = this.contentCanvas.getContext('2d');
    
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    const heroSection = document.querySelector('.hero');
    
    if (heroSection) {
      const heroRect = heroSection.getBoundingClientRect();
      const heroTop = heroRect.top + window.scrollY;
      const heroHeight = heroSection.offsetHeight;
      
      this.heroCanvas.style.top = heroTop + 'px';
      this.heroCanvas.style.left = '0';
      this.heroCanvas.style.width = '100%';
      this.heroCanvas.style.height = heroHeight + 'px';
      
      this.heroCanvas.width = window.innerWidth;
      this.heroCanvas.height = heroHeight;
    }
    
    // Content canvas covers the full viewport
    this.contentCanvas.width = window.innerWidth;
    this.contentCanvas.height = window.innerHeight;
  }

  createParticles() {
    // Clear existing particles first
    this.heroParticles = [];
    this.contentParticles = [];
    
    // Mobile optimization - reduce particles on smaller screens
    const isMobile = window.innerWidth < 768;
    const mobileMultiplier = isMobile ? 0.4 : 1; // Reduced mobile multiplier
    
    // Calculate particle counts with stricter limits
    const heroParticleCount = Math.min(60, Math.max(15, Math.floor(window.innerWidth / 30))) * mobileMultiplier;
    const contentParticleCount = Math.min(40, Math.max(8, Math.floor(window.innerWidth / 50))) * mobileMultiplier;
    
    // Create hero particles
    for (let i = 0; i < heroParticleCount; i++) {
      this.heroParticles.push({
        x: Math.random() * this.heroCanvas.width,
        y: Math.random() * this.heroCanvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 3 + 1.5,
        opacity: Math.random() * 0.6 + 0.2,
        originalOpacity: Math.random() * 0.6 + 0.2,
        glow: Math.random() * 0.8 + 0.2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.04 + 0.02,
        wanderAngle: Math.random() * Math.PI * 2,
        wanderSpeed: Math.random() * 0.03 + 0.015,
        wanderRadius: Math.random() * 60 + 30
      });
    }

    // Create content particles
    for (let i = 0; i < contentParticleCount; i++) {
      this.contentParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        size: Math.random() * 2.8 + 1.5,
        opacity: Math.random() * 0.5 + 0.3,
        originalOpacity: Math.random() * 0.5 + 0.3,
        bounceStrength: Math.random() * 0.7 + 0.4,
        bounceDecay: Math.random() * 0.98 + 0.01,
        hue: Math.random() * 40 + 200,
        saturation: Math.random() * 30 + 20,
        wanderAngle: Math.random() * Math.PI * 2,
        wanderSpeed: Math.random() * 0.02 + 0.01,
        wanderRadius: Math.random() * 40 + 20,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.03 + 0.02,
        interactionRadius: Math.random() * 80 + 60
      });
    }
  }

  bindEvents() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      // Debounce resize events to prevent excessive particle recreation
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.resize();
        this.createParticles(); // Recreate particles on resize
      }, 150);
    });
    
    window.addEventListener('scroll', () => {
      this.scrollY = window.scrollY;
      this.updateHeroCanvasVisibility();
      this.updateContentParticleVisibility();
    });
    
    // Use requestAnimationFrame for smoother mouse tracking
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  // Add cleanup method
  destroy() {
    if (this.heroCanvas && this.heroCanvas.parentNode) {
      this.heroCanvas.parentNode.removeChild(this.heroCanvas);
    }
    if (this.contentCanvas && this.contentCanvas.parentNode) {
      this.contentCanvas.parentNode.removeChild(this.contentCanvas);
    }
    this.heroParticles = [];
    this.contentParticles = [];
  }

  updateHeroCanvasVisibility() {
    const heroSection = document.querySelector('.hero');
    
    if (heroSection) {
      const heroRect = heroSection.getBoundingClientRect();
      const heroBottom = heroRect.bottom;
      
      if (heroBottom < 0) {
        this.heroCanvas.style.opacity = '0';
      } else {
        this.heroCanvas.style.opacity = '0.9';
      }
    }
  }

  updateContentParticleVisibility() {
    const heroSection = document.querySelector('.hero');
    
    if (heroSection) {
      const heroRect = heroSection.getBoundingClientRect();
      const heroBottom = heroRect.bottom;
      
      if (heroBottom > window.innerHeight * 0.1) {
        // Hero section is still mostly visible, hide content particles
        this.contentCanvas.style.opacity = '0';
      } else {
        // Hero section is scrolled out or barely visible, show content particles
        this.contentCanvas.style.opacity = '0.6';
      }
    }
  }

  animate() {
    this.heroCtx.clearRect(0, 0, this.heroCanvas.width, this.heroCanvas.height);
    this.contentCtx.clearRect(0, 0, this.contentCanvas.width, this.contentCanvas.height);
    
    this.animateHeroParticles();
    this.animateContentParticles();
    
    // Reduce animation frequency on mobile for better performance
    const isMobile = window.innerWidth < 768;
    const delay = isMobile ? 2 : 1;
    
    if (this.frameCount % delay === 0) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.frameCount++;
      requestAnimationFrame(() => this.animate());
    }
  }

  animateHeroParticles() {
    const visibleParticles = [];
    
    this.heroParticles.forEach((particle) => {
      particle.wanderAngle += particle.wanderSpeed;
      const wanderX = Math.cos(particle.wanderAngle) * particle.wanderRadius;
      const wanderY = Math.sin(particle.wanderAngle) * particle.wanderRadius;
      
      particle.vx += wanderX * 0.0001;
      particle.vy += wanderY * 0.0001;
      
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      particle.pulse += particle.pulseSpeed;
      
      const dx = this.mouse.x - particle.x;
      const dy = this.mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 120) {
        const force = (120 - distance) / 120;
        particle.vx -= (dx / distance) * force * 0.008;
        particle.vy -= (dy / distance) * force * 0.008;
        particle.opacity = particle.originalOpacity + force * 0.4;
        particle.glow = Math.min(1, particle.glow + force * 0.2);
      } else {
        particle.opacity = particle.originalOpacity;
        particle.glow = particle.originalOpacity;
        particle.vx *= 0.999;
        particle.vy *= 0.999;
      }
      
      if (particle.x < 0) particle.x = this.heroCanvas.width;
      if (particle.x > this.heroCanvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.heroCanvas.height;
      if (particle.y > this.heroCanvas.height) particle.y = 0;
      
      const maxVelocity = 1.5;
      const currentVelocity = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (currentVelocity > maxVelocity) {
        particle.vx = (particle.vx / currentVelocity) * maxVelocity;
        particle.vy = (particle.vy / currentVelocity) * maxVelocity;
      }
      
      const pulseIntensity = Math.sin(particle.pulse) * 0.4 + 0.6;
      const currentOpacity = particle.opacity * pulseIntensity;
      const currentSize = particle.size * (0.7 + pulseIntensity * 0.5);
      
      this.heroCtx.beginPath();
      this.heroCtx.arc(particle.x, particle.y, currentSize * 1.8, 0, Math.PI * 2);
      this.heroCtx.fillStyle = `rgba(244, 221, 23, ${currentOpacity * 0.04})`;
      this.heroCtx.fill();
      
      this.heroCtx.beginPath();
      this.heroCtx.arc(particle.x, particle.y, currentSize * 1.3, 0, Math.PI * 2);
      this.heroCtx.fillStyle = `rgba(244, 221, 23, ${currentOpacity * 0.08})`;
      this.heroCtx.fill();
      
      this.heroCtx.beginPath();
      this.heroCtx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
      this.heroCtx.fillStyle = `rgba(244, 221, 23, ${currentOpacity * 0.9})`;
      this.heroCtx.fill();
      
      this.heroCtx.beginPath();
      this.heroCtx.arc(particle.x, particle.y, currentSize * 0.4, 0, Math.PI * 2);
      this.heroCtx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.95})`;
      this.heroCtx.fill();
      
      visibleParticles.push({ x: particle.x, y: particle.y, opacity: currentOpacity, pulseIntensity });
    });
    
    this.drawHeroConnections(visibleParticles);
  }

  animateContentParticles() {
    this.contentParticles.forEach((particle) => {
      // Add wandering movement
      particle.wanderAngle += particle.wanderSpeed;
      const wanderX = Math.cos(particle.wanderAngle) * particle.wanderRadius;
      const wanderY = Math.sin(particle.wanderAngle) * particle.wanderRadius;
      
      particle.vx += wanderX * 0.0002;
      particle.vy += wanderY * 0.0002;
      
      // Mouse interaction
      const dx = this.mouse.x - particle.x;
      const dy = this.mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < particle.interactionRadius) {
        const force = (particle.interactionRadius - distance) / particle.interactionRadius;
        const interactionStrength = 0.015 + Math.random() * 0.01;
        
        particle.vx -= (dx / distance) * force * interactionStrength;
        particle.vy -= (dy / distance) * force * interactionStrength;
        particle.opacity = particle.originalOpacity + force * 0.4;
        
        if (Math.random() < 0.1) {
          particle.vx += (Math.random() - 0.5) * 0.5;
          particle.vy += (Math.random() - 0.5) * 0.5;
        }
      } else {
        particle.opacity = particle.originalOpacity;
        particle.vx *= 0.995;
        particle.vy *= 0.995;
      }
      
      // Add pulsing effect
      particle.pulse += particle.pulseSpeed;
      const pulseIntensity = Math.sin(particle.pulse) * 0.3 + 0.7;
      
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Boundary bouncing
      if (particle.x < 0 || particle.x > this.contentCanvas.width) {
        particle.vx = -particle.vx * particle.bounceStrength;
        particle.x = Math.max(0, Math.min(this.contentCanvas.width, particle.x));
        particle.opacity = particle.originalOpacity * 0.7;
        
        if (Math.random() < 0.3) {
          particle.vy += (Math.random() - 0.5) * 0.8;
        }
      }
      
      if (particle.y < 0 || particle.y > this.contentCanvas.height) {
        particle.vy = -particle.vy * particle.bounceStrength;
        particle.y = Math.max(0, Math.min(this.contentCanvas.height, particle.y));
        particle.opacity = particle.originalOpacity * 0.7;
      }
      
      // Gradually restore opacity
      particle.opacity = Math.min(particle.originalOpacity, particle.opacity + 0.008);
      
      // Maintain bounce strength
      particle.bounceStrength *= particle.bounceDecay;
      if (particle.bounceStrength < 0.25) particle.bounceStrength = 0.25;
      
      // Limit velocity
      const maxVelocity = 2.5;
      const currentVelocity = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (currentVelocity > maxVelocity) {
        particle.vx = (particle.vx / currentVelocity) * maxVelocity;
        particle.vy = (particle.vy / currentVelocity) * maxVelocity;
      }
      
      // Render particle
      const finalOpacity = particle.opacity * pulseIntensity;
      const finalSize = particle.size * (0.8 + pulseIntensity * 0.4);
      
      const color = `hsla(${particle.hue}, ${particle.saturation}%, 70%, ${finalOpacity})`;
      const glowColor = `hsla(${particle.hue}, ${particle.saturation}%, 70%, ${finalOpacity * 0.3})`;
      
      // Draw glow
      this.contentCtx.beginPath();
      this.contentCtx.arc(particle.x, particle.y, finalSize * 2.5, 0, Math.PI * 2);
      this.contentCtx.fillStyle = glowColor;
      this.contentCtx.fill();
      
      // Draw main particle
      this.contentCtx.beginPath();
      this.contentCtx.arc(particle.x, particle.y, finalSize, 0, Math.PI * 2);
      this.contentCtx.fillStyle = color;
      this.contentCtx.fill();
      
      // Add inner highlight
      this.contentCtx.beginPath();
      this.contentCtx.arc(particle.x, particle.y, finalSize * 0.4, 0, Math.PI * 2);
      this.contentCtx.fillStyle = `hsla(${particle.hue}, ${particle.saturation}%, 85%, ${finalOpacity * 0.7})`;
      this.contentCtx.fill();
    });
    
    // Draw connections between nearby particles
    this.drawContentConnections();
  }
  
  drawContentConnections() {
    const maxConnectionDistance = 120;
    
    for (let i = 0; i < this.contentParticles.length; i++) {
      for (let j = i + 1; j < this.contentParticles.length; j++) {
        const p1 = this.contentParticles[i];
        const p2 = this.contentParticles[j];
        
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxConnectionDistance) {
          const opacity = 0.03 * (1 - distance / maxConnectionDistance);
          if (opacity > 0.005) {
            this.contentCtx.beginPath();
            this.contentCtx.moveTo(p1.x, p1.y);
            this.contentCtx.lineTo(p2.x, p2.y);
            this.contentCtx.strokeStyle = `hsla(200, 30%, 70%, ${opacity})`;
            this.contentCtx.lineWidth = 0.5;
            this.contentCtx.stroke();
          }
        }
      }
    }
  }
  
  drawHeroConnections(visibleParticles) {
    const maxConnectionDistance = 100;
    
    for (let i = 0; i < visibleParticles.length; i++) {
      for (let j = i + 1; j < visibleParticles.length; j++) {
        const p1 = visibleParticles[i];
        const p2 = visibleParticles[j];
        
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxConnectionDistance) {
          const opacity = 0.04 * (1 - distance / maxConnectionDistance) * p1.pulseIntensity;
          if (opacity > 0.01) {
            this.heroCtx.beginPath();
            this.heroCtx.moveTo(p1.x, p1.y);
            this.heroCtx.lineTo(p2.x, p2.y);
            this.heroCtx.strokeStyle = `rgba(244, 221, 23, ${opacity})`;
            this.heroCtx.lineWidth = 0.4;
            this.heroCtx.stroke();
          }
        }
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ParticleSystem();
});