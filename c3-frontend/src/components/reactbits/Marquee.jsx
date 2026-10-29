import React, { useRef, useEffect, useCallback } from 'react';
import './Marquee.css';

/**
 * High-performance, silky-smooth Marquee with:
 * - Fluid horizontal swipe/drag with mouse and touch
 * - Physical momentum / inertia on release
 * - Seamless infinite wrapping
 * - Non-interfering click suppression (cards only flip on tap, never during drag/swipe)
 * - Zero GPU-mask lag (uses hardware-accelerated gradient edge overlays)
 */
const Marquee = ({
  children,
  direction = 'left',
  speed = 22, // pixels per second
  pauseOnHover = true,
  className = '',
}) => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const contentRef = useRef(null);

  // High-frequency animation state stored in mutable refs (0 React re-renders)
  const xRef = useRef(0);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const contentWidthRef = useRef(0);
  const animFrameId = useRef(null);
  const lastTimeRef = useRef(0);

  // Measure content width
  useEffect(() => {
    const measure = () => {
      if (contentRef.current) {
        contentWidthRef.current = contentRef.current.offsetWidth;
      }
    };
    measure();

    const resizeObserver = new ResizeObserver(measure);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    window.addEventListener('resize', measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [children]);

  // RequestAnimationFrame animation & momentum loop
  useEffect(() => {
    const dirFactor = direction === 'right' ? 1 : -1;
    const baseSpeed = typeof speed === 'number' ? speed : 22;

    const animate = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      const halfWidth = contentWidthRef.current;

      if (halfWidth > 0 && trackRef.current) {
        if (!isDraggingRef.current) {
          // If user released with swipe momentum, smoothly decay it
          if (Math.abs(velocityRef.current) > 1) {
            xRef.current += velocityRef.current * dt;
            velocityRef.current *= Math.pow(0.9, dt * 60);
          } else if (!isHoveredRef.current || !pauseOnHover) {
            // Natural marquee auto-scroll
            xRef.current += dirFactor * baseSpeed * dt;
          }

          // Infinite wrap-around
          while (xRef.current <= -halfWidth) {
            xRef.current += halfWidth;
          }
          while (xRef.current > 0) {
            xRef.current -= halfWidth;
          }

          trackRef.current.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
        }
      }

      animFrameId.current = requestAnimationFrame(animate);
    };

    animFrameId.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [direction, speed, pauseOnHover]);

  // Pointer / Touch down
  const onPointerDown = (e) => {
    // Only primary button
    if (e.button !== undefined && e.button !== 0) return;
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    dragDistanceRef.current = 0;
    velocityRef.current = 0;
  };

  // Pointer / Touch move
  const onPointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const currentX = e.clientX;
    const delta = currentX - lastXRef.current;
    dragDistanceRef.current += Math.abs(currentX - startXRef.current);
    lastXRef.current = currentX;

    xRef.current += delta;
    const halfWidth = contentWidthRef.current;
    if (halfWidth > 0) {
      while (xRef.current <= -halfWidth) {
        xRef.current += halfWidth;
      }
      while (xRef.current > 0) {
        xRef.current -= halfWidth;
      }
    }

    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
    }

    // Capture fling velocity
    velocityRef.current = delta * 50;
  };

  // Pointer / Touch up or cancel
  const endDrag = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // If user dragged more than 5px, suppress click so FlipCard does NOT flip!
    if (dragDistanceRef.current > 5) {
      const suppressClick = (clickEvent) => {
        clickEvent.stopPropagation();
        clickEvent.preventDefault();
      };
      window.addEventListener('click', suppressClick, { capture: true, once: true });
      setTimeout(() => {
        window.removeEventListener('click', suppressClick, { capture: true });
      }, 80);
    }
  }, []);

  // Wheel handling for touchpad horizontal swipe / Shift+Wheel
  const onWheel = (e) => {
    const delta = e.deltaX !== 0 ? e.deltaX : e.shiftKey ? e.deltaY : 0;
    if (Math.abs(delta) > 2) {
      e.preventDefault();
      xRef.current -= delta * 0.8;
      const halfWidth = contentWidthRef.current;
      if (halfWidth > 0) {
        while (xRef.current <= -halfWidth) {
          xRef.current += halfWidth;
        }
        while (xRef.current > 0) {
          xRef.current -= halfWidth;
        }
      }
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`marquee-viewport relative overflow-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => { isHoveredRef.current = false; endDrag(); }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onWheel={onWheel}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Sleek edge fade overlays (hardware accelerated, zero compositing cost) */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-l from-black via-black/80 to-transparent z-10" />

      <div
        ref={trackRef}
        className="marquee-track flex will-change-transform"
      >
        <div ref={contentRef} className="marquee-content flex shrink-0">
          {children}
        </div>
        <div className="marquee-content flex shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Marquee;