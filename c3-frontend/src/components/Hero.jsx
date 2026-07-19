import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const RING_RADIUS = 50;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const Hero = () => {
  const [showPreloader, setShowPreloader] = useState(true);

  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  // Preloader refs
  const ringGroupRef = useRef(null);
  const progressRingRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const hudRefs = useRef([]);

  // Hero content refs
  const headingWrapRef = useRef(null);
  const headingRef = useRef(null);
  const glitchRedRef = useRef(null);
  const glitchCyanRef = useRef(null);
  const subRef = useRef(null);
  const descRef = useRef(null);
  const ctaRef = useRef(null);
  const taglineRef = useRef(null);
  const boltRef = useRef(null);
  const mainStrokeRef = useRef(null);
  const branch1Ref = useRef(null);
  const branch2Ref = useRef(null);

  // ============ STARFIELD (twinkle + repel, DPR-aware) ============
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

  // ============ MASTER TIMELINE: preloader -> panel split -> hero stagger -> lightning ============
  useEffect(() => {
    const master = gsap.timeline({
      onComplete: () => setShowPreloader(false),
    });

    gsap.set([headingRef.current, subRef.current, descRef.current, ctaRef.current, taglineRef.current], {
      opacity: 0,
      y: 22,
    });
    gsap.set(boltRef.current, { opacity: 0 });
    gsap.set([glitchRedRef.current, glitchCyanRef.current], { opacity: 0 });

    gsap.set(progressRingRef.current, {
      strokeDasharray: RING_CIRCUMFERENCE,
      strokeDashoffset: RING_CIRCUMFERENCE,
    });

    // --- 1. Ring fades in ---
    master.fromTo(
      ringGroupRef.current,
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
    );

    // --- 2. HUD corner text flicker ---
    master.fromTo(
      hudRefs.current,
      { opacity: 0 },
      {
        opacity: 0.7,
        duration: 0.06,
        repeat: 4,
        yoyo: true,
        stagger: { each: 0.07, from: 'random' },
      },
      '<'
    );

    // --- 3. Ring border fills - this IS the loading indicator, "C3" sits static in the middle ---
    master.to(
      progressRingRef.current,
      { strokeDashoffset: 0, duration: 1.4, ease: 'none' },
      '<'
    );

    // --- 4. Preloader group exits, panels split apart ---
    master.to(ringGroupRef.current, { opacity: 0, scale: 0.9, duration: 0.2 });
    master.to(hudRefs.current, { opacity: 0, duration: 0.2 }, '<');
    master.to(
      leftPanelRef.current,
      { xPercent: -100, duration: 0.65, ease: 'power3.inOut' },
      '-=0.05'
    );
    master.to(
      rightPanelRef.current,
      { xPercent: 100, duration: 0.65, ease: 'power3.inOut' },
      '<'
    );

    // --- 5. Hero content stagger-in ---
    master
      .to(headingRef.current, { opacity: 1, y: 0, duration: 0.7 }, '-=0.35')
      .to(subRef.current, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .to(descRef.current, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .to(taglineRef.current, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3');

    // --- 6. Lightning strike through the heading - longer, no shake, RGB-split glitch instead ---
    master.add(() => {
      const strikeTl = gsap.timeline();
      const mainLen = mainStrokeRef.current.getTotalLength();
      const b1Len = branch1Ref.current.getTotalLength();
      const b2Len = branch2Ref.current.getTotalLength();

      gsap.set(mainStrokeRef.current, { strokeDasharray: mainLen, strokeDashoffset: mainLen });
      gsap.set(branch1Ref.current, { strokeDasharray: b1Len, strokeDashoffset: b1Len });
      gsap.set(branch2Ref.current, { strokeDasharray: b2Len, strokeDashoffset: b2Len });

      strikeTl
        .set(boltRef.current, { opacity: 1 })
        .to(mainStrokeRef.current, { strokeDashoffset: 0, duration: 0.4, ease: 'power1.in' })
        .to(branch1Ref.current, { strokeDashoffset: 0, duration: 0.22, ease: 'power1.out' }, '-=0.15')
        .to(branch2Ref.current, { strokeDashoffset: 0, duration: 0.22, ease: 'power1.out' }, '-=0.15')
        // Brightness flash on the heading at the peak of the strike
        .to(headingRef.current, { filter: 'brightness(2.4)', duration: 0.1, yoyo: true, repeat: 1 }, '-=0.1')
        // One clean RGB-split glitch beat instead of a shake - red/cyan duplicate
        // layers punch out briefly then snap back. Not a repeating loop.
        .to(
          glitchRedRef.current,
          { opacity: 0.75, x: -4, duration: 0.06, ease: 'none' },
          '<'
        )
        .to(
          glitchCyanRef.current,
          { opacity: 0.75, x: 4, duration: 0.06, ease: 'none' },
          '<'
        )
        .to(
          [glitchRedRef.current, glitchCyanRef.current],
          { opacity: 0, x: 0, duration: 0.12, ease: 'power2.out' },
          '+=0.05'
        )
        // Bolt holds a beat, then settles to a faint permanent afterimage
        // instead of disappearing entirely - full sequence lands ~1.2-1.5s
        .to(boltRef.current, { opacity: 0.14, duration: 0.5 }, '+=0.3');
    }, '+=0.1');

    return () => master.kill();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a0c] overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .font-display { font-family: 'Bricolage Grotesque', sans-serif; letter-spacing: -0.01em; }
        .font-body { font-family: 'Manrope', sans-serif; }
        .font-hud { font-family: 'IBM Plex Mono', monospace; }

        /* One-directional sweep (0% -> 100%, no yoyo back-and-forth) so the
           motion reads clearly as color flowing left-to-right across the text */
        @keyframes gradientFlow {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        /* Sailor Blue & Mint - mint-heavy at the start so the heading stays
           legible against the dark background, deepening to navy at the tail.
           Repeated twice in the gradient stops so the sweep loops seamlessly. */
        .grad-heading {
          background: linear-gradient(
            90deg,
            #ADEFD1 0%, #6FBFA8 20%, #00203F 40%,
            #ADEFD1 60%, #6FBFA8 80%, #00203F 100%
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          animation: gradientFlow 4s linear infinite;
        }
        .hud-text {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.15em;
          color: rgba(173, 239, 209, 0.8);
          position: absolute;
        }
        /* Glitch duplicate layers - true red/cyan channel split is the
           recognizable "glitch" language, kept separate from the site palette
           on purpose so the effect still reads instantly as a glitch */
        .glitch-layer {
          position: absolute;
          inset: 0;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          pointer-events: none;
          mix-blend-mode: screen;
        }
      `}</style>

      {/* Starfield background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* ============ PRELOADER ============ */}
      {showPreloader && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          <div ref={leftPanelRef} className="absolute top-0 left-0 w-1/2 h-full bg-[#0a0a0c]" />
          <div ref={rightPanelRef} className="absolute top-0 right-0 w-1/2 h-full bg-[#0a0a0c]" />

          <span ref={(el) => (hudRefs.current[0] = el)} className="hud-text top-8 left-8">SYS://C3-INIT</span>
          <span ref={(el) => (hudRefs.current[1] = el)} className="hud-text top-8 right-8">19.07.2026 // 07:53</span>
          <span ref={(el) => (hudRefs.current[2] = el)} className="hud-text bottom-8 left-8">BOOT COMPLETE</span>
          <span ref={(el) => (hudRefs.current[3] = el)} className="hud-text bottom-8 right-8">AUTHORIZED ACCESS</span>
          <span ref={(el) => (hudRefs.current[4] = el)} className="hud-text" style={{ top: '50%', left: '4%' }}>
            EXECUTE PROGRAM
          </span>

          {/* Ring border IS the loader - "C3" sits static in the center */}
          <div
            ref={ringGroupRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          >
            <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
              <circle
                cx="56"
                cy="56"
                r={RING_RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="2"
              />
              <circle
                ref={progressRingRef}
                cx="56"
                cy="56"
                r={RING_RADIUS}
                fill="none"
                stroke="#ADEFD1"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="font-display font-bold text-white absolute" style={{ fontSize: '22px' }}>
              C3
            </span>
          </div>
        </div>
      )}

      {/* Navbar */}
      <header className="relative z-20 flex items-center justify-between px-10 py-6 font-body">
        <a href="/" className="font-display font-bold text-lg text-[#f3f1ee] tracking-wide">
          C3
        </a>

        <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-full p-2 backdrop-blur-md">
          <a href="#home" className="px-4 py-2 text-sm font-semibold rounded-full bg-[#f3f1ee] text-[#0a0a0c]">Home</a>
          {['About', 'Join Us', 'Events', 'Team', 'Contact'].map((label) => (
            <motion.a
              key={label}
              href={`#${label.toLowerCase().replace(' ', '')}`}
              initial="rest"
              whileHover="hover"
              animate="rest"
              className="relative px-4 py-2 text-sm font-semibold rounded-full text-[#9a978f]"
            >
              <motion.span
                variants={{ rest: { color: '#9a978f' }, hover: { color: '#f3f1ee' } }}
                transition={{ duration: 0.2 }}
              >
                {label}
              </motion.span>
              {/* Underline draws in from the center outward on hover, rather
                  than just swapping text color */}
              <motion.span
                variants={{
                  rest: { scaleX: 0, opacity: 0 },
                  hover: { scaleX: 1, opacity: 1 },
                }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ originX: 0.5, background: 'linear-gradient(90deg, #ADEFD1, #4f9dbd)' }}
                className="absolute left-3 right-3 bottom-1.5 h-[1.5px] rounded-full"
              />
            </motion.a>
          ))}
        </nav>

        <motion.a
          href="/login"
          whileHover={{ scale: 1.05, boxShadow: '0 0 22px rgba(173,239,209,0.35)' }}
          transition={{ duration: 0.25 }}
          className="bg-white text-[#0a0a0c] text-sm font-bold px-6 py-3 rounded-full"
        >
          Member Login
        </motion.a>
      </header>

      {/* Hero content - heading now leads, tagline moved to close after the CTAs.
          min-h bumped past 100vh so the section has more room to breathe and
          there's a clear scroll cue pointing into the next section. */}
      <section
        id="home"
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 min-h-[115vh] pt-24 pb-32 font-body"
      >
        <div ref={headingWrapRef} className="relative inline-block mb-2">
          <h1
            ref={headingRef}
            className="grad-heading font-display font-bold leading-tight"
            style={{ fontSize: 'clamp(44px, 7vw, 88px)' }}
          >
            Campus to Corporate
          </h1>

          {/* Glitch duplicate layers - hidden until the strike, then snap out and back */}
          <h1
            ref={glitchRedRef}
            aria-hidden="true"
            className="glitch-layer font-display font-bold leading-tight"
            style={{ fontSize: 'clamp(44px, 7vw, 88px)', background: '#ff3b3b' }}
          >
            Campus to Corporate
          </h1>
          <h1
            ref={glitchCyanRef}
            aria-hidden="true"
            className="glitch-layer font-display font-bold leading-tight"
            style={{ fontSize: 'clamp(44px, 7vw, 88px)', background: '#3bd9ff' }}
          >
            Campus to Corporate
          </h1>

          {/* Lightning bolt - centered, striking through the heading */}
          <svg
            ref={boltRef}
            viewBox="0 0 600 160"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ filter: 'drop-shadow(0 0 3px #ADEFD1) drop-shadow(0 0 6px #4f9dbd)' }}
          >
            <path
              ref={mainStrokeRef}
              d="M 340 0 L 300 45 L 335 50 L 260 105 L 290 108 L 210 160"
              fill="none"
              stroke="#ADEFD1"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              ref={branch1Ref}
              d="M 335 50 L 385 68 L 405 60"
              fill="none"
              stroke="#7fd8b8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              ref={branch2Ref}
              d="M 290 108 L 245 122 L 230 145"
              fill="none"
              stroke="#4f9dbd"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

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
          <motion.a
            href="/register"
            whileHover={{ scale: 1.05, boxShadow: '0 0 24px rgba(173,239,209,0.35)' }}
            transition={{ duration: 0.25 }}
            className="bg-white text-[#0a0a0c] font-bold px-8 py-4 rounded-full"
          >
            Join C3
          </motion.a>
          <motion.a
            href="#about"
            whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.06)' }}
            transition={{ duration: 0.25 }}
            className="border border-white/20 text-[#f3f1ee] font-semibold px-8 py-4 rounded-full"
          >
            Learn More
          </motion.a>
        </div>

        {/* Tagline moved here - closing line under the CTAs */}
        <div ref={taglineRef} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ADEFD1]" />
          <span className="font-hud text-xs uppercase tracking-[0.25em] text-[#9a978f]">
            Learn. Collaborate. Grow.
          </span>
        </div>

        {/* Scroll cue - the extra hero height needs a signal that there's more below */}
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
    </div>
  );
};

export default Hero;