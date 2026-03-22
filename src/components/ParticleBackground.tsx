"use client";

import React, { useEffect, useRef } from 'react';

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    // Check if mobile loosely for performance
    const isMobile = window.innerWidth < 768;
    // Lower amount of particles on mobile
    const maxParticles = isMobile ? 30 : 80;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 150
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleClick = (e: MouseEvent) => {
      // Burst effect on click
      const burstCount = isMobile ? 8 : 15;
      for (let i = 0; i < burstCount; i++) {
        particles.push(new Particle(e.clientX, e.clientY, true));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    const colors = ['#a855f7', '#3b82f6', '#ec4899']; // purple, blue, pink

    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      density: number;
      color: string;
      isBurst: boolean;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;

      constructor(x?: number, y?: number, isBurst: boolean = false) {
        this.isBurst = isBurst;
        this.x = x !== undefined ? x : Math.random() * canvas!.width;
        this.y = y !== undefined ? y : Math.random() * canvas!.height;
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        if (isBurst) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 4 + 1;
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed;
          this.life = 1;
          this.maxLife = Math.random() * 40 + 30;
        } else {
          // Slow floating movement
          this.vx = (Math.random() - 0.5) * 0.4;
          this.vy = (Math.random() - 0.5) * 0.4;
          this.life = 0;
          this.maxLife = 0;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        
        // Slight glow effect
        ctx.shadowBlur = this.isBurst ? 15 : 8;
        ctx.shadowColor = this.color;
        
        if (this.isBurst) {
          ctx.fillStyle = this.color;
          // Fade out over life
          ctx.globalAlpha = Math.max(0, 1 - (this.life / this.maxLife));
        } else {
          ctx.fillStyle = this.color;
          ctx.globalAlpha = 0.3; // subtle opacity for default particles
        }
        
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0; // reset for lines
      }

      update() {
        if (this.isBurst) {
          this.x += this.vx;
          this.y += this.vy;
          this.life++;
          return;
        }

        // Standard floating movement
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around gracefully
        if (this.x > canvas!.width) this.x = 0;
        if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        if (this.y < 0) this.y = canvas!.height;

        // Mouse interaction (repel effect)
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          // Calculate force
          let forceDirectionX = dx / distance;
          let forceDirectionY = dy / distance;
          let force = (mouse.radius - distance) / mouse.radius;
          let directionX = forceDirectionX * force * this.density;
          let directionY = forceDirectionY * force * this.density;
          
          this.x += directionX * 0.1; // Smooth push
          this.y += directionY * 0.1;
        }
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
      }
    };

    const connect = () => {
      // connecting lines can be heavy, skip on extreme mobile screens if performance drops
      // but we reduce particle count, so it's usually fine
      if (!ctx) return;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          if (particles[a].isBurst || particles[b].isBurst) continue;
          
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let distance = dx * dx + dy * dy;

          // Slightly connect when close
          if (distance < 15000) {
            let opacityValue = 1 - (distance / 15000);
            ctx.strokeStyle = `rgba(168, 85, 247, ${opacityValue * 0.15})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      if (!ctx) return;
      // Clear with slight trailing effect capability or full clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        // Remove dead burst particles
        if (particles[i].isBurst && particles[i].life >= particles[i].maxLife) {
          particles.splice(i, 1);
          i--;
        }
      }
      
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
