const RING_RADIUS = 50;
export const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * The preloader / boot screen. All animation is driven by the master GSAP
 * timeline in Hero.jsx via the refs passed down - this component only
 * owns markup + static styling.
 */
const Preloader = ({ show, refs }) => {
  const {
    ringGroupRef,
    progressRingRef,
    leftPanelRef,
    rightPanelRef,
    hudRefs,
    bootLineRef,
  } = refs;

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      <div ref={leftPanelRef} className="absolute top-0 left-0 w-1/2 h-full bg-[#050b14]" />
      <div ref={rightPanelRef} className="absolute top-0 right-0 w-1/2 h-full bg-[#050b14]" />

      {/* Scan-line sweep - reinforces the "booting up hardware" feel */}
      <div className="preloader-scanline" />

      {/* HUD corner text */}
      <span ref={(el) => (hudRefs.current[0] = el)} className="hud-text top-8 left-8">SYS://C3-INIT</span>
      <span ref={(el) => (hudRefs.current[1] = el)} className="hud-text top-8 right-8">19.07.2026 // 07:53</span>
      <span ref={(el) => (hudRefs.current[2] = el)} className="hud-text bottom-8 right-8">AUTHORIZED ACCESS</span>

      {/* Sequential boot log - text changes as the ring fills, driven by the
          master timeline (see Hero.jsx) instead of a single static line */}
      <span ref={bootLineRef} className="hud-text bottom-8 left-8">INITIALIZING C3 CORE...</span>

      {/* Ring border IS the loader - "C3" + slogan sit static in the center */}
      <div
        ref={ringGroupRef}
        className="preloader-ring-wrap absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center"
      >
        <div className="relative flex items-center justify-center">
          <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
            <circle
              cx="56" cy="56" r={RING_RADIUS}
              fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2"
            />
            <circle
              ref={progressRingRef}
              cx="56" cy="56" r={RING_RADIUS}
              fill="none" stroke="#ADEFD1" strokeWidth="2" strokeLinecap="round"
            />
          </svg>
          <span className="font-display font-bold text-white absolute" style={{ fontSize: '22px' }}>
            C3
          </span>
        </div>

        {/* Slogan now lives here, under the logo, instead of on the Hero page */}
        <span className="font-hud text-[10px] uppercase tracking-[0.25em] text-[#9a978f] mt-4">
          Learn. Collaborate. Grow.
        </span>
      </div>
    </div>
  );
};

export default Preloader;
