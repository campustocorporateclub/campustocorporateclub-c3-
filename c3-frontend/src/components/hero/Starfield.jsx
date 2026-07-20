import { useEffect, useRef } from 'react';

/**
 * Self-contained twinkling starfield with mouse-repel interaction.
 * No props needed - fully independent, safe to drop anywhere as a
 * full-bleed background layer.
 */
const Starfield = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let stars = [];

    const REPEL_RADIUS = 140;
    const REPEL_STRENGTH = 46;
    const EASE = 0.12;

    const resize = () => {
      const dpr = Math.max(window.devicePixelRatio || 1, 1);
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      generateStars(w, h);
    };

    const generateStars = (w, h) => {
      const count = Math.floor((w * h) / 5500);
      stars = Array.from({ length: count }, () => {
        const ox = Math.random() * w;
        const oy = Math.random() * h;
        return {
          ox, oy, x: ox, y: oy,
          radius: Math.random() * 1.8 + 0.7,
          baseOpacity: Math.random() * 0.6 + 0.35,
          twinkleSpeed: Math.random() * 0.0015 + 0.0005,
          twinklePhase: Math.random() * Math.PI * 2,
        };
      });
    };

    const getCanvasCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseMove = (e) => { mouseRef.current = getCanvasCoords(e); };
    const handleMouseLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

    const draw = (time) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      const { x: mx, y: my } = mouseRef.current;

      stars.forEach((star) => {
        const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinklePhase);
        const opacity = star.baseOpacity * twinkle;

        const dx = star.ox - mx;
        const dy = star.oy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetX = star.ox;
        let targetY = star.oy;
        if (dist < REPEL_RADIUS) {
          const force = 1 - dist / REPEL_RADIUS;
          const angle = Math.atan2(dy, dx);
          targetX = star.ox + Math.cos(angle) * force * REPEL_STRENGTH;
          targetY = star.oy + Math.sin(angle) * force * REPEL_STRENGTH;
        }

        star.x += (targetX - star.x) * EASE;
        star.y += (targetY - star.y) * EASE;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
};

export default Starfield;
