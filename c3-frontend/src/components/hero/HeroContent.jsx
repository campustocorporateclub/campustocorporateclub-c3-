import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Small magnetic-hover wrapper - the button nudges slightly toward the
 * cursor within its own bounds, then springs back on mouse-leave.
 * One clean interaction, applied to just the two CTAs.
 */
const MagneticButton = ({ children, className, href, glow }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.5 });

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    x.set(relX * 0.25);
    y.set(relY * 0.25);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.05, boxShadow: glow }}
      transition={{ duration: 0.25 }}
      className={className}
    >
      {children}
    </motion.a>
  );
};

const HeroContent = ({ refs }) => {
  const {
    headingWrapRef,
    headingRef,
    glitchARef,
    glitchBRef,
    subRef,
    descRef,
    ctaRef,
    boltRef,
    mainStrokeRef,
    branch1Ref,
    branch2Ref,
  } = refs;

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Subtle parallax tilt on the heading block, following the cursor while
  // it's over the heading - small range, meant to feel premium, not gimmicky.
  const handleTiltMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 8);
    rotateX.set(-py * 8);
  };
  const handleTiltLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <section
      id="home"
      className="relative z-10 flex flex-col items-center justify-center text-center px-6 min-h-[115vh] pt-24 pb-32 font-body"
    >
      <motion.div
        ref={headingWrapRef}
        onMouseMove={handleTiltMove}
        onMouseLeave={handleTiltLeave}
        style={{ rotateX, rotateY, transformPerspective: 800 }}
        className="relative inline-block mb-2"
      >
        <h1
          ref={headingRef}
          className="grad-heading font-display font-bold leading-tight"
          style={{ fontSize: 'clamp(40px, 7vw, 88px)' }}
        >
          Campus to Corporate
        </h1>

        {/* Glitch duplicate layers - palette colors (mint / steel-blue),
            not red/cyan, so the strike doesn't cast an off-brand tint */}
        <h1
          ref={glitchARef}
          aria-hidden="true"
          className="glitch-layer font-display font-bold leading-tight"
          style={{ fontSize: 'clamp(40px, 7vw, 88px)', background: '#ADEFD1' }}
        >
          Campus to Corporate
        </h1>
        <h1
          ref={glitchBRef}
          aria-hidden="true"
          className="glitch-layer font-display font-bold leading-tight"
          style={{ fontSize: 'clamp(40px, 7vw, 88px)', background: '#4f9dbd' }}
        >
          Campus to Corporate
        </h1>

        {/* Lightning bolt - centered, striking through the heading.
            Hidden below 480px via hero.css so small screens stay legible. */}
        <svg
          ref={boltRef}
          viewBox="0 0 600 160"
          preserveAspectRatio="none"
          className="hero-lightning-svg absolute inset-0 w-full h-full pointer-events-none"
          style={{ filter: 'drop-shadow(0 0 3px #ADEFD1) drop-shadow(0 0 6px #4f9dbd)' }}
        >
          <path
            ref={mainStrokeRef}
            d="M 340 0 L 300 45 L 335 50 L 260 105 L 290 108 L 210 160"
            fill="none" stroke="#ADEFD1" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round"
          />
          <path
            ref={branch1Ref}
            d="M 335 50 L 385 68 L 405 60"
            fill="none" stroke="#7fd8b8" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          />
          <path
            ref={branch2Ref}
            d="M 290 108 L 245 122 L 230 145"
            fill="none" stroke="#4f9dbd" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      <h2 ref={subRef} className="font-bold text-[#f3f1ee] mb-6" style={{ fontSize: 'clamp(20px, 3vw, 30px)' }}>
        Building Placement-Ready Engineers, One Session at a Time
      </h2>

      <p ref={descRef} className="text-[#9a978f] max-w-xl mb-10 leading-relaxed">
        C3 is the official technical club of the CSE department, running daily
        15-minute sessions, hands-on projects, and honest mentorship. We exist
        to close the gap between what college teaches and what companies
        actually expect.
      </p>

      <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 mb-8">
        <MagneticButton
          href="/register"
          glow="0 0 24px rgba(173,239,209,0.35)"
          className="bg-white text-[#050b14] font-bold px-8 py-4 rounded-full"
        >
          Join C3
        </MagneticButton>
        <MagneticButton
          href="#about"
          glow="0 0 20px rgba(79,157,189,0.3)"
          className="border border-white/20 text-[#f3f1ee] font-semibold px-8 py-4 rounded-full"
        >
          Learn More
        </MagneticButton>
      </div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="font-hud text-[10px] uppercase tracking-[0.2em] text-[#9a978f]">Scroll</span>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
          <rect x="1" y="1" width="14" height="22" rx="7" stroke="#9a978f" strokeWidth="1.2" />
          <circle cx="8" cy="7" r="2" fill="#ADEFD1" />
        </svg>
      </motion.div>
    </section>
  );
};

export default HeroContent;
