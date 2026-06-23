import React, { useEffect, useRef } from 'react';

export default function CelebrationParticles({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!theme || theme === 'normal') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let fadeToSubtle = false;

    // Set canvas dimensions to full window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle configurations based on active theme
    const getThemeConfig = () => {
      switch (theme) {
        case 'soccer':
          return {
            emojiList: ['⚽', '🏆', '🎉', '⚽'],
            count: 22,
            subtleCount: 5,
            minSpeedY: 1.0,
            maxSpeedY: 2.5,
            minSize: 16,
            maxSize: 28,
            rotation: true
          };
        case 'champions':
          return {
            emojiList: ['⚽', '🏆', '⭐', '⚽'],
            count: 22,
            subtleCount: 5,
            minSpeedY: 0.9,
            maxSpeedY: 2.4,
            minSize: 15,
            maxSize: 26,
            rotation: true
          };
        case 'christmas':
          return {
            emojiList: ['❄️', '❅', '❆', '⭐', '❄️'],
            count: 28,
            subtleCount: 7,
            minSpeedY: 0.5,
            maxSpeedY: 1.6,
            minSize: 12,
            maxSize: 24,
            rotation: false // Snowflakes sway gently without heavy spinning
          };
        case 'halloween':
          return {
            emojiList: ['🎃', '👻', '🦇', '🕷️', '💀'],
            count: 16,
            subtleCount: 4,
            minSpeedY: 0.7,
            maxSpeedY: 2.0,
            minSize: 18,
            maxSize: 32,
            rotation: true
          };
        case 'valentine':
          return {
            emojiList: ['💖', '❤️', '🌹', '💕', '❤️'],
            count: 18,
            subtleCount: 4,
            minSpeedY: 0.6,
            maxSpeedY: 1.8,
            minSize: 16,
            maxSize: 26,
            rotation: true
          };
        case 'mothers':
          return {
            emojiList: ['🌸', '🌹', '❤️', '🌷', '🌸'],
            count: 18,
            subtleCount: 4,
            minSpeedY: 0.6,
            maxSpeedY: 1.8,
            minSize: 16,
            maxSize: 26,
            rotation: true
          };
        default:
          return null;
      }
    };

    const config = getThemeConfig();
    if (!config) return;

    // Particle Object Model
    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * canvas.width;
        // If initializing, distribute across full screen vertical space; otherwise, start above top boundary
        this.y = initial ? Math.random() * canvas.height : -50;
        this.size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
        this.speedY = Math.random() * (config.maxSpeedY - config.minSpeedY) + config.minSpeedY;
        this.speedX = (Math.random() - 0.5) * 0.8; // subtle horizontal drift
        this.emoji = config.emojiList[Math.floor(Math.random() * config.emojiList.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.02; // rotation rate
        this.opacity = Math.random() * 0.4 + 0.6; // opacity between 0.6 and 1.0
        this.swaySeed = Math.random() * 100;
        this.active = true;
      }

      update() {
        if (!this.active) return;
        this.y += this.speedY;
        this.x += this.speedX + Math.sin((this.y / 40) + this.swaySeed) * 0.25; // elegant wave movement
        this.angle += this.spin;

        // Reset particle state if it floats off-screen boundaries
        if (this.y > canvas.height + 50 || this.x < -50 || this.x > canvas.width + 50) {
          if (fadeToSubtle) {
            const activeCount = particles.filter((p) => p.active).length;
            if (activeCount > config.subtleCount) {
              this.active = false;
              return;
            }
          }
          this.reset(false);
        }
      }

      draw() {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        if (config.rotation) {
          ctx.rotate(this.angle);
        }
        ctx.font = `${this.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, 0, 0);
        ctx.restore();
      }
    }

    // Initialize particle array
    const particles = Array.from({ length: config.count }, () => new Particle());

    // Fade to subtle ambient level after 3 seconds
    const fadeTimer = setTimeout(() => {
      fadeToSubtle = true;
    }, 3000);

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Clean up event listeners, timers, and animation frames
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(fadeTimer);
    };
  }, [theme]);

  if (!theme || theme === 'normal') return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 99, // floats above content but below navigation overlays/modals
      }}
    />
  );
}
